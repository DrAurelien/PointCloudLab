var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CenterCameraAction = (function (_super) {
    __extends(CenterCameraAction, _super);
    function CenterCameraAction(scene, view) {
        _super.call(this, 'Center camera on selection', function (onDone) {
            var selectionbb = scene.GetSelectionBoundingBox();
            if (selectionbb && view.sceneRenderer.camera.CenterOnBox(selectionbb)) {
                view.sceneRenderer.Draw(scene);
            }
        }, 'Change the camera viewing direction so that it points to the selected object(s)');
        this.scene = scene;
    }
    CenterCameraAction.prototype.HasAction = function () {
        var selectionbb = this.scene.GetSelectionBoundingBox();
        return (selectionbb && selectionbb.IsValid());
    };
    return CenterCameraAction;
}(Action));
//# sourceMappingURL=cameracenter.js.map