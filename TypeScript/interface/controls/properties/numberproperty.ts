class NumberProperty extends StringProperty {
	constructor(name: string, value: number, handler: PropertyChangeHandler) {
		super(name, value.toString(), handler);
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