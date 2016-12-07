abstract class Shape extends CADPrimitive{
    visible: boolean;
	mesh: Mesh;

	constructor(name: string) {
		super(name);
		this.mesh = null;
	}

    abstract GetGeometry(): Properties;
    abstract SetGeometry(geometry: Properties): void;

    abstract ComputeMesh(sampling: number): Mesh;
	abstract ComputeBoundingBox(): BoundingBox;

    abstract RayIntersection(ray: Ray): number[];

	abstract Distance(point: Vector): number;

	GetBoundingBox(): BoundingBox{
		if (!this.boundingbox) {
			this.boundingbox = this.ComputeBoundingBox();
		}
		return this.boundingbox;
	}

	Draw(drawingContext: DrawingContext) {
		if (!this.mesh) {
			this.mesh = this.ComputeMesh(drawingContext.sampling);
		}
		if (this.visible) {
			this.mesh.material = this.material;
			this.mesh.Draw(drawingContext);

			if (this.selected) {
				var box = this.GetBoundingBox();
				box.Draw(drawingContext);
			}
		}
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();
		let geometry = this.GetGeometry();
		properties.Select();
		properties.PushProperties('Geometry', properties);
		return properties;
	}
}