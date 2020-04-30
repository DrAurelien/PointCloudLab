var Pannel = (function () {
    function Pannel(classname) {
        if (classname === void 0) { classname = ""; }
        this.pannel = document.createElement('div');
        this.pannel.className = classname;
    }
    Pannel.prototype.GetElement = function () {
        return this.pannel;
    };
    Pannel.prototype.AddControl = function (control) {
        this.pannel.appendChild(control.GetElement());
    };
    Pannel.prototype.RemoveControl = function (control) {
        this.pannel.removeChild(control.GetElement());
    };
    Pannel.prototype.Clear = function () {
        while (this.pannel.lastChild) {
            this.pannel.removeChild(this.pannel.lastChild);
        }
    };
    return Pannel;
}());
//# sourceMappingURL=pannel.js.map