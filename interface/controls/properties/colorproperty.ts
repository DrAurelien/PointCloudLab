class ColorProperty extends PropertyWithValue
{
	constructor(name: string, value: number[], handler: PropertyChangeHandler)
	{
		super(name, 'color', ColorProperty.RGBToStr(value), handler);
	}

	private static RGBToStr(rgb: number[]): string {
		let result = '#' +
			StringUtils.LeftPad((rgb[0] * 255).toString(16), '0', 2) +
			StringUtils.LeftPad((rgb[1] * 255).toString(16), '0', 2) +
			StringUtils.LeftPad((rgb[2] * 255).toString(16), '0', 2);
		return result;
	}

	private static StrToRGB(str: string): number[] {
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

	GetValue(): number[] {
		return ColorProperty.StrToRGB(this.input.value);
	}
}