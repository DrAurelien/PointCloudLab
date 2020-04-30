var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PropertyWithValue = (function (_super) {
    __extends(PropertyWithValue, _super);
    function PropertyWithValue(name, inputType, value, changeHandler) {
        _super.call(this, name, changeHandler);
        var self = this;
        this.container = document.createElement('div');
        this.input = document.createElement('input');
        this.input.type = inputType;
        this.input.width = '20';
        this.input.className = 'PropertyValue';
        this.input.value = value;
        this.input.onchange = function (ev) { return self.NotifyChange(); };
        this.container.appendChild(this.input);
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
//# sourceMappingURL=propertywithvalue.js.map