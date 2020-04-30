var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TransformControler = (function (_super) {
    __extends(TransformControler, _super);
    function TransformControler(view, scene) {
        _super.call(this, view);
        this.scene = scene;
    }
    TransformControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var datahandler = this.view.dataHandler;
        var renderer = this.view.sceneRenderer;
        if (!datahandler.currentItem || !(datahandler.currentItem instanceof Shape))
            return false;
        var item = datahandler.currentItem;
        switch (displacement.button) {
            case 1:
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
                var rotation = renderer.camera.GetRotationMatrix(this.mousetracker.x, this.mousetracker.y, x, y);
                item.Rotate(rotation);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Rotate]);
                break;
            case 2:
                var scale = 1.0 - (displacement.dy / renderer.camera.screen.height);
                item.Scale(scale);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Scale]);
                break;
            case 3:
                var translation = renderer.camera.GetTranslationVector(-displacement.dx, -displacement.dy);
                item.Translate(translation);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Translate]);
                break;
            default:
                return true;
        }
        renderer.Draw(this.scene);
        return true;
    };
    TransformControler.prototype.HandleClick = function (tracker) {
        var renderer = this.view.sceneRenderer;
        switch (tracker.button) {
            case 1:
                var selected = renderer.PickObject(tracker.x, tracker.y, this.scene);
                this.scene.Select(selected);
                this.view.UpdateSelectedElement(selected);
                break;
            case 2:
                var center = new CenterCameraAction(this.scene, this.view);
                center.Run();
                break;
            default:
                return true;
        }
        return true;
    };
    TransformControler.prototype.HandleWheel = function (delta) {
        var datahandler = this.view.dataHandler;
        var renderer = this.view.sceneRenderer;
        if (!datahandler.currentItem || !(datahandler.currentItem instanceof Shape))
            return false;
        var item = datahandler.currentItem;
        item.Scale(1.0 + (delta / 1000.0));
        renderer.Draw(this.scene);
        return true;
    };
    TransformControler.prototype.HandleKey = function (key) {
        return true;
    };
    TransformControler.prototype.EndMouseEvent = function () {
        _super.prototype.EndMouseEvent.call(this);
        this.view.dataHandler.RefreshContent();
    };
    return TransformControler;
}(MouseControler));
//# sourceMappingURL=transformcontroler.js.map