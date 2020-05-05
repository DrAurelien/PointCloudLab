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
/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
var CameraControler = /** @class */ (function (_super) {
    __extends(CameraControler, _super);
    function CameraControler(view, scene) {
        var _this = _super.call(this, view) || this;
        _this.scene = scene;
        return _this;
    }
    CameraControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var renderer = this.view.sceneRenderer;
        switch (displacement.button) {
            case 1: //Left mouse
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
                renderer.camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
                this.view.coordinatesSystem.Refresh();
                this.Cursor = Cursor.Rotate;
                break;
            case 2: //Middle mouse
                renderer.camera.Zoom(-displacement.dy / 10);
                this.Cursor = Cursor.Scale;
                break;
            case 3: //Right mouse
                renderer.camera.Pan(displacement.dx, displacement.dy);
                this.Cursor = Cursor.Translate;
                break;
            default:
                return true;
        }
        renderer.Draw(this.scene);
        return true;
    };
    CameraControler.prototype.HandleClick = function (tracker) {
        var renderer = this.view.sceneRenderer;
        switch (tracker.button) {
            case 1: //Left mouse
                var selected = renderer.PickObject(tracker.x, tracker.y, this.scene);
                this.scene.Select(selected);
                this.view.UpdateSelectedElement(selected);
                break;
            case 2: //Middle mouse
                var center = new CenterCameraAction(this.scene, this.view);
                center.Run();
                break;
            default:
                return true;
        }
        return true;
    };
    CameraControler.prototype.HandleWheel = function (delta) {
        var renderer = this.view.sceneRenderer;
        renderer.camera.Zoom(delta / 100);
        renderer.Draw(this.scene);
        return true;
    };
    CameraControler.prototype.HandleKey = function (key) {
        var renderer = this.view.sceneRenderer;
        switch (key) {
            case 'p'.charCodeAt(0):
                renderer.drawingcontext.rendering.Point(!renderer.drawingcontext.rendering.Point());
                break;
            case 'w'.charCodeAt(0):
                renderer.drawingcontext.rendering.Wire(!renderer.drawingcontext.rendering.Wire());
                break;
            case 's'.charCodeAt(0):
                renderer.drawingcontext.rendering.Surface(!renderer.drawingcontext.rendering.Surface());
                break;
            default:
                return true;
        }
        renderer.Draw(this.scene);
        return true;
    };
    return CameraControler;
}(MouseControler));
//# sourceMappingURL=cameracontroler.js.map