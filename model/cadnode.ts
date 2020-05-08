/// <reference path="../tools/picking.ts" />


abstract class CADNode implements Pickable {
	owner: CADGroup;
	visible: boolean;
	selected: boolean;
	deletable: boolean;
	protected boundingbox: BoundingBox;

	constructor(public name: string, owner: CADGroup = null) {
		this.visible = true;
		this.selected = false;
		this.deletable = true;
		this.boundingbox = null;
		this.owner = null;
		if (owner) {
			owner.Add(this);
		}
	}

	abstract Draw(drawingContext: DrawingContext): void;
	abstract RayIntersection(ray: Ray): Picking;

	GetBoundingBox(): BoundingBox {
		return this.boundingbox;
	}

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

	GetChildren(): CADNode[] {
		return [];
	}

	Apply(proc: CADNodeHandler): boolean {
		return proc(this);
	}
}

interface CADNodeHandler {
	(primitive: CADNode): boolean;
}