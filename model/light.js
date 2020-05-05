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
var Light = /** @class */ (function (_super) {
    __extends(Light, _super);
    function Light(center, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName("Light"), owner) || this;
        _this.sphere = new Sphere(center, 0.01);
        _this.sphere.material.baseColor = [1.0, 1.0, 1.0];
        return _this;
    }
    Object.defineProperty(Light.prototype, "Position", {
        get: function () {
            return this.sphere.center;
        },
        set: function (p) {
            this.sphere.center = p;
            this.sphere.Invalidate();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Light.prototype, "Color", {
        get: function () {
            return this.sphere.material.baseColor;
        },
        set: function (c) {
            this.sphere.material.baseColor = c;
        },
        enumerable: true,
        configurable: true
    });
    Light.prototype.Draw = function (drawingContext) {
        this.sphere.Draw(drawingContext);
    };
    Light.prototype.RayIntersection = function (ray) {
        return this.sphere.RayIntersection(ray);
    };
    Light.prototype.GetProperties = function () {
        var self = this;
        var properties = _super.prototype.GetProperties.call(this);
        properties.Push(new VectorProperty('Position', this.Position, false, function (newPosition) { return self.Position = newPosition; }));
        properties.Push(new ColorProperty('Color', this.Color, function (newColor) { return self.Color = newColor; }));
        return properties;
    };
    return Light;
}(CADNode));
//# sourceMappingURL=light.js.map