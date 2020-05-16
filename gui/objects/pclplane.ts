/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/plane.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />


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

	GetSerializationID(): string {
		return 'PLANE';
	}

	SerializePrimitive(serializer: PCLSerializer) {
		let plane = this.plane;
		serializer.PushParameter('center', (s) => {
			s.PushFloat32(plane.center.Get(0));
			s.PushFloat32(plane.center.Get(1));
			s.PushFloat32(plane.center.Get(2));
		});
		serializer.PushParameter('normal', (s) => {
			s.PushFloat32(plane.normal.Get(0));
			s.PushFloat32(plane.normal.Get(1));
			s.PushFloat32(plane.normal.Get(2));
		});
		serializer.PushParameter('radius', (s) => {
			s.PushFloat32(plane.patchRadius);
		});
	}
}