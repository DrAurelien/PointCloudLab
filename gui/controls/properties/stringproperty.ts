/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />


class StringProperty extends PropertyWithValue<string> {
	constructor(name: string, value: PropertyValueProvider<string>, handler: PropertyChangeHandler) {
		super(name, 'text', value, handler);
	}

	GetValue(): string {
		return this.input.value;
	}
}