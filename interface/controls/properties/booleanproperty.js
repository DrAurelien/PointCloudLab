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
var BooleanProperty = /** @class */ (function (_super) {
    __extends(BooleanProperty, _super);
    function BooleanProperty(name, value, handler) {
        var _this = _super.call(this, name, 'checkbox', value.toString(), handler) || this;
        _this.input.checked = value;
        return _this;
    }
    BooleanProperty.prototype.GetValue = function () {
        return this.input.checked;
    };
    return BooleanProperty;
}(PropertyWithValue));
//# sourceMappingURL=booleanproperty.js.map