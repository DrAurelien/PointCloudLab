abstract class CADPrimitive {
	material: Material;
	visible: boolean;
	selected: boolean;
	protected boundingbox: BoundingBox;

    constructor(public name: string) {
		this.material = new Material([0.0, 1.0, 0.0]);
		this.visible = true;
		this.selected = false;
		this.boundingbox = null;
    }

    abstract RayIntersection(ray: Ray): number[];
	
	GetBoundingBox(): BoundingBox {
		return this.boundingbox;
	}

	GetProperties(): Properties {
		let properties = new Properties;
		properties.Push('Name', this.name);
		properties.Push('Visible', this.visible ? "1" : "0");
		properties.Push('Material', this.material);
		return properties;
	}

	SetProperties(properties: Properties): void {
		this.name = properties.Get('Name');
		this.visible = properties.Get('Visible') == '1';
		this.material = properties.Get('Material');
	}
}