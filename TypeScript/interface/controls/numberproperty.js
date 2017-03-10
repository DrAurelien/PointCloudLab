var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var NumberProperty = (function (_super) {
    __extends(NumberProperty, _super);
    function NumberProperty(name, value, handler) {
        _super.call(this, name, value.toString(), handler);
    }
    NumberProperty.prototype.GetValue = function () {
        return parseFloat(this.input.value);
    };
    return NumberProperty;
}(StringProperty));
//# sourceMappingURL=numberproperty.js.map