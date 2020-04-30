var Popup = (function () {
    function Popup(owner, actions) {
        this.owner = owner;
        this.actions = actions;
        this.popupContainer = document.createElement('div');
        this.popupContainer.className = 'Popup';
        this.popupContainer.id = 'Popup';
        var rect = owner.GetElement().getBoundingClientRect();
        this.popupContainer.style.top = rect.bottom + 'px';
        this.popupContainer.style.left = rect.left + 'px';
        this.popupContainer.onmouseleave = function () {
            Popup.DestroyCurrent();
        };
        document.body.appendChild(this.popupContainer);
        this.items = [];
        var popupContent = ((typeof actions == 'function') ? actions() : actions);
        for (var index = 0; index < popupContent.length; index++) {
            var popupItem = new PopupItem(popupContent[index]);
            this.items.push(PopupItem);
            this.popupContainer.appendChild(popupItem.GetElement());
        }
    }
    Popup.DestroyCurrent = function () {
        if (this.current) {
            var popupElement = this.current.GetElement();
            popupElement.parentNode.removeChild(popupElement);
        }
        this.current = null;
    };
    Popup.CreatePopup = function (owner, actions) {
        Popup.DestroyCurrent();
        this.current = new Popup(owner, actions);
        return this.current;
    };
    Popup.prototype.GetElement = function () {
        return this.popupContainer;
    };
    return Popup;
}());
//# sourceMappingURL=popup.js.map