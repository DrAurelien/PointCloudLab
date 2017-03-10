class StringUtils
{
	static LeftPad(str: string, paddingChar: string, decimals: number) {
		let result = str;
		while (result.length < decimals) {
			result = paddingChar + result;
		}
		return result;
	}
}