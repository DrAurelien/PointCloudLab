var DataItem = /** @class */ (function () {
    function DataItem(item, dataHandler, scene) {
        this.item = item;
        this.dataHandler = dataHandler;
        this.scene = scene;
        this.container = document.createElement('div');
        this.container.className = 'TreeItemContainer';
        this.itemContentContainer = document.createElement('div');
        this.itemContentContainer.className = (this.item == this.dataHandler.currentItem) ? 'SelectedSceneItem' : 'SceneItem';
        this.container.appendChild(this.itemContentContainer);
        var itemIcon = document.createElement('i');
        if (this.item instanceof Scene) {
            itemIcon.className = 'ItemIcon fa fa-desktop';
        }
        else if (this.item instanceof CADGroup) {
            itemIcon.className = 'ItemIcon fa fa-folder' + (this.item.folded ? '' : '-open');
            itemIcon.onclick = this.ItemFolded();
            this.itemContentContainer.ondblclick = this.ItemFolded();
        }
        else if (this.item instanceof Light) {
            itemIcon.className = 'ItemIcon fa fa-lightbulb-o';
        }
        else {
            itemIcon.className = 'ItemIcon fa fa-cube';
        }
        this.itemContentContainer.appendChild(itemIcon);
        var visibilityIcon = document.createElement('i');
        visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
        this.itemContentContainer.appendChild(visibilityIcon);
        var menuIcon = document.createElement('i');
        menuIcon.className = 'ItemAction fa fa-ellipsis-h';
        this.itemContentContainer.appendChild(menuIcon);
        var deletionIcon = null;
        if (this.item.deletable) {
            deletionIcon = document.createElement('i');
            deletionIcon.className = 'ItemAction fa fa-close';
            this.itemContentContainer.appendChild(deletionIcon);
        }
        var itemNameContainer = document.createElement('span');
        itemNameContainer.className = 'ItemNameContainer';
        var itemContent = document.createTextNode(this.item.name);
        itemNameContainer.appendChild(itemContent);
        this.itemContentContainer.appendChild(itemNameContainer);
        this.itemContentContainer.onclick = this.ItemClicked();
        this.itemContentContainer.oncontextmenu = this.ItemMenu();
        menuIcon.onclick = this.ItemMenu();
        visibilityIcon.onclick = this.ViewClicked();
        if (deletionIcon) {
            deletionIcon.onclick = this.DeletionClicked();
        }
        var children = this.item.GetChildren();
        for (var index = 0; index < children.length; index++) {
            var son = new DataItem(children[index], dataHandler, scene);
            this.container.appendChild(son.GetContainerElement());
        }
    }
    //CAD Group folding management - When clickin a group icon
    DataItem.prototype.ItemFolded = function () {
        var self = this;
        return function (event) {
            var group = self.item;
            group.folded = !group.folded;
            self.dataHandler.NotifyChange();
            self.CancelBubbling(event);
        };
    };
    //When left - clicking an item
    DataItem.prototype.ItemClicked = function () {
        var self = this;
        return function (event) {
            self.dataHandler.currentItem = self.item;
            self.scene.Select(self.item);
            self.dataHandler.NotifyChange();
            self.CancelBubbling(event);
        };
    };
    //When right - clicking an item
    DataItem.prototype.ItemMenu = function () {
        var self = this;
        return function (event) {
            var actions = self.item.GetActions(self.dataHandler, function (createdObject) {
                if (createdObject) {
                    self.dataHandler.AddCreatedObject(self.scene, createdObject);
                }
                else {
                    self.dataHandler.NotifyChange();
                }
                return true;
            });
            Popup.CreatePopup(self, actions);
            self.dataHandler.currentItem = self.item;
            self.scene.Select(self.item);
            self.dataHandler.NotifyChange();
            self.CancelBubbling(event);
            return false;
        };
    };
    //When clicking the visibility icon next to an item
    DataItem.prototype.ViewClicked = function () {
        var self = this;
        return function (event) {
            self.item.visible = !self.item.visible;
            self.dataHandler.NotifyChange();
        };
    };
    //When clickin the deletion icon next to an item
    DataItem.prototype.DeletionClicked = function () {
        var self = this;
        return function (event) {
            event = event || window.event;
            if (confirm('Are you sure you want to delete "' + self.item.name + '" ?')) {
                self.item.owner.Remove(self.item);
                self.dataHandler.currentItem = null;
                self.dataHandler.NotifyChange();
                self.CancelBubbling(event);
            }
        };
    };
    DataItem.prototype.CancelBubbling = function (event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        else {
            event.cancelBubble = true;
        }
    };
    DataItem.prototype.GetElement = function () {
        return this.itemContentContainer;
    };
    DataItem.prototype.GetContainerElement = function () {
        return this.container;
    };
    return DataItem;
}());
//# sourceMappingURL=dataitem.js.map