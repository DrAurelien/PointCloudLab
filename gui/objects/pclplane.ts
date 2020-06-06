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
		super(NameProvider.GetName('Plane'), plane);
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

	static SerializationID = 'PLANE';
	GetSerializationID(): string {
		return PCLPlane.SerializationID;
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

	GetParsingHandler(): PCLObjectParsingHandler {
		return new PCLPlaneParsingHandler();
	}
}

class PCLPlaneParsingHandler extends PCLPrimitiveParsingHandler {
	center: Vector;
	normal: Vector;
	radius: number

	constructor() {
		super();
	}

	ProcessPrimitiveParam(paramname: string, parser: PCLParser): boolean {
		switch (paramname) {
			case 'center':
				this.center = new Vector([
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				]);
				return true;
			case 'normal':
				this.normal = new Vector([
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				]);
				return true;
			case 'radius':
				this.radius = parser.reader.GetNextFloat32();
				return true;
		}
		return false;
	}

	FinalizePrimitive(): PCLPrimitive {
		let plane = new Plane(this.center, this.normal, this.radius);
		return new PCLPlane(plane);
	}
}