/// <reference path="control.ts" />
/// <reference path="button.ts" />


class ComboBox implements Control {
	private button: Button;

	constructor(label: string, actions: Action[] | ActionsProvider, hintMessage?: string) {
		var self = this;
		this.button = new Button(label, function () {
			let options: Action[];
			if (Action.IsActionProvider(actions)) {
				options = (actions as ActionsProvider).GetActions();
			}
			else {
				options = actions as Action[];
			}
			if (options && options.length) {
				Popup.CreatePopup(self.button, options);
			}
		}, hintMessage);
	}

	GetElement(): HTMLElement {
		return this.button.GetElement();
	}
}