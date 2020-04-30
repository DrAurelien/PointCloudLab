class Popup implements Control
{
    popupContainer: HTMLDivElement;
	items: any[];
    static current: Popup;

    constructor(public owner: Control, private actions: any) {

        this.popupContainer = document.createElement('div');
        this.popupContainer.className = 'Popup';
        this.popupContainer.id = 'Popup';

        let rect = owner.GetElement().getBoundingClientRect();
        this.popupContainer.style.top = rect.bottom + 'px';
        this.popupContainer.style.left = rect.left + 'px';
        this.popupContainer.onmouseleave = function () {
            Popup.DestroyCurrent();
        }

        document.body.appendChild(this.popupContainer);

		this.items = [];
        let popupContent : Action[] = <Action[]>((typeof actions == 'function') ? actions() : actions);
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

    static CreatePopup(owner: Control, actions: Action[]): Popup {
        Popup.DestroyCurrent();
        this.current = new Popup(owner, actions);
        return this.current;
    }

    GetElement(): HTMLElement {
        return this.popupContainer;
    }
}
