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
var CameraModeAction = /** @class */ (function (_super) {
    __extends(CameraModeAction, _super);
    function CameraModeAction(view) {
        var _this = _super.call(this, 'Camera mode', 'The mouse can be used to control the position of the camera') || this;
        _this.view = view;
        return _this;
    }
    CameraModeAction.prototype.Run = function () {
        this.view.UseCameraControler();
    };
    CameraModeAction.prototype.Enabled = function () {
        return !(this.view.currentControler instanceof CameraControler);
    };
    return CameraModeAction;
}(Action));
var TransformModeAction = /** @class */ (function (_super) {
    __extends(TransformModeAction, _super);
    function TransformModeAction(view) {
        var _this = _super.call(this, 'Transformation mode', 'The mouse can be used to control the geometry of the selected item') || this;
        _this.view = view;
        return _this;
    }
    TransformModeAction.prototype.Run = function () {
        this.view.UseTransformationControler();
    };
    TransformModeAction.prototype.Enabled = function () {
        return !(this.view.currentControler instanceof TransformControler);
    };
    return TransformModeAction;
}(Action));
var LightModeAction = /** @class */ (function (_super) {
    __extends(LightModeAction, _super);
    function LightModeAction(view) {
        var _this = _super.call(this, 'Light mode', 'The mouse can be used to control the position of the selected light') || this;
        _this.view = view;
        return _this;
    }
    LightModeAction.prototype.Run = function () {
        this.view.UseLightControler();
    };
    LightModeAction.prototype.Enabled = function () {
        var item = this.view.dataHandler.currentItem;
        if (!(item && (item instanceof Light))) {
            return false;
        }
        return !(this.view.currentControler instanceof LightControler);
    };
    return LightModeAction;
}(Action));
//# sourceMappingURL=controlerchoice.js.map