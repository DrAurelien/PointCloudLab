/// <reference path="pclnode.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../model/boundingbox.ts" />


interface SelectionChangeHandler {
	OnSelectionChange(selection : SelectionList);
}

class SelectionList implements Notifiable {
	items: PCLNode[];
	ownProperties: Properties;

	constructor(private changeHandler: SelectionChangeHandler) {
		this.items = [];
	}

	RegisterListenableItem(item: PCLNode) {
		item.AddChangeListener(this);
		this.UpdateSelectionList(item);
	}

	NotifyChange(node: PCLNode, type: ChangeType) {
		if (type === ChangeType.Selection) {
			this.UpdateSelectionList(node);
		}
	}

	UpdateSelectionList(item: PCLNode) {
		let itemIndex = this.items.indexOf(item);
		if (item.selected && itemIndex < 0) {
			this.items.push(item);
			if (this.changeHandler) {
				this.changeHandler.OnSelectionChange(this);
			}
		}
		else if (!item.selected && itemIndex >= 0) {
			this.items.splice(itemIndex, 1);
			if (this.changeHandler) {
				this.changeHandler.OnSelectionChange(this);
			}
		}
	}

	GetBoundingBox(): BoundingBox {
		let box = new BoundingBox();
		for (let index = 0; index < this.items.length; index++) {
			box.AddBoundingBox(this.items[index].GetBoundingBox());
		}
		return box;
	}

	Size(): number {
		return this.items.length;
	}

	GetProperties(): Properties {
		if (this.Size() == 1) {
			return this.items[0].GetProperties();
		}
		else if (this.Size() > 1) {
			if (!this.ownProperties) {
				let self = this;
				this.ownProperties = new Properties();
				this.ownProperties.Push(new NumberProperty('Selected items', () => self.Size(), null));
			}
			return this.ownProperties;
		}
		return null;
	}

	GetActions(delegate: ActionDelegate): Action[] {
		let actions: Action[] = null
		if (this.Size() == 1) {
			actions = this.items[0].GetActions(delegate);
		}
		else {
			if (this.Size() == 2 && this.items[0] instanceof PCLPointCloud) {
				actions = actions || [];
				actions.push(new ComputeDistancesAction(this.items[0] as PCLPointCloud, this.items[1]));
			}
		}
		return actions;
	}

	GetSingleSelection(): PCLNode {
		return this.items.length == 1 ? this.items[0] : null;
	}

	Clear() {
		while (this.items.length) {
			this.items.pop().Select(false);
		}
	}
}