/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />


class NumberProperty extends PropertyWithValue {
	constructor(name: string, value: number, handler: PropertyChangeHandler) {
		super(name, 'text', value.toString(), handler);
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