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
		super(NameProvider.GetName('Cone'), cone);
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

	static SerializationID = 'CONE';
	GetSerializationID(): string {
		return PCLCone.SerializationID;
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

	GetParsingHandler(): PCLObjectParsingHandler {
		return new PCLConeParsingHandler();
	}
}

class PCLConeParsingHandler extends PCLPrimitiveParsingHandler {
	apex: Vector;
	axis: Vector;
	height: number;
	angle: number

	constructor() {
		super();
	}

	ProcessPrimitiveParam(paramname: string, parser: PCLParser): boolean {
		switch (paramname) {
			case 'apex':
				this.apex = new Vector([
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				]);
				return true;
			case 'axis':
				this.axis = new Vector([
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				]);
				return true;
			case 'angle':
				this.angle = parser.reader.GetNextFloat32();
				return true;
			case 'height':
				this.height = parser.reader.GetNextFloat32();
				return true;
		}
		return false;
	}

	FinalizePrimitive(): PCLPrimitive {
		let cone = new Cone(this.apex, this.axis, this.angle, this.height);
		return new PCLCone(cone);
	}
}