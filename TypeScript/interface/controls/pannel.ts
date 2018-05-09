class Pannel implements Container {
	protected pannel: HTMLDivElement;
	
	constructor(classname: string = "") {
		this.pannel = document.createElement('div');
		this.pannel.className = classname;
	}

	GetElement(): HTMLElement {
		return this.pannel;
	}

	AddControl(control: Control) {
		this.pannel.appendChild(control.GetElement());
	}

	RemoveControl(control: Control) {
		this.pannel.removeChild(control.GetElement());
	}

	Clear() {
		while (this.pannel.firstChild) {
			this.pannel.removeChild(this.pannel.firstChild);
		}
	}
}