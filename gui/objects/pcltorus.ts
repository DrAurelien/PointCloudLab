/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/torus.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />


class PCLTorus extends PCLShape {
	constructor(public torus: Torus) {
		super(NameProvider.GetName('Torus'), torus);
	}

	GetShape(): Shape {
		return this.torus;
	}

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', () => self.torus.center, false, this.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Axis', () => self.torus.axis, true, this.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Great Radius', () => self.torus.greatRadius, this.GeometryChangeHandler((value) => self.torus.greatRadius = value)));
		geometry.Push(new NumberProperty('Small Radius', () => self.torus.smallRadius, this.GeometryChangeHandler((value) => self.torus.smallRadius = value)));
		return geometry;
	}

	static SerializationID = 'TORUS';
	GetSerializationID(): string {
		return PCLTorus.SerializationID;
	}

	SerializePrimitive(serializer: PCLSerializer) {
		let torus = this.torus;
		serializer.PushParameter('center', (s) => {
			s.PushFloat32(torus.center.Get(0));
			s.PushFloat32(torus.center.Get(1));
			s.PushFloat32(torus.center.Get(2));
		});
		serializer.PushParameter('axis', (s) => {
			s.PushFloat32(torus.axis.Get(0));
			s.PushFloat32(torus.axis.Get(1));
			s.PushFloat32(torus.axis.Get(2));
		});
		serializer.PushParameter('smallradius', (s) => {
			s.PushFloat32(torus.smallRadius);
		});
		serializer.PushParameter('greatradius', (s) => {
			s.PushFloat32(torus.greatRadius);
		});
	}

	GetParsingHandler(): PCLObjectParsingHandler {
		return new PCLTorusParsingHandler();
	}
}

class PCLTorusParsingHandler extends PCLPrimitiveParsingHandler {
	center: Vector;
	axis: Vector;
	smallradius: number;
	greatradius: number

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
			case 'axis':
				this.axis = new Vector([
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				]);
				return true;
			case 'greatradius':
				this.greatradius = parser.reader.GetNextFloat32();
				return true;
			case 'smallradius':
				this.smallradius = parser.reader.GetNextFloat32();
				return true;
		}
		return false;
	}

	FinalizePrimitive(): PCLPrimitive {
		let torus = new Torus(this.center, this.axis, this.greatradius, this.smallradius);
		return new PCLTorus(torus);
	}
}