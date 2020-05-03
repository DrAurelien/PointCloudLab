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
var CenterCameraAction = /** @class */ (function (_super) {
    __extends(CenterCameraAction, _super);
    function CenterCameraAction(scene, view) {
        var _this = _super.call(this, 'Center camera on selection', 'Change the camera viewing direction so that it points to the selected object(s)') || this;
        _this.scene = scene;
        _this.view = view;
        return _this;
    }
    CenterCameraAction.prototype.Run = function () {
        var selectionbb = this.scene.GetSelectionBoundingBox();
        if (selectionbb && this.view.sceneRenderer.camera.CenterOnBox(selectionbb)) {
            this.view.sceneRenderer.Draw(this.scene);
        }
    };
    CenterCameraAction.prototype.Enabled = function () {
        var selectionbb = this.scene.GetSelectionBoundingBox();
        return (selectionbb && selectionbb.IsValid());
    };
    return CenterCameraAction;
}(Action));
