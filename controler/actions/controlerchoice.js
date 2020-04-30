var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CameraModeAction = (function (_super) {
    __extends(CameraModeAction, _super);
    function CameraModeAction(view) {
        _super.call(this, 'Switch to camera mode', function (onDone) {
            view.UseCameraControler();
        }, 'The mouse can be used to control the position of the camera');
        this.view = view;
    }
    CameraModeAction.prototype.HasAction = function () {
        return !(this.view.currentControler instanceof CameraControler);
    };
    return CameraModeAction;
}(Action));
var TransformModeAction = (function (_super) {
    __extends(TransformModeAction, _super);
    function TransformModeAction(view) {
        _super.call(this, 'Switch to transformation mode', function (onDone) {
            view.UseTransformationControler();
        }, 'The mouse can be used to control the geometry of the selected item');
        this.view = view;
    }
    TransformModeAction.prototype.HasAction = function () {
        return !(this.view.currentControler instanceof TransformControler);
    };
    return TransformModeAction;
}(Action));
var LightModeAction = (function (_super) {
    __extends(LightModeAction, _super);
    function LightModeAction(view) {
        _super.call(this, 'Switch to light mode', function (onDone) {
            view.UseLightControler();
        }, 'The mouse can be used to control the position of the selected light');
        this.view = view;
    }
    LightModeAction.prototype.HasAction = function () {
        var item = this.view.dataHandler.currentItem;
        if (!(item && (item instanceof Light))) {
            return false;
        }
        return !(this.view.currentControler instanceof TransformControler);
    };
    return LightModeAction;
}(Action));
//# sourceMappingURL=controlerchoice.js.map