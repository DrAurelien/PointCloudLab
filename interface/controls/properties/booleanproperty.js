var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BooleanProperty = (function (_super) {
    __extends(BooleanProperty, _super);
    function BooleanProperty(name, value, handler) {
        _super.call(this, name, 'checkbox', value.toString(), handler);
        this.input.checked = value;
    }
    BooleanProperty.prototype.GetValue = function () {
        return this.input.checked;
    };
    return BooleanProperty;
}(PropertyWithValue));
//# sourceMappingURL=booleanproperty.js.map