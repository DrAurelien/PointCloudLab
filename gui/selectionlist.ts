/// <reference path="objects/pclnode.ts" />
/// <reference path="controls/properties/properties.ts" />
/// <reference path="../controler/actions/action.ts" />
/// <reference path="../model/boundingbox.ts" />


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
		let actions: Action[] = []

		let self = this;
		if (this.Size() > 1) {
			actions.push(new SimpleAction('Hide all', () => this.ShowAll(false), 'Hide all the selected items'));
			actions.push(new SimpleAction('Show all', () => this.ShowAll(true), 'Show all the selected items'));
			actions.push(null);
		}

		if (this.Size() == 1) {
			actions = this.items[0].GetActions(delegate);
		}
		else if (this.Size() == 2) {
			let cloudindex = this.FindFirst(n => n instanceof PCLPointCloud);
			if (cloudindex>=0) {
				actions = actions || [];
				let cloud = this.items[cloudindex] as PCLPointCloud;
				let other = this.items[1 - cloudindex];

				actions.push(new ComputeDistancesAction(cloud, other));
			}

			if (this.items[0] instanceof PCLPointCloud && this.items[1] instanceof PCLPointCloud) {
				actions.push(new RegistrationAction(this.items[0] as PCLPointCloud, this.items[1] as PCLPointCloud));
			}
		}

		return actions;
	}

	FindFirst(test: Function): number {
		for (let index = 0; index < this.items.length; index++) {
			if (test(this.items[index]))
				return index;
		}
		return -1;
	}

	ShowAll(b: boolean) {
		for (let index = 0; index < this.Size(); index++) {
			this.items[index].SetVisibility(b);
		}
	}

	GetSingleSelection(): PCLNode {
		return this.items.length == 1 ? this.items[0] : null;
	}

	SingleSelect(node: PCLNode) {
		let changeHandler = this.changeHandler;
		this.changeHandler = null;
		if (node) {
			node.Select(true);
		}
		while (this.items.length) {
			let length = this.items.length;
			let last = this.items[length - 1];
			if (last != node) {
				last.Select(false);
			}
			if (this.items.length == length) {
				this.items.pop();
			}
		}
		if (node) {
			this.items.push(node);
		}
		this.changeHandler = changeHandler;
		this.changeHandler.OnSelectionChange(this);
	}
}