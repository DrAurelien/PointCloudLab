/// <reference path="control.ts" />
/// <reference path="hint.ts" />


class Button implements Control {
    button: HTMLDivElement;
	hint: Hint;
	buttonLabel: Text;

    constructor(label: string, callback: Function, hintMessage? : string) {
        this.button = document.createElement('div');
        this.button.className = 'Button';
		let namePattern = /(?:\[Icon\:(.*)\]\s*)?(.*)/i;
		let name = namePattern.exec(label);
		this.buttonLabel = document.createTextNode(name[name.length - 1]);
		let nameContainer: any = this.buttonLabel;
		if (name[1]) {
			let icon = document.createElement('i');
			icon.className = 'ButtonIcon fa fa-' + name[1];
			nameContainer = document.createElement('span');
			nameContainer.appendChild(icon);
			nameContainer.appendChild(this.buttonLabel);
		}
		this.button.appendChild(nameContainer);

		if (hintMessage) {
			this.hint = new Hint(this, hintMessage);
		}

        if (callback) {
            this.button.onclick = function (event) { callback() };
        }
    }

    GetElement(): HTMLElement {
        return this.button;
	}

	SetLabel(value: string) {
		this.buttonLabel.data = value;
	}

	GetLabel() : string {
		return this.buttonLabel.data;
	}
}