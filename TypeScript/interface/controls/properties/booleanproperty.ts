class BooleanProperty extends Property
{
	container: HTMLDivElement;
	input: HTMLInputElement;

	constructor(name: string, value: boolean, handler: PropertyChangeHandler)
	{
		super(name, handler);

		let self = this;
		this.container = document.createElement('div');
		this.input = document.createElement('input');
		this.input.type = 'checkbox';
		this.input.className = 'PropertyValue';
		this.input.checked = value;
		this.input.onchange = (ev) => self.NotifyChange();
		this.container.appendChild(this.input);
	}

	GetElement(): HTMLElement {
		return this.container;
	}

	GetValue(): boolean {
		return this.input.checked;
	}
}