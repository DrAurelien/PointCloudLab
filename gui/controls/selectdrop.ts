/// <reference path="control.ts" />


class SelectDrop implements Control, ActionListener {
	private button: Button;

	constructor(label: string, options: Action[], selected: number, hintMessage?: string) {
		let self = this;

		for (let index = 0; index < options.length; index++) {
			options[index].AddListener(this);
		}
		this.button = new Button(new SimpleAction(label,
			() => Popup.CreatePopup(self.button, self.GetAvailableOptions(options)),
			hintMessage
		));
		this.SetCurrent(options[selected].GetLabel(false));
	}

	GetAvailableOptions(options: Action[]): Action[] {
		let availableOptions: Action[] = [];
		for (let index = 0; index < options.length; index++) {
			let option = options[index];
			if (option.GetLabel(false) !== this.button.GetLabel()) {
				availableOptions.push(option);
			}
		}
		return availableOptions;
	}

	GetElement(): HTMLElement {
		return this.button.GetElement();
	}

	SetCurrent(current: string) {
		this.button.SetLabel(current);
	}

	OnTrigger(action: Action) {
		this.SetCurrent(action.GetLabel(false));
	}
}