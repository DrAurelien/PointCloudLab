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
var VectorProperty = /** @class */ (function (_super) {
    __extends(VectorProperty, _super);
    function VectorProperty(name, vector, normalize, handler) {
        if (normalize === void 0) { normalize = false; }
        if (handler === void 0) { handler = null; }
        var _this = _super.call(this, name, null, handler) || this;
        _this.vector = vector;
        _this.normalize = normalize;
        var self = _this;
        _this.Add(new NumberProperty('X', vector.Get(0), function (x) { return self.UpdateValue(0, x); }));
        _this.Add(new NumberProperty('Y', vector.Get(1), function (y) { return self.UpdateValue(1, y); }));
        _this.Add(new NumberProperty('Z', vector.Get(2), function (z) { return self.UpdateValue(2, z); }));
        return _this;
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
