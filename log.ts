export function log(label: string, value: unknown, isError: boolean = false): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let consoleLevel: (...data: Array<any>) => void;

	consoleLevel = console.log;

	if (isError) {
		consoleLevel = console.error;
	}

	consoleLevel("----------------------");
	consoleLevel(`▶ ${label}`);

	console.dir(value, { depth: null, colors: true });
}
