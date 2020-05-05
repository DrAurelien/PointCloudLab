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
var Scene = /** @class */ (function (_super) {
    __extends(Scene, _super);
    function Scene() {
        var _this = _super.call(this, "Scene") || this;
        _this.deletable = false;
        _this.children = [null, null];
        _this.Contents = new CADPrimitivesContainer("Objects");
        _this.Contents.deletable = false;
        _this.Lights = new LightsContainer("Lights");
        _this.Lights.deletable = false;
        _this.Lights.visible = false;
        _this.Lights.folded = true;
        var defaultLight = new Light(new Vector([10.0, 10.0, 10.0]), _this.Lights);
        defaultLight.deletable = false;
        return _this;
    }
    Object.defineProperty(Scene.prototype, "Contents", {
        get: function () {
            return this.children[1];
        },
        set: function (c) {
            this.children[1] = c;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "Lights", {
        get: function () {
            return this.children[0];
        },
        set: function (l) {
            this.children[0] = l;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.Select = function (item) {
        this.Contents.Apply(function (p) {
            p.selected = (p === item);
            return true;
        });
    };
    Scene.prototype.GetSelected = function () {
        var selected = [];
        this.Contents.Apply(function (p) {
            if (p.selected) {
                selected.push(p);
            }
            return true;
        });
        return selected;
    };
    Scene.prototype.GetSelectionBoundingBox = function () {
        var result = new BoundingBox();
        this.Contents.Apply(function (p) {
            if (p.selected) {
                result.AddBoundingBox(p.GetBoundingBox());
            }
            return true;
        });
        return result;
    };
    return Scene;
}(CADGroup));
//# sourceMappingURL=scene.js.map