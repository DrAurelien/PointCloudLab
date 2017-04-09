class NumberInRangeProperty extends PropertyWithValue
{
	constructor(name: string, value: number, private min: number, private max: number, handler: PropertyChangeHandler) {
		super(name, 'range', value.toString(), handler);

		this.input.min = min.toString();
		this.input.max = max.toString();
		this.input.step = '0.1';
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