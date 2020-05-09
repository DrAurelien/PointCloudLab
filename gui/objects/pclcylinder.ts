/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/cylinder.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />


class PCLCylinder extends PCLShape {
	constructor(public cylinder: Cylinder, owner: PCLGroup = null) {
		super(NameProvider.GetName('Cylinder'), owner);
	}

	GetShape(): Shape {
		return this.cylinder;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', this.cylinder.center, false, self.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Axis', this.cylinder.axis, true, self.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Radius', this.cylinder.radius, self.GeometryChangeHandler((value) => this.cylinder.radius = value)));
		geometry.Push(new NumberProperty('Height', this.cylinder.height, self.GeometryChangeHandler((value) => this.cylinder.height = value)));
		return geometry;
	}
}