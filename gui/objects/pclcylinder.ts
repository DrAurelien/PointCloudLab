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

	GetSerializationID(): string {
		return 'CYLINDER';
	}

	SerializePrimitive(serializer: PCLSerializer) {
		let cylinder = this.cylinder;
		serializer.PushParameter('center', (s) => {
			s.PushFloat32(cylinder.center.Get(0));
			s.PushFloat32(cylinder.center.Get(1));
			s.PushFloat32(cylinder.center.Get(2));
		});
		serializer.PushParameter('axis', (s) => {
			s.PushFloat32(cylinder.axis.Get(0));
			s.PushFloat32(cylinder.axis.Get(1));
			s.PushFloat32(cylinder.axis.Get(2));
		});
		serializer.PushParameter('radius', (s) => {
			s.PushFloat32(cylinder.radius);
		});
		serializer.PushParameter('height', (s) => {
			s.PushFloat32(cylinder.height);
		});
	}
}