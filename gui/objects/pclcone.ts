class PCLCone extends PCLShape {
	constructor(public cone: Cone, owner: PCLGroup = null) {
		super(NameProvider.GetName('Cone'), owner);
	}

	GetShape(): Shape {
		return this.cone;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Apex', this.cone.apex, false, self.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Axis', this.cone.axis, true, self.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Angle', Geometry.RadianToDegree(this.cone.angle), self.GeometryChangeHandler((value) => this.cone.angle = Geometry.DegreeToRadian(value))));
		geometry.Push(new NumberProperty('Height', this.cone.height, self.GeometryChangeHandler((value) => this.cone.height = value)));
		return geometry;
	}
}