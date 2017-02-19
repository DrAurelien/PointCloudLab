abstract class Shape extends CADPrimitive{
    visible: boolean;
	mesh: Mesh;

	constructor(name: string, owner: CADGroup) {
		super(name, owner);
		this.mesh = null;
	}

    abstract GetGeometry(): Properties;
    abstract SetGeometry(geometry: Properties): boolean;

    abstract ComputeMesh(sampling: number): Mesh;
	abstract ComputeBoundingBox(): BoundingBox;

    protected abstract RayIntersections(ray: Ray): number[];

	abstract Distance(point: Vector): number;

    RayIntersection(ray: Ray): Picking {
        let distances = this.RayIntersections(ray);
        let result = new Picking(this);
        for (var index = 0; index < distances.length; index++) {
            result.Add(distances[index]);
        }
        return result;
    }

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
		properties.PushProperties('Geometry', geometry);
		return properties;
	}

	SetProperties(properties: Properties): boolean {
		return this.SetGeometry(properties.GetAsProperties('Geometry')) && super.SetProperties(properties);
	}
}