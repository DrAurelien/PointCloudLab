var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DataHandler = (function (_super) {
    __extends(DataHandler, _super);
    function DataHandler(scene, ownerView) {
        _super.call(this, 'DataWindow', HandlePosition.Right);
        this.scene = scene;
        this.ownerView = ownerView;
        //Data visualization
        this.dataArea = new Pannel('DataArea');
        this.AddControl(this.dataArea);
        //Properties visualization
        this.propertiesArea = new Pannel('PropertiesArea');
        this.AddControl(this.propertiesArea);
        this.RefreshContent();
    }
    DataHandler.prototype.Resize = function (width, height) {
        var pannel = this.GetElement();
        pannel.style.height = (height - 2 * pannel.offsetTop) + 'px';
        this.RefreshSize();
        this.HandlePropertiesWindowVisibility();
    };
    DataHandler.prototype.HandlePropertiesWindowVisibility = function () {
        var pannel = this.GetElement();
        var dataArea = this.dataArea.GetElement();
        var propertiesArea = this.propertiesArea.GetElement();
        if (this.currentItem != null) {
            var height = pannel.clientHeight / 2;
            dataArea.style.height = height + 'px';
            var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
            height -= delta;
            dataArea.style.height = height + 'px';
            propertiesArea.style.height = dataArea.style.height;
            dataArea.style.borderBottom = '1px solid lightGray';
            propertiesArea.style.borderTop = '1px solid darkGray';
        }
        else {
            var height = pannel.clientHeight;
            dataArea.style.height = height + 'px';
            var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
            height -= delta;
            dataArea.style.height = height + 'px';
            propertiesArea.style.height = "0px";
            dataArea.style.borderBottom = '';
            propertiesArea.style.borderTop = '';
        }
    };
    DataHandler.prototype.AddCreatedObject = function (scene, createdObject) {
        if (createdObject) {
            //If the object does not have an owner, affect one
            if (!createdObject.owner) {
                var owner = (createdObject instanceof Light) ? scene.Lights : scene.Contents;
                if (this.currentItem && this.currentItem instanceof CADGroup) {
                    owner = this.currentItem;
                }
                owner.Add(createdObject);
            }
            //Select the new item, and make it the current active object
            scene.Select(createdObject);
            this.currentItem = createdObject;
            this.NotifyChange();
        }
    };
    DataHandler.prototype.NotifyChange = function () {
        this.ownerView.Refresh();
    };
    DataHandler.prototype.GetSceneRenderer = function () {
        return this.ownerView.sceneRenderer;
    };
    //Refresh content of data and properties views
    DataHandler.prototype.RefreshContent = function () {
        this.RefreshData();
        this.RefreshProperties();
    };
    DataHandler.prototype.RefreshData = function () {
        this.dataArea.Clear();
        var item = new DataItem(this.scene, this, this.scene);
        this.dataArea.GetElement().appendChild(item.GetContainerElement());
    };
    DataHandler.prototype.RefreshProperties = function () {
        this.HandlePropertiesWindowVisibility();
        this.propertiesArea.Clear();
        if (this.currentItem != null) {
            var currentProperties = this.currentItem.GetProperties();
            var self_1 = this;
            currentProperties.onChange = function () { return self_1.NotifyChange(); };
            this.propertiesArea.AddControl(currentProperties);
        }
    };
    return DataHandler;
}(HideablePannel));
//# sourceMappingURL=datahandler.js.map