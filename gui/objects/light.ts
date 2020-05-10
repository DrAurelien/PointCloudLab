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

	CompleteProperties(properties: Properties) {
		let self = this;
		properties.Push(new VectorProperty('Position', () => self.position, false, (newPosition) => self.position = newPosition));
		properties.Push(new ColorProperty('Color', () => self.color, (newColor) => self.color = newColor));
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
}