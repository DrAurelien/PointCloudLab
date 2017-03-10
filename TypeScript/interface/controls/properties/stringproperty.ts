class StringProperty extends Property
{
	container: HTMLDivElement;
	input: HTMLInputElement;

	constructor(name: string, value: string, handler : PropertyChangeHandler)
	{
		super(name, handler);

		let self = this;
		this.container = document.createElement('div');
		this.input = document.createElement('input');
		this.input.type = 'text';
		this.input.width = '20';
		this.input.className = 'PropertyValue';
		this.input.value = value;
		this.input.onchange = (ev) => self.NotifyChange();
		this.container.appendChild(this.input);
	}

	GetValue(): any {
		return this.input.value;
	}

	GetElement(): HTMLElement {
		return this.container;
	}
}