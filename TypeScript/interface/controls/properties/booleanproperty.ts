class BooleanProperty extends PropertyWithValue
{
	constructor(name: string, value: boolean, handler: PropertyChangeHandler)
	{
		super(name, 'checkbox', value.toString(), handler);
		
		this.input.checked = value;
	}

	GetValue(): boolean {
		return this.input.checked;
	}
}