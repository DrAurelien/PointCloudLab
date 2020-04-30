var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Shape = (function (_super) {
    __extends(Shape, _super);
    function Shape(name, owner) {
        _super.call(this, name, owner);
        this.mesh = null;
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
var CreateShapeMeshAction = (function (_super) {
    __extends(CreateShapeMeshAction, _super);
    function CreateShapeMeshAction(shape, dataHandler, onDone) {
        _super.call(this, 'Create shape mesh');
        this.callback = function () {
            var dialog = new Dialog(
            //Ok has been clicked
            //Ok has been clicked
            function (properties) {
                var sampling = parseInt(properties.GetValue('Sampling'));
                var mesh = shape.ComputeMesh(sampling);
                mesh.ComputeOctree(function () { if (onDone) {
                    onDone(mesh);
                } });
                return true;
            }, 
            //Cancel has been clicked
            //Cancel has been clicked
            function () { return true; });
            dialog.InsertValue('Sampling', dataHandler.GetSceneRenderer().drawingcontext.sampling);
        };
    }
    return CreateShapeMeshAction;
}(Action));
//# sourceMappingURL=shape.js.map