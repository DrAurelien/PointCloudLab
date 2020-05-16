/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/sphere.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />


class PCLSphere extends PCLShape {
	constructor(public sphere: Sphere) {
		super(NameProvider.GetName('Sphere'));
	}

	GetShape(): Shape {
		return this.sphere;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', () => self.sphere.center, false, this.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Radius', () => self.sphere.radius, this.GeometryChangeHandler((value) => self.sphere.radius = value)));
		return geometry;
	};

	GetSerializationID(): string {
		return 'SPHERE';
	}

	SerializePrimitive(serializer: PCLSerializer) {
		let sphere = this.sphere;
		serializer.PushParameter('center', (s) => {
			s.PushFloat32(sphere.center.Get(0));
			s.PushFloat32(sphere.center.Get(1));
			s.PushFloat32(sphere.center.Get(2));
		});
		serializer.PushParameter('radius', (s) => {
			s.PushFloat32(sphere.radius);
		});
	}
}