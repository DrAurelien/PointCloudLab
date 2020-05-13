/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/torus.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />


class PCLTorus extends PCLShape {
	constructor(public torus: Torus) {
		super(NameProvider.GetName('Torus'));
	}

	GetShape(): Shape {
		return this.torus;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', () => self.torus.center, false, this.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Axis', () => self.torus.axis, true, this.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Great Radius', () => self.torus.greatRadius, this.GeometryChangeHandler((value) => self.torus.greatRadius = value)));
		geometry.Push(new NumberProperty('Small Radius', () => self.torus.smallRadius, this.GeometryChangeHandler((value) => self.torus.smallRadius = value)));
		return geometry;
	}
}