﻿/// <reference path="container.ts" />


class Toolbar implements Container {
	private toolbar: HTMLDivElement;

	constructor(classname: string = "Toolbar") {
		this.toolbar = document.createElement('div');
		this.toolbar.className = classname;
	}

	AddControl(control: Control): Control {
		let container = document.createElement('span');
		container.appendChild(control.GetElement());
		this.toolbar.appendChild(container);
		return control;
	}

	RemoveControl(control: Control) {
		let element = control.GetElement();

		for (var index = 0; index < this.toolbar.children.length; index++) {
			let container = this.toolbar.children[index];
			let current = container.firstChild;

			if (current === element) {
				this.toolbar.removeChild(container);
				return;
			}
		}
	}

	Clear() {
		while (this.toolbar.lastChild) {
			this.toolbar.removeChild(this.toolbar.lastChild);
		}
	}

	GetElement(): HTMLElement {
		return this.toolbar;
	}
}