class PCLPlane extends PCLShape {
	constructor(public plane: Plane, owner: PCLGroup = null) {
		super(NameProvider.GetName('Plane'), owner);
	}

	GetShape(): Shape {
		return this.plane;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', this.plane.center, false, this.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Normal', this.plane.normal, true, this.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Patch Radius', this.plane.patchRadius, this.GeometryChangeHandler((value) => self.plane.patchRadius = value)));
		return geometry;
	}
}