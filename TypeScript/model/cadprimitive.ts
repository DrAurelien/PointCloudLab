abstract class CADPrimitive {
	owner: CADGroup;
	material: Material;
	visible: boolean;
    selected: boolean;
    protected boundingbox: BoundingBox;

    constructor(public name: string, owner: CADGroup = null) {
		this.material = new Material([0.0, 1.0, 0.0]);
		this.visible = true;
		this.selected = false;
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
		properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
		return properties;
	}

	GetActions(dataHandler: DataHandler, onDone: CADPrimitiveHandler): Action[] {
		let self = this;
		let result: Action[] = [];
		if (this.owner) {
			result.push(new Action('Remove', () => { self.owner.Remove(self); return onDone(null); }));
		}
		if (this.visible) {
			result.push(new Action('Hide', () => { self.visible = false; return onDone(null); }));
		}
		else {
			result.push(new Action('Show', () => { self.visible = true; return onDone(null); }));
		}
		return result;
    }

	GetChildren(): CADPrimitive[] {
		return [];
	}

    Apply(proc: CADPrimitiveHandler): boolean {
        return proc(this);
    }
}

interface CADPrimitiveHandler {
    (primitive: CADPrimitive): boolean;
}