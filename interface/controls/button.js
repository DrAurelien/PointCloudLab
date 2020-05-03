var Button = /** @class */ (function () {
    function Button(label, callback, hintMessage) {
        this.button = document.createElement('div');
        this.button.className = 'Button';
        var namePattern = /(?:\[Icon\:(.*)\]\s*)?(.*)/i;
        var name = namePattern.exec(label);
        this.buttonLabel = document.createTextNode(name[name.length - 1]);
        var nameContainer = this.buttonLabel;
        if (name[1]) {
            var icon = document.createElement('i');
            icon.className = 'ButtonIcon fa fa-' + name[1];
            nameContainer = document.createElement('span');
            nameContainer.appendChild(icon);
            nameContainer.appendChild(this.buttonLabel);
        }
        this.button.appendChild(nameContainer);
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
    Button.prototype.SetLabel = function (value) {
        this.buttonLabel.data = value;
    };
    Button.prototype.GetLabel = function () {
        return this.buttonLabel.data;
    };
    return Button;
}());
