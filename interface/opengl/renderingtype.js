var RenderingType = (function () {
    function RenderingType() {
        this.value = 0;
        this.Surface(true);
    }
    RenderingType.prototype.Point = function (activate) {
        return this.Set(activate, 1);
    };
    RenderingType.prototype.Wire = function (activate) {
        return this.Set(activate, 2);
    };
    RenderingType.prototype.Surface = function (activate) {
        return this.Set(activate, 4);
    };
    RenderingType.prototype.Set = function (activate, base) {
        if (activate === true) {
            this.value = this.value | base;
        }
        else if (activate === false) {
            this.value = this.value ^ base;
        }
        return ((this.value & base) != 0);
    };
    return RenderingType;
}());
//# sourceMappingURL=renderingtype.js.map