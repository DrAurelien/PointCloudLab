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
		super(NameProvider.GetName('Sphere'), sphere);
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

	static SerializationID = 'SPHERE';
	GetSerializationID(): string {
		return PCLSphere.SerializationID;
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

	GetParsingHandler(): PCLObjectParsingHandler {
		return new PCLSphereParsingHandler();
	}
}

class PCLSphereParsingHandler extends PCLPrimitiveParsingHandler {
	center: Vector;
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
			case 'radius':
				this.radius = parser.reader.GetNextFloat32();
				return true;
		}
		return false;
	}

	FinalizePrimitive(): PCLPrimitive {
		let sphere = new Sphere(this.center,this.radius);
		return new PCLSphere(sphere);
	}
}