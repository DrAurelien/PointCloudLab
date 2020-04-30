var Button = (function () {
    function Button(label, callback, hintMessage) {
        this.button = document.createElement('div');
        this.button.className = 'Button';
        var namePattern = /(?:\[Icon\:(.*)\]\s*)?(.*)/i;
        var name = namePattern.exec(label);
        var buttonLabel = document.createTextNode(name[2]);
        if (name[1]) {
            var icon = document.createElement('i');
            icon.className = 'ButtonIcon fa fa-' + name[1];
            var nameContainer = document.createElement('span');
            nameContainer.appendChild(icon);
            nameContainer.appendChild(buttonLabel);
            buttonLabel = nameContainer;
        }
        this.button.appendChild(buttonLabel);
        if (hintMessage) {
            this.hint = new Hint(this, hintMessage);
        }
        if (callback) {
            this.button.onclick = function (event) { callback(); };
        }
    }
    Button.prototype.GetElement = function () {
        return this.button;
    };
    return Button;
}());
//# sourceMappingURL=button.js.map