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
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape(name, owner) {
        var _this = _super.call(this, name, owner) || this;
        _this.mesh = null;
        return _this;
    }
    Shape.prototype.GetBoundingBox = function () {
        if (!this.boundingbox) {
            this.boundingbox = this.ComputeBoundingBox();
        }
        return this.boundingbox;
    };
    Shape.prototype.ComputeBounds = function (points, cloud) {
    };
    Shape.prototype.PrepareForDrawing = function (drawingContext) {
        if (!this.mesh) {
            this.mesh = this.ComputeMesh(drawingContext.sampling);
        }
    };
    Shape.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            this.PrepareForDrawing(drawingContext);
            this.mesh.material = this.material;
            this.mesh.Draw(drawingContext);
            if (this.selected) {
                var box = this.GetBoundingBox();
                box.Draw(drawingContext);
            }
        }
    };
    Shape.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        properties.Push(new PropertyGroup('Geometry', this.GetGeometry()));
        return properties;
    };
    Shape.prototype.GetActions = function (dataHandler, onDone) {
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        result.push(new CreateShapeMeshAction(this, dataHandler, onDone));
        return result;
    };
    Shape.prototype.Invalidate = function () {
        this.mesh = null;
        this.boundingbox = null;
    };
    Shape.prototype.GeometryChangeHandler = function (update) {
        var self = this;
        return function (value) {
            if (update) {
                update(value);
            }
            self.Invalidate();
        };
    };
    return Shape;
}(CADPrimitive));
var CreateShapeMeshAction = /** @class */ (function (_super) {
    __extends(CreateShapeMeshAction, _super);
    function CreateShapeMeshAction(shape, dataHandler, onDone) {
        var _this = _super.call(this, 'Create shape mesh', 'Builds the mesh sampling this shape') || this;
        _this.shape = shape;
        _this.dataHandler = dataHandler;
        _this.onDone = onDone;
        return _this;
    }
    CreateShapeMeshAction.prototype.Enabled = function () {
        return true;
    };
    CreateShapeMeshAction.prototype.Run = function () {
        var self = this;
        var dialog = new Dialog(
        //Ok has been clicked
        function (properties) {
            return self.CreateMesh(properties);
        }, 
        //Cancel has been clicked
        function () { return true; });
        dialog.InsertValue('Sampling', this.dataHandler.GetSceneRenderer().drawingcontext.sampling);
    };
    CreateShapeMeshAction.prototype.CreateMesh = function (properties) {
        var sampling = parseInt(properties.GetValue('Sampling'));
        var mesh = this.shape.ComputeMesh(sampling);
        var self = this;
        mesh.ComputeOctree(function () { if (self.onDone) {
            self.onDone(mesh);
        } });
        return true;
    };
    return CreateShapeMeshAction;
}(Action));
//# sourceMappingURL=shape.js.map