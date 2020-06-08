/// <reference path="control.ts" />
/// <reference path="popup.ts" />
/// <reference path="../objects/pclnode.ts" />
/// <reference path="../objects/pclgroup.ts" />
/// <reference path="../datahandler.ts" />
/// <reference path="./colorscale/colorscale.ts" />


class DataItem implements Control, Notifiable {
	container: HTMLDivElement;
	itemContentContainer: HTMLDivElement;
	itemChildContainer: HTMLDivElement;
	itemIcon: HTMLElement;
	itemName: Text;
	visibilityIcon: HTMLElement;
	sons: DataItem[];
	uuid: number;

	//Fast access to all the data items
	static ItemsCache: DataItem[] = [];
	static IdPrefix = 'DataItem#';
	static GetItemById(id: string): DataItem {
		let key = parseInt(id.replace(DataItem.IdPrefix, ''), 10);
		return DataItem.ItemsCache[key];
	}
	static GetId(uuid: number) {
		return DataItem.IdPrefix + uuid;
	}

	//Here we go
	constructor(public item: PCLNode, private dataHandler: DataHandler) {
		this.uuid = DataItem.ItemsCache.length;
		DataItem.ItemsCache.push(this);
		this.sons = [];

		this.container = <HTMLDivElement>document.createElement('div');
		this.container.className = 'TreeItemContainer';
		this.container.id = DataItem.GetId(this.uuid);
		this.container.draggable = true;

		this.itemContentContainer = <HTMLDivElement>document.createElement('div');
		this.itemContentContainer.className = item.selected ? 'SelectedSceneItem' : 'SceneItem';
		this.container.appendChild(this.itemContentContainer);

		//Diplay a small icon to show the itam nature
		this.itemIcon = document.createElement('i');
		this.itemIcon.className = 'ItemIcon fa ' + this.item.GetDisplayIcon();
		this.itemContentContainer.appendChild(this.itemIcon);
		if (this.item instanceof PCLGroup) {
			this.itemIcon.onclick = this.ItemFolded();
			this.itemContentContainer.ondblclick = this.ItemFolded();
		}

		let self = this;

		//Quick actions (visibility, menu, deletion)
		this.visibilityIcon = document.createElement('i');
		this.visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
		this.itemContentContainer.appendChild(this.visibilityIcon);
		this.visibilityIcon.onclick = (ev) => self.ViewClicked();

		let menuIcon = document.createElement('i');
		menuIcon.className = 'ItemAction fa fa-ellipsis-h';
		this.itemContentContainer.appendChild(menuIcon);
		menuIcon.onclick = (ev: MouseEvent) => this.ItemMenu(ev);

		let deletionIcon = null;
		if (this.item.deletable) {
			deletionIcon = document.createElement('i');
			deletionIcon.className = 'ItemAction fa fa-trash';
			this.itemContentContainer.appendChild(deletionIcon);
			deletionIcon.onclick = (ev) => self.DeletionClicked(ev);
		}

		//The item name by itself
		let itemNameContainer = document.createElement('span');
		itemNameContainer.className = 'ItemNameContainer';
		this.itemName = document.createTextNode(this.item.name);
		itemNameContainer.appendChild(this.itemName);
		this.itemContentContainer.appendChild(itemNameContainer);

		//Handle left/right click on the item title
		this.itemContentContainer.onclick = (ev) => self.ItemClicked(ev);
		this.itemContentContainer.oncontextmenu = (ev) => this.ItemMenu(ev);

		//Handle Drag'n drop
		this.InitializeDrapNDrop();

		//Populate children
		this.itemChildContainer = document.createElement('div');
		this.itemChildContainer.className = 'ItemChildContainer';
		if (item instanceof PCLGroup) {
			this.UpdateGroupFolding(item);
		}
		this.container.appendChild(this.itemChildContainer);

		let children = item.GetChildren();
		for (let index = 0; index < children.length; index++) {
			this.AddSon(children[index]);
		}

		//Bind HTML content to match the actual state of the item
		item.AddChangeListener(this);
		item.AddChangeListener(this.dataHandler.selection);
	}

	private ClearDrapNDropStyles() {
		this.container.classList.remove('DropInside');
		this.container.classList.remove('DropBefore');
		this.container.classList.remove('DropAfter');
	}

	private InitializeDrapNDrop() {
		this.container.ondragstart = (ev: DragEvent) => {
			ev.stopPropagation();
			ev.dataTransfer.setData("application/my-app", ((ev.target) as HTMLElement).id);
			ev.dataTransfer.dropEffect = 'move';
			if (PCLNode.IsPCLContainer(this.item)) {
				(this.item as PCLGroup).SetFolding(true);
			}
		};

		this.container.ondragover = (ev: DragEvent) => {
			ev.preventDefault();
			ev.stopPropagation();
			ev.dataTransfer.dropEffect = 'move';
			let target = (ev.target) as HTMLElement;
			if (PCLNode.IsPCLContainer(this.item) && target.classList.contains('ItemIcon')) {
				this.container.classList.add('DropInside');
				(this.item as PCLGroup).SetFolding(false);
			}
			else {
				if (ev.offsetY > this.itemContentContainer.clientHeight / 2) {
					this.container.classList.remove('DropBefore');
					this.container.classList.add('DropAfter');
				}
				else {
					this.container.classList.remove('DropAfter');
					this.container.classList.add('DropBefore');
				}
			}
		};

		this.container.ondragleave = (ev: DragEvent) => {
			ev.stopPropagation();
			this.ClearDrapNDropStyles();
		};

		this.container.ondragend = (ev: DragEvent) => {
			this.ClearDrapNDropStyles();
		};

		this.container.ondrop = (ev: DragEvent) => {
			ev.preventDefault();
			ev.stopPropagation();
			let sourceId = ev.dataTransfer.getData("application/my-app");
			let source = DataItem.GetItemById(sourceId).item;
			let target = this.item;
			if (PCLNode.IsPCLContainer(target) && (ev.target as HTMLElement).classList.contains('ItemIcon')) {
				(target as PCLContainer).Add(source);
			}
			else {
				if (ev.offsetY > this.itemContentContainer.clientHeight / 2) {
					(target.owner).Insert(source, target, PCLInsertionMode.After);
				}
				else {
					(target.owner).Insert(source, target, PCLInsertionMode.Before);
				}
			}
			this.ClearDrapNDropStyles();
		};
	}

	// Hierarchy management
	AddSon(item: PCLNode, index: number=null) {
		let son = new DataItem(item, this.dataHandler);
		if (index === null) {
			this.sons.push(son);
			this.itemChildContainer.appendChild(son.GetContainerElement());
		}
		else {
			this.sons.splice(index, 0, son);
			this.itemChildContainer.insertBefore(son.GetContainerElement(), this.itemChildContainer.childNodes[index]);
		}
	}

	RemoveSon(index: number) {
		this.sons.splice(index, 1);
		this.itemChildContainer.removeChild(this.itemChildContainer.childNodes[index]);
	}

	SwapSons(a: number, b: number) {
		let son = this.sons[a];
		this.sons[a] = this.sons[b];
		this.sons[b] = son;

		let container = this.itemChildContainer;
		let child = container.removeChild(container.childNodes[a]);
		container.insertBefore(container.childNodes[b], container.childNodes[a]);
		container.insertBefore(child, container.childNodes.length > b ? container.childNodes[b] : null);
	}

	FindSon(item: PCLNode): number {
		for (let index = 0; index < this.sons.length; index++) {
			if (this.sons[index].item === item)
				return index;
		}
		return -1;
	}

	Refresh() {
		if (this.item instanceof PCLGroup) {
			this.UpdateGroupFolding(this.item as PCLGroup);
		}
		this.itemName.data = this.item.name;
		this.itemContentContainer.className = this.item.selected ? 'SelectedSceneItem' : 'SceneItem';
		this.itemIcon.className = 'ItemIcon fa ' + this.item.GetDisplayIcon();
		this.visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
	}

	RefreshChildsList() {
		let children = this.item.GetChildren();
		//First - check for insertions
		for (let index = 0; index < children.length; index++) {
			let child = children[index];
			let sonIndex = this.FindSon(child);
			if (sonIndex < 0) {
				this.AddSon(child, index);
			}
			else if (sonIndex != index) {
				this.SwapSons(sonIndex, index);
			}
		}
		//Now sons equals item.children from 0 to item.chidren.length. The remaining nodes must be removed
		while (this.sons.length > children.length) {
			this.RemoveSon(children.length);
		}
	}

	//Whenever the data changes, handle it
	NotifyChange(source: PCLNode, change: ChangeType) {
		this.Refresh();

		if (change & ChangeType.Creation) {
			if (!source.owner) {
				let owner = this.dataHandler.GetNewItemOwner();
				owner.Add(source);
			}
			this.dataHandler.DeclareNewItem(source);
		}

		if (change & ChangeType.Children) {
			this.RefreshChildsList();
		}

		if (change & ChangeType.Display) {
			this.dataHandler.AskRendering();
		}

		if (change & ChangeType.ColorScale) {
			this.dataHandler.RefreshColorScale();
		}

		if (change & ChangeType.Properties) {
			this.dataHandler.UpdateProperties();
		}

		if (change & ChangeType.TakeFocus) {
			this.dataHandler.FocusOnItem(source);
		}
	}

	//Group folding management - When clicking a group icon
	ItemFolded(): (ev: MouseEvent) => any {
		let self = this;
		return function (event: MouseEvent) {
			(self.item as PCLGroup).ToggleFolding();
			self.CancelBubbling(event);
		}
	}

	UpdateGroupFolding(item: PCLGroup) {
		this.itemChildContainer.style.display = item.folded ? 'none' : 'block';
	}

	//When left - clicking an item
	ItemClicked(ev: MouseEvent) {
		let event : MouseEvent = ev || (window.event as MouseEvent);
		if (event.ctrlKey) {
			this.item.ToggleSelection();
		}
		else {
			this.dataHandler.selection.SingleSelect(this.item);
			new TemporaryHint('You can select multiple items by pressing the CTRL key when clicking an element');
		}
		this.CancelBubbling(event);
	}

	//When right - clicking an item
	ItemMenu(ev: MouseEvent): boolean {
		let event: MouseEvent = ev || (window.event as MouseEvent);
		if (event.ctrlKey) {
			this.item.Select(true);
		}
		else {
			this.dataHandler.selection.SingleSelect(this.item);
		}
		let actions = this.dataHandler.selection.GetActions(this.dataHandler.GetActionsDelegate());
		if (actions) {
			Popup.CreatePopup(this.itemContentContainer, actions);
		}
		this.CancelBubbling(event);
		return false;
	}

	//When clicking the visibility icon next to an item
	ViewClicked() {
		this.item.ToggleVisibility();
	}

	//When clicking the deletion icon next to an item
	DeletionClicked(ev: MouseEvent) {
		let event = ev || window.event as MouseEvent;

		if (confirm('Are you sure you want to delete "' + this.item.name + '" ?')) {
			this.item.Select(false);
			this.item.owner.Remove(this.item);
			this.CancelBubbling(event);
		}
	}

	private CancelBubbling(event: MouseEvent): void {
		if (event.stopPropagation) {
			event.stopPropagation();
		}
		else {
			event.cancelBubble = true;
		}
	}

	GetElement(): HTMLElement {
		return this.container;
	}

	GetContainerElement(): HTMLElement {
		return this.container;
	}
}