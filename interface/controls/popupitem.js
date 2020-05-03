var PopupItem = /** @class */ (function () {
    function PopupItem(action) {
        this.action = action;
        this.item = document.createElement('div');
        if (action) {
            this.item.className = 'PopupOption';
            if (action.Enabled()) {
                this.item.onclick = this.ItemClicked(action);
            }
            else {
                this.item.className += 'Inactive';
            }
            var itemLabel = document.createTextNode(action.label);
            this.item.appendChild(itemLabel);
            if (action.hintMessage) {
                this.hint = new Hint(this, action.hintMessage);
            }
        }
        else {
            this.item.className = 'PopupSeparator';
        }
    }
    PopupItem.prototype.ItemClicked = function (action) {
        var self = this;
        return function () {
            action.Run();
            if (self.hint) {
                self.hint.Hide();
            }
            Popup.DestroyCurrent();
        };
    };
    PopupItem.prototype.GetElement = function () {
        return this.item;
    };
    return PopupItem;
}());
