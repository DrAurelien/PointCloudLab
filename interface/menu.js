var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Menu = (function (_super) {
    __extends(Menu, _super);
    function Menu(ownerView) {
        _super.call(this, 'MenuToolbar', HandlePosition.Bottom);
        this.ownerView = ownerView;
        this.toolbar = new Toolbar();
        var dataHandler = ownerView.dataHandler;
        var scene = dataHandler.scene;
        this.toolbar.AddControl(new FileOpener('[Icon:file-o] Open', function (createdObject) {
            if (createdObject != null) {
                scene.Contents.Add(createdObject);
                scene.Select(createdObject);
                dataHandler.currentItem = createdObject;
                dataHandler.NotifyChange();
            }
        }, 'Load data from a file'));
        this.toolbar.AddControl(new ComboBox('[Icon:video-camera] View', [
            new CenterCameraAction(scene, ownerView),
            null,
            new CameraModeAction(ownerView),
            new TransformModeAction(ownerView),
            new LightModeAction(ownerView)
        ], 'Handle the camera position'));
        this.toolbar.AddControl(new Button('[Icon:question-circle] Help', function () {
            window.open('help.html', '_blank');
        }));
    }
    Menu.prototype.Clear = function () {
        this.toolbar.Clear();
    };
    return Menu;
}(HideablePannel));
//# sourceMappingURL=menu.js.map