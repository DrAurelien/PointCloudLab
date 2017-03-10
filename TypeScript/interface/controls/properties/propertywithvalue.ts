abstract class PropertyWithValue extends Property
{
	private container: HTMLDivElement;
	protected input: HTMLInputElement;

	constructor(name: string, inputType: string, value: string, changeHandler: PropertyChangeHandler) {
		super(name, changeHandler);

		let self = this;
		this.container = document.createElement('div');
		this.input = document.createElement('input');
		this.input.type = inputType;
		this.input.width = '20';
		this.input.className = 'PropertyValue';
		this.input.value = value;
		this.input.onchange = (ev) => self.NotifyChange();
		this.container.appendChild(this.input);
	}

	GetElement(): HTMLElement {
		return this.container;
	}

	abstract GetValue(): any;
}