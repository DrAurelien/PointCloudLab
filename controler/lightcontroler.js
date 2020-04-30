var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
var LightControler = (function (_super) {
    __extends(LightControler, _super);
    function LightControler(view) {
        _super.call(this, view);
        var item = this.view.dataHandler.currentItem;
        if (item && item instanceof Light) {
            this.light = item;
            this.view.sceneRenderer.camera.at = this.light.Position;
            this.view.RefreshRendering();
        }
    }
    LightControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var renderer = this.view.sceneRenderer;
        switch (displacement.button) {
            case 1:
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
                renderer.camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
                break;
            case 2:
                renderer.camera.Zoom(-displacement.dy / 10);
                break;
            case 3:
                renderer.camera.Pan(displacement.dx, displacement.dy);
                break;
            default:
                return true;
        }
        this.light.Position = renderer.camera.at;
        this.Cursor = Cursor.Light;
        this.view.RefreshRendering();
        return true;
    };
    LightControler.prototype.HandleClick = function (tracker) {
        return true;
    };
    LightControler.prototype.HandleWheel = function (delta) {
        return true;
    };
    LightControler.prototype.HandleKey = function (key) {
        return true;
    };
    LightControler.prototype.EndMouseEvent = function () {
        this.view.Refresh();
    };
    return LightControler;
}(MouseControler));
//# sourceMappingURL=lightcontroler.js.map