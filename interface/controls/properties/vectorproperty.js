var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VectorProperty = (function (_super) {
    __extends(VectorProperty, _super);
    function VectorProperty(name, vector, normalize, handler) {
        if (normalize === void 0) { normalize = false; }
        if (handler === void 0) { handler = null; }
        _super.call(this, name, null, handler);
        this.vector = vector;
        this.normalize = normalize;
        var self = this;
        this.Add(new NumberProperty('X', vector.Get(0), function (x) { return self.UpdateValue(0, x); }));
        this.Add(new NumberProperty('Y', vector.Get(1), function (y) { return self.UpdateValue(1, y); }));
        this.Add(new NumberProperty('Z', vector.Get(2), function (z) { return self.UpdateValue(2, z); }));
    }
    VectorProperty.prototype.UpdateValue = function (index, value) {
        this.vector.Set(index, value);
        if (this.normalize) {
            this.vector.Normalize();
        }
    };
    VectorProperty.prototype.GetValue = function () {
        return new Vector([
            this.properties.GetValue('X'),
            this.properties.GetValue('Y'),
            this.properties.GetValue('Z')
        ]);
    };
    return VectorProperty;
}(PropertyGroup));
//# sourceMappingURL=vectorproperty.js.map