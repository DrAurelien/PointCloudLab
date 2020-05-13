/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />


class NumberInRangeProperty extends PropertyWithValue<number> {
	constructor(name: string, value: PropertyValueProvider<number>, min: number, max: number, step: number, handler: PropertyChangeHandler) {
		super(name, 'range', value, handler);

		this.input.min = min.toString();
		this.input.max = max.toString();
		this.input.step = step.toString();
	}

	GetValue(): number {
		try {
			return parseFloat(this.input.value);
		}
		catch (ex) {
			return null;
		}
	}
}