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


class Light extends PCLNode {
	color: number[];
	glPointsBuffer: FloatBuffer;

	constructor(public center: Vector, owner: LightsContainer = null) {
		super(NameProvider.GetName("Light"), owner);

		this.color = [1.0, 1.0, 1.0];
	}

	PrepareRendering(drawingContext: DrawingContext) {
		var shapetransform = Matrix.Identity(4);
		drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));

		if (!this.glPointsBuffer) {
			this.glPointsBuffer = new FloatBuffer(this.center.Flatten(), drawingContext, 3);
		}
		this.glPointsBuffer.Bind(drawingContext.vertices);
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

	GetProperties(): Properties {
		let self = this;
		let properties = super.GetProperties();
		properties.Push(new VectorProperty('Position', this.center, false, (newPosition) => self.center = newPosition));
		properties.Push(new ColorProperty('Color', this.color, (newColor) => self.color = newColor));
		return properties;
	}

	GetDisplayIcon(): string {
		return 'fa-lightbulb-o';
	}
}