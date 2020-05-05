var ComboBox = /** @class */ (function () {
    function ComboBox(label, options, hintMessage) {
        var self = this;
        this.button = new Button(label, function () {
            Popup.CreatePopup(self.button, options);
        }, hintMessage);
    }
    ComboBox.prototype.GetElement = function () {
        return this.button.GetElement();
    };
    return ComboBox;
}());
//# sourceMappingURL=combobox.js.map