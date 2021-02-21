/// <reference path="control.ts" />
/// <reference path="button.ts" />


class ComboBox implements Control {
	private button: Button;

	constructor(label: string, actions: Action[] | ActionsProvider, isactive: Function = null, hintMessage?: string) {
		var self = this;
		this.button = new Button(new ActivableAction(label,
			() => {
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
			},
			isactive || (() => { true }),
			hintMessage
		));

		this.UpdateEnabledState();
	}

	GetElement(): HTMLElement {
		return this.button.GetElement();
	}

	UpdateEnabledState() {
		this.button.UpdateEnabledState();
    }
}