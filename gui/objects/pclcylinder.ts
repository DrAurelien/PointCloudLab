/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/cylinder.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />


class PCLCylinder extends PCLShape {
	constructor(public cylinder: Cylinder) {
		super(NameProvider.GetName('Cylinder'));
	}

	GetShape(): Shape {
		return this.cylinder;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', () => self.cylinder.center, false, self.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Axis', () => self.cylinder.axis, true, self.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Radius', () => self.cylinder.radius, self.GeometryChangeHandler((value) => self.cylinder.radius = value)));
		geometry.Push(new NumberProperty('Height', () => self.cylinder.height, self.GeometryChangeHandler((value) => self.cylinder.height = value)));
		return geometry;
	}
}