/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/plane.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />


class PCLPlane extends PCLShape {
	constructor(public plane: Plane) {
		super(NameProvider.GetName('Plane'));
	}

	GetShape(): Shape {
		return this.plane;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', () => self.plane.center, false, this.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Normal', () => self.plane.normal, true, this.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Patch Radius', () => self.plane.patchRadius, this.GeometryChangeHandler((value) => self.plane.patchRadius = value)));
		return geometry;
	}
}