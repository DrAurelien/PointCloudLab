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
var StringProperty = /** @class */ (function (_super) {
    __extends(StringProperty, _super);
    function StringProperty(name, value, handler) {
        return _super.call(this, name, 'text', value, handler) || this;
    }
    StringProperty.prototype.GetValue = function () {
        return this.input.value;
    };
    return StringProperty;
}(PropertyWithValue));
//# sourceMappingURL=stringproperty.js.map