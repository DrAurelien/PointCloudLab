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
var CADPrimitivesContainer = /** @class */ (function (_super) {
    __extends(CADPrimitivesContainer, _super);
    function CADPrimitivesContainer(name, owner) {
        if (owner === void 0) { owner = null; }
        return _super.call(this, name || NameProvider.GetName('Group'), owner) || this;
    }
    CADPrimitivesContainer.prototype.GetActions = function (dataHandler, onDone) {
        var self = this;
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        result.push(new SimpleAction('New group', function () { return onDone(new CADPrimitivesContainer(NameProvider.GetName('Group'), self)); }, 'A group is a hiearchical item that can be used to organize objects.'));
        result.push(new SimpleAction('New plane', this.GetShapeCreator(function () { return new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, self); }, dataHandler, onDone)));
        result.push(new SimpleAction('New sphere', this.GetShapeCreator(function () { return new Sphere(new Vector([0, 0, 0]), 1, self); }, dataHandler, onDone)));
        result.push(new SimpleAction('New cylinder', this.GetShapeCreator(function () { return new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1, self); }, dataHandler, onDone)));
        result.push(new SimpleAction('New cone', this.GetShapeCreator(function () { return new Cone(new Vector([0, 0, 0]), new Vector([0, 0, 1]), Math.PI / 6.0, 1, self); }, dataHandler, onDone)));
        result.push(new SimpleAction('New torus', this.GetShapeCreator(function () { return new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1, self); }, dataHandler, onDone)));
        result.push(new ScanFromCurrentViewPointAction(this, dataHandler, onDone));
        return result;
    };
    CADPrimitivesContainer.prototype.GetShapeCreator = function (creator, dataHandler, onDone) {
        return function () {
            var shape = creator();
            shape.PrepareForDrawing(dataHandler.GetSceneRenderer().drawingcontext);
            onDone(shape);
        };
    };
    CADPrimitivesContainer.prototype.IsScannable = function () {
        return !this.Apply(function (p) { return !(p instanceof Shape || p instanceof Mesh); });
    };
    return CADPrimitivesContainer;
}(CADGroup));
//# sourceMappingURL=cadprimitivescontainer.js.map