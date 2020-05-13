/// <reference path="control.ts" />


class Hint implements Control {
	container: HTMLDivElement;
	message: HTMLDivElement;

	constructor(public owner: Control, message) {
		this.container = document.createElement('div');
		this.container.className = 'Hint';

		this.container.appendChild(document.createTextNode(message));

		let element = this.owner.GetElement();
		let self = this;
		element.onmouseenter = (ev) => { self.Show() };
		element.onmouseleave = (ev) => { self.Hide() };
	}

	Show() {
		if (!this.container.parentElement) {
			document.body.appendChild(this.container);
		}
	}

	Hide() {
		if (this.container.parentElement) {
			this.container.parentElement.removeChild(this.container);
		}
	}

	GetElement(): HTMLElement {
		return this.container;
	}
}