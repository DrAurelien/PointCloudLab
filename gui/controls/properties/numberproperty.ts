/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />


class NumberProperty extends PropertyWithValue<number> {
	constructor(name: string, value: PropertyValueProvider<number>, handler: PropertyChangeHandler) {
		super(name, 'text', value, handler);
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