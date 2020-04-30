var CoordinatesSystem = (function () {
    function CoordinatesSystem(view) {
        this.view = view;
        //Create the coordinates axes to be rendered
        var axes = [
            new Cylinder(new Vector([.5, .0, .0]), new Vector([1.0, .0, .0]), .1, 1.0),
            new Cylinder(new Vector([.0, .5, .0]), new Vector([.0, 1.0, .0]), .1, 1.0),
            new Cylinder(new Vector([.0, .0, .5]), new Vector([.0, .0, 1.0]), .1, 1.0)
        ];
        this.coordssystem = new Scene();
        for (var index_1 = 0; index_1 < axes.length; index_1++) {
            axes[index_1].material.baseColor = axes[index_1].axis.Flatten();
            this.coordssystem.Contents.Add(axes[index_1]);
        }
        //Refine lighting
        var light = this.coordssystem.Lights.children[0];
        this.coordssystem.Lights.Add(new Light(light.Position.Times(-1.0)));
        //Create labels
        this.axesLabels = [
            new AxisLabel('X', new Vector([1.0, .0, .0]), this),
            new AxisLabel('Y', new Vector([.0, 1.0, .0]), this),
            new AxisLabel('Z', new Vector([.0, .0, 1.0]), this)
        ];
        for (var index = 0; index < this.axesLabels.length; index++) {
            document.body.appendChild(this.axesLabels[index].GetElement());
        }
        //Create the coordinates rendering component
        this.renderer = new Renderer('CoordsRendering');
        this.renderer.camera.CenterOnBox(this.coordssystem.Contents.GetBoundingBox());
        this.renderer.camera.to = new Vector([.0, .0, .0]);
        this.showAxesLabels = true;
    }
    CoordinatesSystem.prototype.Refresh = function () {
        var mainCamera = this.MainRenderer.camera;
        this.renderer.camera.SetDirection(mainCamera.GetDirection(), mainCamera.up);
        this.renderer.RefreshSize();
        this.renderer.Draw(this.coordssystem);
        for (var index = 0; index < this.axesLabels.length; index++) {
            this.axesLabels[index].Refresh();
        }
        for (var index = 0; index < this.axesLabels.length; index++) {
            this.axesLabels[index].UpdateDepth(this.axesLabels);
        }
    };
    CoordinatesSystem.prototype.GetElement = function () {
        return this.renderer.GetElement();
    };
    CoordinatesSystem.prototype.ChangeViewAxis = function (axis) {
        this.MainRenderer.camera.SetDirection(axis, axis.GetOrthogonnal());
        this.view.RefreshRendering();
    };
    Object.defineProperty(CoordinatesSystem.prototype, "MainRenderer", {
        get: function () {
            return this.view.sceneRenderer;
        },
        enumerable: true,
        configurable: true
    });
    return CoordinatesSystem;
}());
//# sourceMappingURL=coordinatessystem.js.map