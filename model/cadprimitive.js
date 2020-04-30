var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CADPrimitive = (function (_super) {
    __extends(CADPrimitive, _super);
    function CADPrimitive(name, owner) {
        if (owner === void 0) { owner = null; }
        _super.call(this, name, owner);
        this.name = name;
        this.material = new Material([0.0, 1.0, 0.0]);
    }
    CADPrimitive.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
        return properties;
    };
    return CADPrimitive;
}(CADNode));
//# sourceMappingURL=cadprimitive.js.map