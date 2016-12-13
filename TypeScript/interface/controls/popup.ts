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

        let popupContent = ((typeof options == 'function') ? options() : options);
        for (let index: number = 0; index < popupContent.length; index++) {
            let item = document.createElement('div');
            item.className = 'PopupOption';
            let itemLabel = document.createTextNode(popupContent[index].label);
            item.appendChild(itemLabel);
			
            //Javascript closure : create an object to avoid closure issues
            function ItemClicked(popup, callback) {
                this.popup = popup;
                this.callbackFunction = callback;
                this.Callback = function () {
                    var self = this;
                    return function () {
                        //Call the functino
                        self.callbackFunction();
						Popup.DestroyCurrent();
                    }
                }
            }

            item.onclick = new ItemClicked(this.popupContainer, popupContent[index].callback).Callback();
            this.popupContainer.appendChild(item);
        }
    }

    private static DestroyCurrent(): void {
        if (this.current) {
            let popupElement = this.current.GetElement();
            popupElement.parentNode.removeChild(popupElement);
        }
        this.current = null;
    }

    static CreatePopup(owner: Control, options): Popup {
        Popup.DestroyCurrent();
        this.current = new Popup(owner, options);
        return this.current;
    }

    GetElement(): HTMLElement {
        return this.popupContainer;
    }
}