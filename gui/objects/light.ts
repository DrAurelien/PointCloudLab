/// <reference path="pclnode.ts" />
/// <reference path="lightscontainer.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/colorproperty.ts" />
/// <reference path="../../controler/controler.ts" />
/// <reference path="../../files/pclserializer.ts" />


class Light extends PCLNode implements LightingPosition {
	color: number[];
	glPointsBuffer: FloatArrayBuffer;

	constructor(public position: Vector) {
		super(NameProvider.GetName("Light"));
		this.color = [1.0, 1.0, 1.0];
	}

	PrepareRendering(drawingContext: DrawingContext) {
		var shapetransform = Matrix.Identity(4);
		drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));

		if (!this.glPointsBuffer) {
			this.glPointsBuffer = new FloatArrayBuffer(new Float32Array(this.position.Flatten()), drawingContext, 3);
		}
		this.glPointsBuffer.BindAttribute(drawingContext.vertices);
	}

	DrawNode(drawingContext: DrawingContext): void {
		this.PrepareRendering(drawingContext);
		drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, 1);
	}

	RayIntersection(ray: Ray): Picking {
		return new Picking(null);
	}

	GetBoundingBox(): BoundingBox {
		return null;
	}

	FillProperties() {
		if (this.properties) {
			let self = this;
			this.properties.Push(new VectorProperty('Position', () => self.position, false, () => { }));
			this.properties.Push(new ColorProperty('Color', () => self.color, (newColor) => self.color = newColor));
		}
	}

	GetDisplayIcon(): string {
		return 'fa-lightbulb-o';
	}

	GetPosition(): Vector {
		return this.position;
	}

	SetPositon(p: Vector) {
		this.position = p;
	}

	static SerializationID = 'LIGHT';
	GetSerializationID(): string {
		return Light.SerializationID;
	}

	SerializeNode(serializer: PCLSerializer) {
		let self = this;
		serializer.PushParameter('position', (s) => {
			s.PushFloat32(self.position.Get(0));
			s.PushFloat32(self.position.Get(1));
			s.PushFloat32(self.position.Get(2));
		});
		serializer.PushParameter('color', (s) => {
			s.PushFloat32(self.color[0]);
			s.PushFloat32(self.color[1]);
			s.PushFloat32(self.color[2]);
		});
	}

	GetParsingHandler(): PCLObjectParsingHandler {
		return new LightParsingHandler();
	}
}

class LightParsingHandler extends PCLNodeParsingHandler {
	position: Vector;
	color: number[];

	constructor() {
		super();
	}

	ProcessNodeParam(paramname: string, parser: PCLParser): boolean {
		switch (paramname) {
			case 'position':
				this.position = new Vector([
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				]);
				return true;
			case 'color':
				this.color = [
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				];
				return true;
		}
		return false;
	}

	FinalizeNode(): PCLNode {
		let light = new Light(this.position);
		light.color = this.color;
		return light;
	}
}