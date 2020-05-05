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
var NumberProperty = /** @class */ (function (_super) {
    __extends(NumberProperty, _super);
    function NumberProperty(name, value, handler) {
        return _super.call(this, name, 'text', value.toString(), handler) || this;
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