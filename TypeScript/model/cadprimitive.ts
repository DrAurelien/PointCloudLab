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
		let properties = new Properties();
		properties.Push('Name', this.name);
		properties.Push('Visible', this.visible ? "1" : "0");
		properties.PushProperties('Material', this.material.GetProperties());
		return properties;
	}

	SetProperties(properties: Properties): boolean {
		this.name = properties.Get('Name');
		this.visible = properties.Get('Visible') == '1';
		return this.material.SetProperties(properties.GetAsProperties('Material'));
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