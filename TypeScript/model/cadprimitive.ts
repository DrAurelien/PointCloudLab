abstract class CADPrimitive extends CADNode {
	material: Material;

    constructor(public name: string, owner: CADPrimitivesContainer = null) {
		super(name, owner);
		this.material = new Material([0.0, 1.0, 0.0]);

    }

	GetProperties(): Properties {
		let properties = super.GetProperties();
		properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
		return properties;
	}

    abstract Draw(drawingContext: DrawingContext): void;
    abstract RayIntersection(ray: Ray): Picking;
}