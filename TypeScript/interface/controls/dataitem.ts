﻿class DataItem implements Control {
	container : HTMLDivElement;

	constructor(public item: CADPrimitive, private dataHandler: DataHandler, private scene: Scene) {
		this.container = <HTMLDivElement>document.createElement('div');
		this.container.className = (this.item == this.dataHandler.currentItem) ? 'SelectedSceneItem' : 'SceneItem';

		let visibilityIcon = document.createElement('i');
		visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
		this.container.appendChild(visibilityIcon);

		let deletionIcon = null;
		if (this.item.owner) {
			deletionIcon = document.createElement('i');
			deletionIcon.className = 'ItemAction fa fa-close';
			this.container.appendChild(deletionIcon);
		}

		let itemContentContainer = document.createElement('span');
		itemContentContainer.className = 'ItemNameContainer';

		let itemContent = document.createTextNode(this.item.name);
		itemContentContainer.appendChild(itemContent);
		this.container.appendChild(itemContentContainer);

		this.container.onclick = this.ItemClicked();
		this.container.oncontextmenu = this.ItemMenu();
		visibilityIcon.onclick = this.ViewClicked();
		if (deletionIcon) {
			deletionIcon.onclick = this.DeletionClicked();
		}

		let children = this.item.GetChildren();
		for (let index = 0; index < children.length; index++) {
			let son = new DataItem(children[index], dataHandler, scene);
			this.container.appendChild(son.container);
		}
	}

	Refresh() {
		if (this.dataHandler.updateCallback != null) {
			this.dataHandler.updateCallback();
		}
		else {
			this.dataHandler.RefreshContent(this.scene);
		}
	}

	//When left - clicking an item
	ItemClicked(): (ev:MouseEvent)=>any {
		let self = this;
		return function (event: MouseEvent) {
			self.dataHandler.currentItem = self.item;
			self.scene.Select(self.item);
			self.Refresh();
			self.CancelBubbling(event);
		}
	}

	//When right - clicking an item
	ItemMenu(): (ev: PointerEvent) => any {
		let self = this;
		return function (event: PointerEvent) {
			let actions = self.item.GetActions(
				function (createdObject) {
					if (createdObject) {
						self.dataHandler.AddCreatedObject(self.scene, createdObject);
					}
					else {
						self.Refresh();
					}
				}
			);
			Popup.CreatePopup(self, actions);
			self.CancelBubbling(event);
			return false;
		}
	}

	//When clicking the visibility icon next to an item
	ViewClicked(): (ev: MouseEvent) => any {
		let self = this;
		return function (event: MouseEvent) {
			self.item.visible = !self.item.visible;
			self.Refresh();
		}
	}

	//When clickin the deletion icon next to an item
	DeletionClicked(): (ev: MouseEvent) => any {
		let self = this;
		return function (event: MouseEvent) {
			event = event || <MouseEvent>window.event;

			if (confirm('Are you sure you want to delete "' + self.item.name + '" ?')) {
				self.item.owner.Remove(self.item);
				self.dataHandler.currentItem = null;
				self.Refresh();
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
}