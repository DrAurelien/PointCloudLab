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
var CADPrimitive = /** @class */ (function (_super) {
    __extends(CADPrimitive, _super);
    function CADPrimitive(name, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, name, owner) || this;
        _this.name = name;
        _this.material = new Material([0.0, 1.0, 0.0]);
        return _this;
    }
    CADPrimitive.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
        return properties;
    };
    return CADPrimitive;
}(CADNode));
