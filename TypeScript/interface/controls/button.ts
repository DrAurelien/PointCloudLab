class Button implements Control {
    button: HTMLDivElement;
	hint: Hint;

    constructor(label: string, callback: Function, hintMessage? : string) {
        this.button = document.createElement('div');
        this.button.className = 'Button';
		let namePattern = /(?:\[Icon\:(.*)\]\s*)?(.*)/i;
		let name = namePattern.exec(label);
		let buttonLabel : any = document.createTextNode(name[2]);
		if (name[1]) {
			let icon = document.createElement('i');
			icon.className = 'ButtonIcon fa fa-' + name[1];
			let nameContainer = document.createElement('span');
			nameContainer.appendChild(icon);
			nameContainer.appendChild(buttonLabel);
			buttonLabel = nameContainer;
		}
        this.button.appendChild(buttonLabel);

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
}