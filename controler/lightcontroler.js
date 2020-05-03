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
var LightControler = /** @class */ (function (_super) {
    __extends(LightControler, _super);
    function LightControler(view) {
        var _this = _super.call(this, view) || this;
        var item = _this.view.dataHandler.currentItem;
        if (item && item instanceof Light) {
            _this.light = item;
            _this.view.sceneRenderer.camera.at = _this.light.Position;
            _this.view.RefreshRendering();
        }
        return _this;
    }
    LightControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var renderer = this.view.sceneRenderer;
        switch (displacement.button) {
            case 1: //Left mouse
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
                renderer.camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
                break;
            case 2: //Middle mouse
                renderer.camera.Zoom(-displacement.dy / 10);
                break;
            case 3: //Right mouse
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
