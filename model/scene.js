var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Scene = (function (_super) {
    __extends(Scene, _super);
    function Scene() {
        _super.call(this, "Scene");
        this.deletable = false;
        this.children = [null, null];
        this.Contents = new CADPrimitivesContainer("Objects");
        this.Contents.deletable = false;
        this.Lights = new LightsContainer("Lights");
        this.Lights.deletable = false;
        this.Lights.visible = false;
        this.Lights.folded = true;
        var defaultLight = new Light(new Vector([10.0, 10.0, 10.0]), this.Lights);
        defaultLight.deletable = false;
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