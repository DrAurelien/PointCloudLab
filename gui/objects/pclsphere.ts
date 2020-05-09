/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/sphere.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />


class PCLSphere extends PCLShape {
	constructor(public sphere: Sphere, owner: PCLGroup = null) {
		super(NameProvider.GetName('Sphere'), owner);
	}

	GetShape(): Shape {
		return this.sphere;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', this.sphere.center, false, this.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Radius', this.sphere.radius, this.GeometryChangeHandler((value) => self.sphere.radius = value)));
		return geometry;
	};
}