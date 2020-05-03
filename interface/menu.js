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
var Menu = /** @class */ (function (_super) {
    __extends(Menu, _super);
    function Menu(ownerView) {
        var _this = _super.call(this, 'MenuToolbar', HandlePosition.Bottom) || this;
        _this.ownerView = ownerView;
        _this.toolbar = new Toolbar();
        _this.container.AddControl(_this.toolbar);
        var dataHandler = ownerView.dataHandler;
        var scene = dataHandler.scene;
        _this.toolbar.AddControl(new FileOpener('[Icon:file-o] Open', function (createdObject) {
            if (createdObject != null) {
                scene.Contents.Add(createdObject);
                scene.Select(createdObject);
                dataHandler.currentItem = createdObject;
                dataHandler.NotifyChange();
            }
        }, 'Load data from a file'));
        var center = new CenterCameraAction(scene, ownerView);
        _this.toolbar.AddControl(new Button('[Icon:video-camera] Center', function () {
            center.Run();
        }, center.hintMessage));
        _this.toolbar.AddControl(new SelectDrop('[Icon:desktop] Mode', [
            new CameraModeAction(ownerView),
            new TransformModeAction(ownerView),
            new LightModeAction(ownerView)
        ], 0, 'Change the current working mode (changes the mouse input '));
        _this.toolbar.AddControl(new Button('[Icon:question-circle] Help', function () {
            window.open('help.html', '_blank');
        }));
        return _this;
    }
    Menu.prototype.Clear = function () {
        this.toolbar.Clear();
    };
    return Menu;
}(HideablePannel));
