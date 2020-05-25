/// <reference path="control.ts" />
/// <reference path="popupitem.ts" />
/// <reference path="../../controler/actions/action.ts" />


class Popup implements Control {
	popupContainer: HTMLDivElement;
	items: any[];
	static current: Popup;

	constructor(owner: Control | HTMLElement, private actions: any) {

		this.popupContainer = document.createElement('div');
		this.popupContainer.className = 'Popup';
		this.popupContainer.id = 'Popup';

		let element;
		if (owner instanceof HTMLElement)
			element = owner as HTMLElement;
		else
			element = (owner as Control).GetElement();
		let rect = element.getBoundingClientRect();
		this.popupContainer.style.top = rect.bottom + 'px';
		this.popupContainer.style.left = rect.left + 'px';
		this.popupContainer.onmouseleave = function () {
			Popup.DestroyCurrent();
		}

		document.body.appendChild(this.popupContainer);

		this.items = [];
		let popupContent: Action[] = <Action[]>((typeof actions == 'function') ? actions() : actions);
		for (let index: number = 0; index < popupContent.length; index++) {
			let popupItem = new PopupItem(popupContent[index]);
			this.items.push(PopupItem);
			this.popupContainer.appendChild(popupItem.GetElement());
		}
	}

	static DestroyCurrent(): void {
		if (this.current) {
			let popupElement = this.current.GetElement();
			popupElement.parentNode.removeChild(popupElement);
		}
		this.current = null;
	}

	static CreatePopup(owner: Control | HTMLElement, actions: Action[]): Popup {
		Popup.DestroyCurrent();
		this.current = new Popup(owner, actions);
		return this.current;
	}

	GetElement(): HTMLElement {
		return this.popupContainer;
	}
}
