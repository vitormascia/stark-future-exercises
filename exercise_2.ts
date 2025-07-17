import {
	AsyncWorker,
	queue,
	QueueObject,
} from "async";
import axios from "axios";
import { imageSize } from "image-size";
import { ISizeCalculationResult } from "image-size/types/interface";

import { log } from "./log.ts";

export interface FetchUrlJob {
	url: string;
	index: number;
}
export interface ImageMetadata {
	bufferSize: number;
	dimensions: ISizeCalculationResult
}
export type FetchWithConcurrencyResults = Array<ImageMetadata | Error>

export const MAX_QUEUE_CONCURRENCY = 10;

const createQueue = (results: FetchWithConcurrencyResults): QueueObject<FetchUrlJob> => {
	const worker: AsyncWorker<FetchUrlJob> =
		(job: FetchUrlJob, callback: (error?: Error) => void): void => {
			/**
			 * Setting worker as an async function does not work properly, thus the usage of
			 * an async IIFE within the worker is needed
			 *
			 * An async IIFE is an Immediately Invoked Function Expression that is also async.
			 * It's a way to use await inside a function that is not async itself (like a callback),
			 * by wrapping the logic in an async function and calling it immediately
			 */
			(async (): Promise<void> => {
				try {
					log("PROCESSING_JOB", { job });

					const { url, index } = job;

					const { data: imageBuffer } = await axios.get<Buffer>(url, {
						responseType: "arraybuffer",
					});

					const dimensions = imageSize(imageBuffer);

					const imageMetadata = {
						/*
							- @byteLength is the standard property of an @ArrayBuffer or @Buffer
							that tells the size in bytes
							- @length is commonly used in Node.js @Buffer objects, which have
							@length to give the byte size
							- Sometimes, depending on the environment or how the @Buffer is created
							(e.g., @Buffer vs @ArrayBuffer vs @Uint8Array), only one of these
							properties exists
						*/
						bufferSize: imageBuffer.byteLength || imageBuffer.length,
						dimensions,
					};

					results[index] = imageMetadata;

					log("FETCH_IMAGE_DATA", {
						job,
						dimensions,
					});
				} catch (error) {
					const err = error instanceof Error ? error : new Error(String(error));
					const { index } = job;

					results[index] = err;
				} finally {
					log("PROCESSED_JOB", { job });

					callback();
				}
			})().catch((error) => {
				const err = error instanceof Error ? error : new Error(String(error));
				const isError = true;

				log(
					"PROCESSING_JOB::ERROR",
					{
						job,
						error: {
							cause: err.cause,
							name: err.name,
							message: err.message,
							stack: err.stack,
						},
					},
					isError,
				);

				callback(err);
			});
		};

	const q = queue<FetchUrlJob>(worker, MAX_QUEUE_CONCURRENCY);

	q.empty((): void => {
		log("QUEUE_EMPTY::LAST_TASK_ASSIGNED_TO_WORKER", {});
	});

	q.drain(() => {
		log("QUEUE_DRAIN::ALL_WORKERS_ARE_FREE::ALL_TASKS_PROCESSED", {});
	});

	q.saturated((): void => {
		log("QUEUE_SATURATED::ALL_WORKERS_ARE_BUSY::NEW_TASKS_ARE_BEING_QUEUED_INSTEAD_OF_IMMEDIATELY_DISPATCHED", {});
	});

	return q;
};

export async function fetchWithConcurrency(urls: Array<string>): Promise<FetchWithConcurrencyResults> {
	const results: FetchWithConcurrencyResults = new Array(urls.length);

	const q = createQueue(results);

	for (const [index, url] of urls.entries()) {
		await q.push<FetchUrlJob>({ url, index });
	}

	return results;
}
