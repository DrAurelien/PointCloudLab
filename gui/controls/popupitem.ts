/// <reference path="control.ts" />
/// <reference path="hint.ts" />
/// <reference path="../../controler/actions/action.ts" />


class PopupItem implements Control {
	item: HTMLDivElement;
	hint: Hint;

	constructor(private action: Action) {
		this.item = document.createElement('div');
		if (action) {
			this.item.className = 'PopupOption';
			if (action.Enabled()) {
				this.item.onclick = this.ItemClicked(action);
			}
			else {
				this.item.className += 'Inactive';
			}

			let itemLabel = document.createTextNode(action.label);
			this.item.appendChild(itemLabel);

			if (action.hintMessage) {
				this.hint = new Hint(this, action.hintMessage);
			}
		}
		else {
			this.item.className = 'PopupSeparator';
		}
	}

	private ItemClicked(action: Action): (event: MouseEvent) => any {
		let self = this;
		return function () {
			action.Run();
			if (self.hint) {
				self.hint.Hide();
			}
			Popup.DestroyCurrent();
		}
	}

	GetElement(): HTMLElement {
		return this.item;
	}
}