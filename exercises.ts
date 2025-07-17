import { faker } from "@faker-js/faker";
import BigNumber from "bignumber.js";

import { getNthLicensePlate } from "./exercise_1.ts";
import { fetchWithConcurrency } from "./exercise_2.ts";
import { log } from "./log.ts";

const LICENSE_PLATE_MIN_INDEX = 0;
const LICENSE_PLATE_MAX_INDEX = 501_363_135;
const licensePlateIndex = faker.number.int({
	min: LICENSE_PLATE_MIN_INDEX,
	max: LICENSE_PLATE_MAX_INDEX,
});

const start = performance.now();

const licensePlate = getNthLicensePlate(licensePlateIndex);

const end = new BigNumber(performance.now());
const durationInSeconds = end.minus(start)
	.dividedBy(1000)
	.toFixed(2);

log("EXERCISE_1::LICENSE_PLATES", {
	durationInSeconds,
	metadata: {
		licensePlate,
		LICENSE_PLATE_MIN_INDEX,
		LICENSE_PLATE_MAX_INDEX,
		licensePlateIndex,
	},
});

/* ------------------------------------------------ */
/* ------------------------------------------------ */
/* ------------------------------------------------ */

const URLS_ARRAY_MIN_LENGTH = 25;
const URLS_ARRAY_MAX_LENGTH = 50;
const urlsArrayLength = faker.number.int({
	min: URLS_ARRAY_MIN_LENGTH,
	max: URLS_ARRAY_MAX_LENGTH,
});
const urls: Array<string> = Array.from(
	{ length: urlsArrayLength },
	(): string => faker.image.urlPicsumPhotos(),
);

/*
	Usage of a void async IIFE just to avoid Warning while running the code

	Warning: Detected unsettled top-level await at /.../stark-future-exercises/exercises.ts:{n}
	const r = await fetchWithConcurrency(urls);
*/
void (async (): Promise<void> => {
	const start = performance.now();

	const fetchWithConcurrencyResults = await fetchWithConcurrency(urls);

	const end = new BigNumber(performance.now());
	const durationInSeconds = end.minus(start)
		.dividedBy(1000)
		.toFixed(2);

	log("EXERCISE_2::JAVASCRIPT_CONCURRENCY", {
		durationInSeconds,
		metadata: {
			fetchWithConcurrencyResults,
			URLS_ARRAY_MIN_LENGTH,
			URLS_ARRAY_MAX_LENGTH,
			urlsArrayLength,
			urls,
		},
	});
})();
