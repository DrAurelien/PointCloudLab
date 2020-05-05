var Interface = /** @class */ (function () {
    function Interface(scene) {
        var appInterface = this;
        this.InitializeDataHandler(scene);
        this.InitializeMenu();
        this.InitializeRenderers(scene);
        window.onresize = function () {
            appInterface.Refresh();
        };
        this.Refresh();
    }
    Interface.prototype.InitializeDataHandler = function (scene) {
        var self = this;
        this.dataHandler = new DataHandler(scene, this);
        document.body.appendChild(self.dataHandler.GetElement());
    };
    Interface.prototype.InitializeMenu = function () {
        var self = this;
        this.menu = new Menu(this);
        document.body.appendChild(self.menu.GetElement());
    };
    Interface.prototype.InitializeRenderers = function (scene) {
        //Create the scene rendering component
        this.sceneRenderer = new Renderer('SceneRendering');
        document.body.appendChild(this.sceneRenderer.GetElement());
        //Create the coordinates axes to be rendered
        this.coordinatesSystem = new CoordinatesSystem(this);
        document.body.appendChild(this.coordinatesSystem.GetElement());
        //Create the default controler (camera controler)
        this.currentControler = new CameraControler(this, scene);
        this.sceneRenderer.Draw(scene);
        this.coordinatesSystem.Refresh();
    };
    Interface.prototype.UpdateSelectedElement = function (selectedItem) {
        this.dataHandler.currentItem = selectedItem;
        this.Refresh();
    };
    Interface.prototype.Refresh = function () {
        this.dataHandler.Resize(window.innerWidth, window.innerHeight);
        this.dataHandler.RefreshContent();
        this.menu.RefreshSize();
        this.RefreshRendering();
    };
    Interface.prototype.TemporaryHideHideables = function () {
        this.dataHandler.TemporaryHide();
        this.menu.TemporaryHide();
    };
    Interface.prototype.RestoreHideables = function () {
        this.dataHandler.RestoreVisibility();
        this.menu.RestoreVisibility();
    };
    Interface.prototype.RefreshRendering = function () {
        this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
        this.sceneRenderer.Draw(this.dataHandler.scene);
        this.coordinatesSystem.Refresh();
    };
    Interface.prototype.UseCameraControler = function () {
        this.currentControler = new CameraControler(this, this.dataHandler.scene);
    };
    Interface.prototype.UseTransformationControler = function () {
        this.currentControler = new TransformControler(this, this.dataHandler.scene);
    };
    Interface.prototype.UseLightControler = function () {
        this.currentControler = new LightControler(this);
    };
    return Interface;
}());
//# sourceMappingURL=interface.js.map