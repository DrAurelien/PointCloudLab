abstract class CADPrimitive {
    owner: CADGroup;
	material: Material;
	visible: boolean;
    selected: boolean;
    protected boundingbox: BoundingBox;

    constructor(public name: string) {
        this.owner = null;
		this.material = new Material([0.0, 1.0, 0.0]);
		this.visible = true;
		this.selected = false;
		this.boundingbox = null;
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

	GetActions(onDone: Function): Action[] {
		return [];
    }

	GetChildren(): CADPrimitive[] {
		return [];
	}

    Apply(proc: CADProcedure): boolean {
        return proc(this);
    }
}

interface CADProcedure {
    (primitive: CADPrimitive): boolean;
}