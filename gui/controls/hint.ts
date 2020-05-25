/// <reference path="control.ts" />


class Hint implements Control {
	container: HTMLDivElement;
	message: HTMLDivElement;

	static current: Hint = null;

	constructor(public owner: Control, message: string) {
		this.container = document.createElement('div');
		this.container.className = 'Hint';

		this.container.appendChild(document.createTextNode(message));

		if (owner) {
			let element = this.owner.GetElement();
			let self = this;
			element.onmouseenter = (ev) => { self.Show() };
			element.onmouseleave = (ev) => { self.Hide() };
		}
	}

	Show() {
		if (Hint.current) {
			Hint.current.Hide();
		}
		if (!this.container.parentElement) {
			document.body.appendChild(this.container);
		}
		Hint.current = this;
	}

	Hide() {
		if (this.container.parentElement) {
			this.container.parentElement.removeChild(this.container);
		}
		if (Hint.current == this) {
			Hint.current = null;
		}
	}

	GetElement(): HTMLElement {
		return this.container;
	}
}

class TemporaryHint extends Hint {
	static DisplayDuration = 4000;

	constructor(message: string) {
		super(null, message);

		let self = this;
		this.Show();
		setTimeout(() => self.Hide(), TemporaryHint.DisplayDuration)
	}
}