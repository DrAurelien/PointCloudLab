class StringProperty extends PropertyWithValue
{
	constructor(name: string, value: string, handler : PropertyChangeHandler)
	{
		super(name, 'text', value, handler);
	}

	GetValue(): string {
		return this.input.value;
	}
}