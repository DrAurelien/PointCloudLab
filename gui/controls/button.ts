/// <reference path="control.ts" />
/// <reference path="hint.ts" />
/// <reference path="../../controler/actions/action.ts" />


class Button implements Control {
    button: HTMLDivElement;
	hint: Hint;
	buttonLabel: Text;

	constructor(private action: Action) {
        this.button = document.createElement('div');
        this.button.className = 'Button';
		let namePattern = /(?:\[Icon\:(.*)\]\s*)?(.*)/i;
		let name = namePattern.exec(action.GetLabel(false));
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

		if (action.hintMessage) {
			this.hint = new Hint(this, action.hintMessage);
		}

		if (action) {
			this.button.onclick = function (event) { action.Run() };
		}

		this.UpdateEnabledState();
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

	UpdateEnabledState() {
		if (this.action) {
			this.button.setAttribute('enabled', this.action.Enabled() ? '1' : '0');
        }
	}
}