/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />


interface PCLContainer {
	Add(PCLNode);
	Remove(PCLNode);
}

abstract class PCLNode implements Pickable {
	owner: PCLContainer;
	visible: boolean;
	selected: boolean;
	deletable: boolean;

	constructor(public name: string, owner: PCLContainer = null) {
		this.visible = true;
		this.selected = false;
		this.deletable = true;
		this.owner = null;
		if (owner) {
			owner.Add(this);
		}
	}

	Draw(drawingContext: DrawingContext): void {
		if (this.visible) {
			this.DrawNode(drawingContext);

			if (this.selected) {
				let boundingbox = this.GetBoundingBox();
				if (boundingbox && boundingbox.IsValid()) {
					this.GetBoundingBox().Draw(drawingContext);
				}
			}
		}
	}

	abstract DrawNode(drawingContext: DrawingContext): void;
	abstract RayIntersection(ray: Ray): Picking;
	abstract GetBoundingBox(): BoundingBox;

	GetProperties(): Properties {
		let self = this;
		let properties = new Properties();
		properties.Push(new StringProperty('Name', this.name, (newName) => self.name = newName));
		properties.Push(new BooleanProperty('Visible', this.visible, (newVilibility) => self.visible = newVilibility));
		return properties;
	}

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let self = this;
		let result: Action[] = [];
		if (this.deletable) {
			result.push(new SimpleAction('Remove', () => { self.owner.Remove(self); return onDone(null); }));
		}
		if (this.visible) {
			result.push(new SimpleAction('Hide', () => { self.visible = false; return onDone(null); }));
		}
		else {
			result.push(new SimpleAction('Show', () => { self.visible = true; return onDone(null); }));
		}
		return result;
	}

	GetChildren(): PCLNode[] {
		return [];
	}

	Apply(proc: CADNodeHandler): boolean {
		return proc(this);
	}
}

interface CADNodeHandler {
	(primitive: PCLNode): boolean;
}