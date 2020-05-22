/// <reference path="property.ts" />

interface PropertyValueProvider<T> {
	(): T;
}

abstract class PropertyWithValue<T> extends Property {
	private container: HTMLDivElement;
	protected input: HTMLInputElement;

	// value() might be called anytime, to refresh the control displayed value so that its refelect that actual value
	constructor(name: string, inputType: string, protected value: PropertyValueProvider<T>, changeHandler: PropertyChangeHandler) {
		super(name, changeHandler);

		let self = this;
		this.container = document.createElement('div');
		this.input = document.createElement('input');
		this.input.type = inputType;
		this.input.width = 20;
		this.input.className = 'PropertyValue';
		this.input.value = value().toString();
		this.input.onchange = (ev) => self.NotifyChange();
		this.container.appendChild(this.input);

		if (!changeHandler) {
			this.SetReadonly();
		}
	}

	Refresh() {
		this.input.value = this.value().toString();
	}

	GetElement(): HTMLElement {
		return this.container;
	}

	SetReadonly(value: boolean = true) {
		this.input.readOnly = value;
		this.input.className = 'PropertyValue' + (value ? 'Readonly' : '');
	}

	abstract GetValue(): any;
}