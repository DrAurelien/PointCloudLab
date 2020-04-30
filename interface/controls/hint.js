var Hint = (function () {
    function Hint(owner, message) {
        this.owner = owner;
        this.container = document.createElement('div');
        this.container.className = 'Hint';
        this.container.appendChild(document.createTextNode(message));
        var element = this.owner.GetElement();
        var self = this;
        element.onmouseenter = function (ev) { self.Show(); };
        element.onmouseleave = function (ev) { self.Hide(); };
    }
    Hint.prototype.Show = function () {
        if (!this.container.parentElement) {
            document.body.appendChild(this.container);
        }
    };
    Hint.prototype.Hide = function () {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    };
    Hint.prototype.GetElement = function () {
        return this.container;
    };
    return Hint;
}());
//# sourceMappingURL=hint.js.map