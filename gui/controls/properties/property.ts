/// <reference path="../control.ts" />

abstract class Property implements Control {
	owner: Properties;

	constructor(public name: string, protected changeHandler: PropertyChangeHandler) {
	}

	abstract GetElement(): HTMLElement;
	abstract GetValue(): any;

	NotifyChange() {
		let value = this.GetValue();
		if (value !== null) {
			if (this.changeHandler) {
				this.changeHandler(value);
			}
			if (this.owner) {
				this.owner.NotifyChange(this);
			}
		}
	}
}

interface PropertyChangeHandler {
	(value: any);
}