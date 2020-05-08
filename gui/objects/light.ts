/// <reference path="pclnode.ts" />
/// <reference path="lightscontainer.ts" />


class Light extends PCLNode {
	color: number[];
	glPointsBuffer: WebGLBuffer;

	constructor(public center: Vector, owner: LightsContainer=null) {
		super(NameProvider.GetName("Light"), owner);

		this.color = [1.0, 1.0, 1.0];
	}

	PrepareRendering(drawingContext: DrawingContext) {
		var shapetransform = Matrix.Identity(4);
		drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));

		if (!this.glPointsBuffer) {
			this.glPointsBuffer = drawingContext.gl.createBuffer();
			drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
			drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.center.Flatten()), drawingContext.gl.STATIC_DRAW);
		}
		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
		drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
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
}