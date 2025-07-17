import BigNumber from "bignumber.js";

import { log } from "./log.ts";

const DIGITS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LICENSE_PLATE_LENGTH = 6;
const EMPTY_STRING = "";
const ZERO_PAD = "0";

function buildLicensePlateLetterChunk(
	licensePlateIndexOffset: BigNumber,
	numericCombinations: number,
	letterSuffixLength: number,
): string {
	log("BUILDING_LICENSE_PLATE_LETTER_CHUNK", {
		licensePlateIndexOffset,
		numericCombinations,
		letterSuffixLength,
	});

	const letterChunkSize = licensePlateIndexOffset
		.dividedBy(numericCombinations)
		.integerValue(BigNumber.ROUND_FLOOR);

	log("LETTER_CHUNK_SIZE", { letterChunkSize: letterChunkSize.toNumber() });

	let letterChunk = EMPTY_STRING;
	let letterChunkRemainder = letterChunkSize;

	/*
		Convert a number (@letterChunkRemainder) into a base-26 representation using the
		letters A-Z as "digits". This is very similar to how numbers are converted into
		decimal or hexadecimal, but here the base is 26, and the “digits” are letters
	*/
	for (let i = 0; i < letterSuffixLength; i++) {
		const letterIndex = letterChunkRemainder
			.mod(LETTERS.length)
			.toNumber();
		const letter = LETTERS[letterIndex];

		log("FOUND_LETTER", {
			letterIndex,
			letter,
			letterChunkRemainder,
		});

		letterChunk = `${letter}${letterChunk}`;

		log("PREPENDED_LETTER_TO_LETTER_CHUNK", { letterChunk });

		letterChunkRemainder = letterChunkRemainder
			.dividedBy(LETTERS.length)
			.integerValue(BigNumber.ROUND_FLOOR);

		log("LETTER_CHUNK_REMAINDER", { letterChunkRemainder });
	}

	return letterChunk;
}

function buildLicensePlateNumericChunk(
	licensePlateIndexOffset: BigNumber,
	numericCombinations: number,
	numericPrefixLength: number,
): string {
	log("BUILDING_LICENSE_PLATE_NUMERIC_CHUNK", {
		licensePlateIndexOffset,
		numericCombinations,
		numericPrefixLength,
	});

	const unpaddedNumericChunk = licensePlateIndexOffset
		.mod(numericCombinations)
		.toString();

	log("UNPADDED_NUMERIC_CHUNK", { unpaddedNumericChunk });

	// const numericChunk = unpaddedNumericChunk.padStart(numericPrefixLength, ZERO_PAD);
	const numericChunk = numericPrefixLength > 0
		? unpaddedNumericChunk.padStart(numericPrefixLength, ZERO_PAD)
		: EMPTY_STRING;

	log("BUILT_LICENSE_PLATE_NUMERIC_CHUNK", { numericChunk });

	return numericChunk;
}

export function getNthLicensePlate(licensePlateIndex: number): string {
	let licensePlateIndexOffset = new BigNumber(licensePlateIndex);

	log("SEARCHING_FOR_LICENSE_PLATE_BY_INDEX", { licensePlateIndex });

	for (
		let letterSuffixLength = 0;
		letterSuffixLength <= LICENSE_PLATE_LENGTH;
		letterSuffixLength++
	) {
		log(
			"ATTEMPT_LETTER_SUFFIX_LENGTH",
			{
				licensePlateIndexOffset: licensePlateIndexOffset.toNumber(),
				letterSuffixLength,
			},
		);

		const numericPrefixLength = new BigNumber(LICENSE_PLATE_LENGTH)
			.minus(letterSuffixLength)
			.toNumber();

		const numericCombinations = new BigNumber(DIGITS.length)
			.pow(numericPrefixLength)
			.toNumber();
		const letterCombinations = new BigNumber(LETTERS.length)
			.pow(letterSuffixLength)
			.toNumber();

		const amountOfCombinations = new BigNumber(numericCombinations)
			.times(letterCombinations)
			.toNumber();

		const nthFitsThisFormat = licensePlateIndexOffset.isLessThan(amountOfCombinations);

		log(
			`MEASURED_AMOUNT_OF_COMBINATIONS::NTH_${nthFitsThisFormat
				? "FITS"
				: "DOES_NOT_FIT"
			}_THIS_FORMAT`,
			{
				numericPrefixLength,
				numericCombinations,
				letterCombinations,
				amountOfCombinations,
				nthFitsThisFormat,
			},
		);

		if (nthFitsThisFormat) {
			const numericChunk = buildLicensePlateNumericChunk(
				licensePlateIndexOffset,
				numericCombinations,
				numericPrefixLength,
			);

			const letterChunk = buildLicensePlateLetterChunk(
				licensePlateIndexOffset,
				numericCombinations,
				letterSuffixLength,
			);

			const licensePlate = `${numericChunk}${letterChunk}`;

			log("FOUND_LICENSE_PLATE", { licensePlate });

			return licensePlate;
		}

		licensePlateIndexOffset = licensePlateIndexOffset.minus(amountOfCombinations);

		log("LICENSE_PLATE_INDEX_OFFSET", {
			licensePlateIndexOffset: licensePlateIndexOffset.toNumber(),
		});
	}

	const isError = true;

	log(
		"LICENSE_PLATE_INDEX_OUT_OF_RANGE",
		{ licensePlateIndex },
		isError,
	);

	throw new Error("License Plate Index out of range (must be < 501.363.136)");
}
