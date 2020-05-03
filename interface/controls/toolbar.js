var Toolbar = /** @class */ (function () {
    function Toolbar(classname) {
        if (classname === void 0) { classname = "Toolbar"; }
        this.toolbar = document.createElement('div');
        this.toolbar.className = classname;
    }
    Toolbar.prototype.AddControl = function (control) {
        var container = document.createElement('span');
        container.appendChild(control.GetElement());
        this.toolbar.appendChild(container);
    };
    Toolbar.prototype.RemoveControl = function (control) {
        var element = control.GetElement();
        for (var index = 0; index < this.toolbar.children.length; index++) {
            var container = this.toolbar.children[index];
            var current = container.firstChild;
            if (current === element) {
                this.toolbar.removeChild(container);
                return;
            }
        }
    };
    Toolbar.prototype.Clear = function () {
        while (this.toolbar.lastChild) {
            this.toolbar.removeChild(this.toolbar.lastChild);
        }
    };
    Toolbar.prototype.GetElement = function () {
        return this.toolbar;
    };
    return Toolbar;
}());
