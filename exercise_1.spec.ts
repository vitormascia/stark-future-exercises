import { faker } from "@faker-js/faker";

import { getNthLicensePlate } from "./exercise_1.ts";

describe("Stark Future Exercise 1 (License Plates) Tests", () => {
	it.each([
		[0, "000000"],
		[999_999, "999999"],
		[1_000_000, "00000A"],
		[1_099_999, "99999A"],
		[1_100_000, "00000B"],
		[1_199_999, "99999B"],
		[1_200_000, "00000C"],
		[1_299_999, "99999C"],
		[3_500_000, "00000Z"],
		[3_599_999, "99999Z"],
		[3_600_000, "0000AA"],
		[3_609_999, "9999AA"],
		[3_610_000, "0000AB"],
		[3_619_999, "9999AB"],
		[3_620_000, "0000AC"],
		[3_629_999, "9999AC"],
		[10_350_000, "0000ZZ"],
		[10_359_999, "9999ZZ"],
		[10_360_000, "000AAA"],
		[10_360_999, "999AAA"],
		[10_361_000, "000AAB"],
		[10_361_999, "999AAB"],
		[10_362_000, "000AAC"],
		[10_362_999, "999AAC"],
		[27_935_000, "000ZZZ"],
		[27_935_999, "999ZZZ"],
		[27_936_000, "00AAAA"],
		[27_936_099, "99AAAA"],
		[27_936_100, "00AAAB"],
		[27_936_199, "99AAAB"],
		[27_936_200, "00AAAC"],
		[27_936_299, "99AAAC"],
		[73_633_500, "00ZZZZ"],
		[73_633_599, "99ZZZZ"],
		[73_633_600, "0AAAAA"],
		[73_633_609, "9AAAAA"],
		[73_633_610, "0AAAAB"],
		[73_633_619, "9AAAAB"],
		[73_633_620, "0AAAAC"],
		[73_633_629, "9AAAAC"],
		[192_447_350, "0ZZZZZ"],
		[192_447_359, "9ZZZZZ"],
		[192_447_360, "AAAAAA"],
		[192_447_361, "AAAAAB"],
		[192_447_362, "AAAAAC"],
		[501_363_135, "ZZZZZZ"],
	])(
		"Given License Plate Index %j, License Plate is %j",
		(licensePlateIndex, licensePlate) => {
			expect(getNthLicensePlate(licensePlateIndex)).toStrictEqual(licensePlate);
		},
	);

	const LICENSE_PLATES_MIN_INDEX_OUT_OF_RANGE = 501_363_136;
	const licensePlateIndexesOutOfRange: Array<number> = Array.from(
		{ length: 20 },
		(): number => faker.number.int({
			min: LICENSE_PLATES_MIN_INDEX_OUT_OF_RANGE,
		}),
	);

	it.each(licensePlateIndexesOutOfRange.map((licensePlateIndexOutOfRange) => [licensePlateIndexOutOfRange]))(
		"Given License Plate Index %j, should throw error indicating License Plate Index out of range",
		(licensePlateIndex) => {
			expect(() => getNthLicensePlate(licensePlateIndex)).toThrow(Error);
			expect(() => getNthLicensePlate(licensePlateIndex)).toThrow("License Plate Index out of range (must be < 501.363.136)");
		},
	);
});
