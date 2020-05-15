/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
/// <reference path="../../../tools/stringutils.ts" />


class ColorProperty extends PropertyWithValue<string>
{
	constructor(name: string, private colorvalue: PropertyValueProvider<number[]>, handler: PropertyChangeHandler)
	{
		super(name, 'color', () => StringUtils.RGBfToStr(colorvalue()), handler);
	}

	GetValue(): number[] {
		return StringUtils.StrToRGB(this.input.value);
	}
}