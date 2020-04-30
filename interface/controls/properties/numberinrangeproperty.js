var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var NumberInRangeProperty = (function (_super) {
    __extends(NumberInRangeProperty, _super);
    function NumberInRangeProperty(name, value, min, max, step, handler) {
        _super.call(this, name, 'range', value.toString(), handler);
        this.min = min;
        this.max = max;
        this.step = step;
        this.input.min = min.toString();
        this.input.max = max.toString();
        this.input.step = step.toString();
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