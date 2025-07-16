export function log(label: string, value: unknown, isError: boolean = false): void {
	let consoleLevel: (...data: Array<any>) => void;

	consoleLevel = console.log;

	if (isError) {
		consoleLevel = console.error;
	}

	consoleLevel("----------------------");
	consoleLevel(`▶ ${label}`);

	console.dir(value, { depth: null, colors: true });
}
