/// <reference path="control.ts" />
/// <reference path="popup.ts" />
/// <reference path="../objects/pclnode.ts" />
/// <reference path="../objects/pclgroup.ts" />
/// <reference path="../datahandler.ts" />


class DataItem implements Control {
	container: HTMLDivElement;
	itemContentContainer: HTMLDivElement;
	itemChildContainer: HTMLDivElement;
	itemIcon: HTMLElement;
	itemName: Text;
	visibilityIcon: HTMLElement;
	sons: DataItem[];

	constructor(public item: PCLNode, private dataHandler: DataHandler) {
		this.sons = [];

		this.container = <HTMLDivElement>document.createElement('div');
		this.container.className = 'TreeItemContainer';

		this.itemContentContainer = <HTMLDivElement>document.createElement('div');
		this.itemContentContainer.className = (this.item.selected) ? 'SelectedSceneItem' : 'SceneItem';
		this.container.appendChild(this.itemContentContainer);

		//Diplay a small icon to show the itam nature
		this.itemIcon = document.createElement('i');
		this.itemIcon.className = 'ItemIcon fa ' + this.item.GetDisplayIcon();
		this.itemContentContainer.appendChild(this.itemIcon);
		if (this.item instanceof PCLGroup) {
			this.itemIcon.onclick = this.ItemFolded();
			this.itemContentContainer.ondblclick = this.ItemFolded();
		}

		//Quick actions (visibility, menu, deletion)
		this.visibilityIcon = document.createElement('i');
		this.visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
		this.itemContentContainer.appendChild(this.visibilityIcon);
		this.visibilityIcon.onclick = this.ViewClicked();

		let menuIcon = document.createElement('i');
		menuIcon.className = 'ItemAction fa fa-ellipsis-h';
		this.itemContentContainer.appendChild(menuIcon);
		menuIcon.onclick = this.ItemMenu();

		let deletionIcon = null;
		if (this.item.deletable) {
			deletionIcon = document.createElement('i');
			deletionIcon.className = 'ItemAction fa fa-trash';
			this.itemContentContainer.appendChild(deletionIcon);
			deletionIcon.onclick = this.DeletionClicked();
		}

		//The item name by itself
		let itemNameContainer = document.createElement('span');
		itemNameContainer.className = 'ItemNameContainer';
		this.itemName = document.createTextNode(this.item.name);
		itemNameContainer.appendChild(this.itemName);
		this.itemContentContainer.appendChild(itemNameContainer);

		//Handle left/right click on the item title
		this.itemContentContainer.onclick = this.ItemClicked();
		this.itemContentContainer.oncontextmenu = this.ItemMenu();

		//Populate children
		this.itemChildContainer = document.createElement('div');
		this.itemChildContainer.className = 'ItemChildContainer';
		if (item instanceof PCLGroup) {
			this.UpdateGroupFolding(item);
		}
		this.container.appendChild(this.itemChildContainer);
		let children = this.item.GetChildren();
		for (let index = 0; index < children.length; index++) {
			this.AddSon(children[index]);
		}

		//Bind HTML content to match the actual state of the item
		let self = this;
		item.AddChangeListener((source: PCLNode, change: ChangeType) => self.OnItemChange(source, change));
	}

	// Hierarchy management
	AddSon(item: PCLNode, index?: number) {
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
		this.itemContentContainer.className = (this.item.selected) ? 'SelectedSceneItem' : 'SceneItem';
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
	OnItemChange(source: PCLNode, change: ChangeType) {
		this.Refresh();

		if (change & ChangeType.Selection) {
			let currentItem = this.dataHandler.GetCurrentItem();
			if (source.selected && currentItem !== source) {
				this.dataHandler.SetCurrentItem(source);
			}
			else if (!source.selected && currentItem === source) {
				this.dataHandler.SetCurrentItem(null);
			}
		}

		if (change & ChangeType.Creation) {
			if (!source.owner) {
				let owner = this.dataHandler.GetNewItemOwner();
				owner.Add(source);
			}
			this.dataHandler.SetCurrentItem(source);
		}

		if (change & ChangeType.Children) {
			this.RefreshChildsList();
		}

		if (change & ChangeType.Display) {
			this.dataHandler.AskRendering();
		}

		if (change & ChangeType.Properties) {
			if (this.dataHandler.GetCurrentItem() == source) {
				source.GetProperties().Refresh();
			}
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
	ItemClicked(): (ev: MouseEvent) => any {
		let self = this;
		return function (event: MouseEvent) {
			self.dataHandler.SetCurrentItem(self.item);
			self.CancelBubbling(event);
		}
	}

	//When right - clicking an item
	ItemMenu(): (ev: PointerEvent) => any {
		let self = this;
		return function (event: PointerEvent) {
			let actions = self.item.GetActions(
				self.dataHandler.GetActionsDelegate()
			);
			self.dataHandler.SetCurrentItem(self.item);
			Popup.CreatePopup(self, actions);
			self.CancelBubbling(event);
			return false;
		}
	}

	//When clicking the visibility icon next to an item
	ViewClicked(): (ev: MouseEvent) => any {
		let self = this;
		return function (event: MouseEvent) {
			self.item.ToggleVisibility();
		}
	}

	//When clicking the deletion icon next to an item
	DeletionClicked(): (ev: MouseEvent) => any {
		let self = this;
		return function (event: MouseEvent) {
			event = event || <MouseEvent>window.event;

			if (confirm('Are you sure you want to delete "' + self.item.name + '" ?')) {
				self.item.owner.Remove(self.item);
				self.dataHandler.SetCurrentItem(null);
				self.CancelBubbling(event);
			}
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