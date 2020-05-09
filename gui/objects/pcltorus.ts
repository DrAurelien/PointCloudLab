/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/torus.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />


class PCLTorus extends PCLShape {
	constructor(public torus: Torus, owner: PCLGroup = null) {
		super(NameProvider.GetName('Torus'), owner);
	}

	GetShape(): Shape {
		return this.torus;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', this.torus.center, false, this.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Axis', this.torus.axis, true, this.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Great Radius', this.torus.greatRadius, this.GeometryChangeHandler((value) => self.torus.greatRadius = value)));
		geometry.Push(new NumberProperty('Small Radius', this.torus.smallRadius, this.GeometryChangeHandler((value) => self.torus.smallRadius = value)));
		return geometry;
	}
}