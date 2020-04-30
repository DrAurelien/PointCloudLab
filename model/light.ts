class Light extends CADNode {
	sphere: Sphere;

	constructor(center: Vector, owner: LightsContainer=null) {
		super(NameProvider.GetName("Light"), owner);
		this.sphere = new Sphere(center, 0.01);
		this.sphere.material.baseColor = [1.0, 1.0, 1.0];
	}

	public get Position(): Vector {
		return this.sphere.center;
	}
	public set Position(p: Vector) {
		this.sphere.center = p;
		this.sphere.Invalidate();
	}

	public get Color(): number[] {
		return this.sphere.material.baseColor;
	}
	public set Color(c: number[]) {
		this.sphere.material.baseColor = c;
	}

	Draw(drawingContext: DrawingContext): void {
		this.sphere.Draw(drawingContext);
	}

    RayIntersection(ray: Ray): Picking {
		return this.sphere.RayIntersection(ray);
	}
	
	GetProperties(): Properties {
		let self = this;
		let properties = super.GetProperties();
		properties.Push(new VectorProperty('Position', this.Position, false, (newPosition) => self.Position = newPosition));
		properties.Push(new ColorProperty('Color', this.Color, (newColor) => self.Color = newColor));
		return properties;
	}
}