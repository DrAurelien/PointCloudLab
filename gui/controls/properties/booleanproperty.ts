/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />


class BooleanProperty extends PropertyWithValue<boolean> {
	constructor(name: string, value: PropertyValueProvider<boolean>, handler: PropertyChangeHandler) {
		super(name, 'checkbox', value, handler);

		this.input.checked = value();
	}

	Refresh() {
		this.input.checked = this.value();
	}

	GetValue(): boolean {
		return this.input.checked;
	}
}