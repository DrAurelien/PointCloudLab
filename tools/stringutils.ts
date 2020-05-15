class StringUtils {
	static LeftPad(str: string, paddingChar: string, decimals: number) {
		let result = str;
		while (result.length < decimals) {
			result = paddingChar + result;
		}
		return result;
	}

	static RGBiToStr(rgb: ArrayLike<number>): string {
		let result = '#' +
			StringUtils.LeftPad((rgb[0]).toString(16), '0', 2) +
			StringUtils.LeftPad((rgb[1]).toString(16), '0', 2) +
			StringUtils.LeftPad((rgb[2]).toString(16), '0', 2);
		return result;
	}

	static RGBfToStr(rgb: ArrayLike<number>): string {
		return StringUtils.RGBiToStr([
			Math.round(255 * rgb[0]),
			Math.round(255 * rgb[1]),
			Math.round(255 * rgb[2])
		]);
	}

	static StrToRGB(str: string): number[] {
		let red = str.substr(1, 2);
		let green = str.substr(3, 2);
		let blue = str.substr(5, 2);
		let result = [
			parseInt(red, 16) / 255,
			parseInt(green, 16) / 255,
			parseInt(blue, 16) / 255
		];
		return result;
	}
}