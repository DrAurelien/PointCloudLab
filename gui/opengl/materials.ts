/// <reference path="drawingcontext.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/colorproperty.ts" />
/// <reference path="../controls/properties/numberinrangeproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />


class Material implements PCLSerializable {
	constructor(public baseColor: number[], public diffuse: number = 0.7, public ambiant: number = 0.05, public specular: number = 0.4, public glossy: number = 10.0) {
	}

	InitializeLightingModel(drawingContext: DrawingContext): void {
		drawingContext.gl.uniform3fv(drawingContext.color, new Float32Array(this.baseColor));
		drawingContext.gl.uniform1f(drawingContext.diffuse, this.diffuse);
		drawingContext.gl.uniform1f(drawingContext.ambiant, this.ambiant);
		drawingContext.gl.uniform1f(drawingContext.specular, this.specular);
		drawingContext.gl.uniform1f(drawingContext.glossy, this.glossy);
	}

	GetProperties(): Properties {
		let self = this;

		let properties = new Properties;
		properties.Push(new ColorProperty('Color', () => self.baseColor, (value) => self.baseColor = value));
		properties.Push(new NumberInRangeProperty('Ambiant', () => self.ambiant * 100.0, 0, 100, 1, (value) => self.ambiant = value / 100.0));
		properties.Push(new NumberInRangeProperty('Diffuse', () => self.diffuse * 100.0, 0, 100, 1, (value) => self.diffuse = value / 100.0));
		properties.Push(new NumberInRangeProperty('Specular', () => self.specular * 100.0, 0, 100, 1, (value) => self.specular = value / 100.0));
		properties.Push(new NumberInRangeProperty('Glossy', () => self.glossy, 0, 100, 1, (value) => self.glossy = value));

		return properties;
	}

	static SerializationID = 'MATERIAL';
	GetSerializationID() {
		return Material.SerializationID;
	}

	Serialize(serializer: PCLSerializer) {
		//public baseColor: number[], public diffuse: number = 0.7, public ambiant: number = 0.05, public specular: number = 0.4, public glossy: number = 10.0
		let self = this;
		serializer.Start(this);
		serializer.PushParameter('color', (s) => {
			s.PushFloat32(self.baseColor[0]);
			s.PushFloat32(self.baseColor[1]);
			s.PushFloat32(self.baseColor[2]);
		});
		serializer.PushParameter('ambiant', (s) => s.PushFloat32(self.ambiant));
		serializer.PushParameter('diffuse', (s) => s.PushFloat32(self.diffuse));
		serializer.PushParameter('specular', (s) => s.PushFloat32(self.specular));
		serializer.PushParameter('glossy', (s) => s.PushFloat32(self.glossy));
		serializer.End(this);
	}

	GetParsingHandler(): PCLObjectParsingHandler {
		return new MaterialParsingHandler();
	}
}

class MaterialParsingHandler implements PCLObjectParsingHandler {
	color: number[];
	ambiant: number;
	diffuse: number;
	specular: number;
	glossy: number;

	constructor() {
	}

	ProcessParam(paramname: string, parser: PCLParser): boolean {
		switch (paramname) {
			case 'color':
				this.color = [
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				];
				return true;
			case 'ambiant':
				this.ambiant = parser.reader.GetNextFloat32();
				return true;
			case 'diffuse':
				this.diffuse = parser.reader.GetNextFloat32();
				return true;
			case 'specular':
				this.specular = parser.reader.GetNextFloat32();
				return true;
			case 'glossy':
				this.glossy = parser.reader.GetNextFloat32();
				return true;
		}
		return false;
	}

	Finalize(): PCLSerializable {
		return new Material(this.color, this.diffuse, this.ambiant, this.specular, this.glossy);
	}
}