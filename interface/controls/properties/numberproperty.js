var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var NumberProperty = (function (_super) {
    __extends(NumberProperty, _super);
    function NumberProperty(name, value, handler) {
        _super.call(this, name, 'text', value.toString(), handler);
    }
    NumberProperty.prototype.GetValue = function () {
        try {
            return parseFloat(this.input.value);
        }
        catch (ex) {
            return null;
        }
    };
    return NumberProperty;
}(PropertyWithValue));
//# sourceMappingURL=numberproperty.js.map