var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PropertyWithValue = /** @class */ (function (_super) {
    __extends(PropertyWithValue, _super);
    function PropertyWithValue(name, inputType, value, changeHandler) {
        var _this = _super.call(this, name, changeHandler) || this;
        var self = _this;
        _this.container = document.createElement('div');
        _this.input = document.createElement('input');
        _this.input.type = inputType;
        _this.input.width = 20;
        _this.input.className = 'PropertyValue';
        _this.input.value = value;
        _this.input.onchange = function (ev) { return self.NotifyChange(); };
        _this.container.appendChild(_this.input);
        return _this;
    }
    PropertyWithValue.prototype.GetElement = function () {
        return this.container;
    };
    PropertyWithValue.prototype.SetReadonly = function (value) {
        if (value === void 0) { value = true; }
        this.input.readOnly = value;
        this.input.className = 'PropertyValue' + (value ? 'Readonly' : '');
    };
    return PropertyWithValue;
}(Property));
