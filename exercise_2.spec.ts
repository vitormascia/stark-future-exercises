/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import axios from "axios";
import { BigNumber } from "bignumber.js";
import {
	ReasonPhrases,
	StatusCodes,
} from "http-status-codes";
import * as imageSizeModule from "image-size";

import {
	fetchWithConcurrency,
	MAX_QUEUE_CONCURRENCY,
} from "./exercise_2";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("image-size", () => ({
	__esModule: true,
	imageSize: jest.fn(),
}));
const mockedImageSize = imageSizeModule.imageSize as jest.MockedFunction<typeof imageSizeModule.imageSize>;

describe("Stark Future Exercise 2 (JavaScript Concurrency) Tests", () => {
	let urls: Array<string>;
	let urlsArrayLength: number;

	beforeEach(() => {
		jest.clearAllMocks();

		const URLS_ARRAY_MIN_LENGTH = 25;
		const URLS_ARRAY_MAX_LENGTH = 50;

		urlsArrayLength = faker.number.int({
			min: URLS_ARRAY_MIN_LENGTH,
			max: URLS_ARRAY_MAX_LENGTH,
		});

		urls = Array.from(
			{ length: urlsArrayLength },
			(): string => faker.image.urlPicsumPhotos(),
		);

		mockedImageSize.mockReturnValue({
			width: 1024,
			height: 768,
			orientation: 1,
			type: "jpg",
		});
	});

	it("Fetches all URLs", async () => {
		mockedAxios.get.mockImplementation(async (url: string): Promise<any> => {
			return Promise.resolve({
				data: Buffer.from(url),
				status: StatusCodes.OK,
				statusText: ReasonPhrases.OK,
				headers: {},
				config: {},
				request: {},
			});
		});

		const results = await fetchWithConcurrency(urls);

		expect(results.length).toStrictEqual(urls.length);

		for (const result of results) {
			expect(result).toHaveProperty("bufferSize");
			expect(result).toHaveProperty("dimensions");
		}
	});

	it("Respects concurrency", async () => {
		let running = 0;
		let maxConcurrent = 0;

		mockedAxios.get.mockImplementation(async (url: string): Promise<any> => {
			running++;
			maxConcurrent = Math.max(maxConcurrent, running);
			/* Simulate network latency */
			await new Promise((r) => setTimeout(r, 100));
			running--;

			return Promise.resolve({
				data: Buffer.from(url),
				status: StatusCodes.OK,
				statusText: ReasonPhrases.OK,
				headers: {},
				config: {},
				request: {},
			});
		});

		await fetchWithConcurrency(urls);

		expect(maxConcurrent).toBeLessThanOrEqual(MAX_QUEUE_CONCURRENCY);
	});

	it("Preserves order of results", async () => {
		const i = new BigNumber(urlsArrayLength)
			.dividedBy(2)
			.integerValue(BigNumber.ROUND_DOWN)
			.toNumber();

		mockedAxios.get.mockImplementation(async (url: string): Promise<any> => {
			const delayInMilliseconds = url === urls[i] ? 100 : 10;

			/* Simulate network latency */
			await new Promise((r) => setTimeout(r, delayInMilliseconds));

			return Promise.resolve({
				data: Buffer.from(url),
				status: StatusCodes.OK,
				statusText: ReasonPhrases.OK,
				headers: {},
				config: {},
				request: {},
			});
		});

		const results = await fetchWithConcurrency(urls);

		for (let i = 0; i < urls.length; i++) {
			const expectedBuffer = Buffer.from(urls[i]);

			expect(results[i]).toHaveProperty("bufferSize", expectedBuffer.byteLength || expectedBuffer.length);
			expect(results[i]).toHaveProperty("dimensions");
		}
	});

	it("Handles failures", async () => {
		const i = new BigNumber(urlsArrayLength)
			.dividedBy(2)
			.integerValue(BigNumber.ROUND_DOWN)
			.toNumber();

		mockedAxios.get.mockImplementation(async (url: string): Promise<any> => {
			if (url === urls[i]) {
				throw new Error("Network error");
			}

			/* Simulate network latency */
			await new Promise((r) => setTimeout(r, 100));

			return Promise.resolve({
				data: Buffer.from(url),
				status: StatusCodes.OK,
				statusText: ReasonPhrases.OK,
				headers: {},
				config: {},
				request: {},
			});
		});

		const results = await fetchWithConcurrency(urls);

		expect(results[i]).toBeInstanceOf(Error);
		expect((results[i] as Error).message).toStrictEqual("Network error");
	});
});
