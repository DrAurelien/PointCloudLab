var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var StringProperty = (function (_super) {
    __extends(StringProperty, _super);
    function StringProperty(name, value, handler) {
        _super.call(this, name, 'text', value, handler);
    }
    StringProperty.prototype.GetValue = function () {
        return this.input.value;
    };
    return StringProperty;
}(PropertyWithValue));
//# sourceMappingURL=stringproperty.js.map