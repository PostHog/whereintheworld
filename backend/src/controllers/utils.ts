
export function parseIntNullable(string: string) {
	if (isNaN(parseInt(string))) {
			return undefined
	}
	return parseInt(string)
}