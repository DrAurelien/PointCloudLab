class Popup implements Control
{
    popupContainer: HTMLDivElement;
    static current: Popup;

    constructor(public owner: Control, options: any) {

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

        let popupContent : Action[] = <Action[]>((typeof options == 'function') ? options() : options);
        for (let index: number = 0; index < popupContent.length; index++) {
			let action = popupContent[index];

			let item = document.createElement('div');
			if (action) {
				item.className = 'PopupOption';
				if (action.HasAction()) {
					item.onclick = this.ItemClicked(action);
				}
				else {
					item.className += 'Inactive';
				}

				let itemLabel = document.createTextNode(action.label);
				item.appendChild(itemLabel);
			}
			else {
				item.className = 'PopupSeparator';
			}

            this.popupContainer.appendChild(item);
        }
    }

	private ItemClicked(action: Action): (event: MouseEvent) => any {
		return function () {
			action.Run();
			Popup.DestroyCurrent();
		}
	}

    private static DestroyCurrent(): void {
        if (this.current) {
            let popupElement = this.current.GetElement();
            popupElement.parentNode.removeChild(popupElement);
        }
        this.current = null;
    }

    static CreatePopup(owner: Control, options: Action[]): Popup {
        Popup.DestroyCurrent();
        this.current = new Popup(owner, options);
        return this.current;
    }

    GetElement(): HTMLElement {
        return this.popupContainer;
    }
}