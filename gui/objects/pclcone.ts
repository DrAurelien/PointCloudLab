/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/cone.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />


class PCLCone extends PCLShape {
	constructor(public cone: Cone) {
		super(NameProvider.GetName('Cone'));
	}

	GetShape(): Shape {
		return this.cone;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Apex', () => self.cone.apex, false, self.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Axis', () => self.cone.axis, true, self.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Angle', () => Geometry.RadianToDegree(self.cone.angle), self.GeometryChangeHandler((value) => self.cone.angle = Geometry.DegreeToRadian(value))));
		geometry.Push(new NumberProperty('Height', () => self.cone.height, self.GeometryChangeHandler((value) => self.cone.height = value)));
		return geometry;
	}

	GetSerializationID(): string {
		return 'CONE';
	}

	SerializePrimitive(serializer: PCLSerializer) {
		let cone = this.cone;
		serializer.PushParameter('apex', (s) => {
			s.PushFloat32(cone.apex.Get(0));
			s.PushFloat32(cone.apex.Get(1));
			s.PushFloat32(cone.apex.Get(2));
		});
		serializer.PushParameter('axis', (s) => {
			s.PushFloat32(cone.axis.Get(0));
			s.PushFloat32(cone.axis.Get(1));
			s.PushFloat32(cone.axis.Get(2));
		});
		serializer.PushParameter('angle', (s) => {
			s.PushFloat32(cone.angle);
		});
		serializer.PushParameter('height', (s) => {
			s.PushFloat32(cone.height);
		});
	}
}