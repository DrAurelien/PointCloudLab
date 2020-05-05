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
var NumberInRangeProperty = /** @class */ (function (_super) {
    __extends(NumberInRangeProperty, _super);
    function NumberInRangeProperty(name, value, min, max, step, handler) {
        var _this = _super.call(this, name, 'range', value.toString(), handler) || this;
        _this.min = min;
        _this.max = max;
        _this.step = step;
        _this.input.min = min.toString();
        _this.input.max = max.toString();
        _this.input.step = step.toString();
        return _this;
    }
    NumberInRangeProperty.prototype.GetValue = function () {
        try {
            return parseFloat(this.input.value);
        }
        catch (ex) {
            return null;
        }
    };
    return NumberInRangeProperty;
}(PropertyWithValue));
//# sourceMappingURL=numberinrangeproperty.js.map