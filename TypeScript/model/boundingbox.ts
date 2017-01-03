class BoundingBox {
	static pointsBuffer: WebGLBuffer = null;
	static indexBuffer: WebGLBuffer = null;
	static drawnElements: GLBufferElement[];

    constructor(public min?: Vector, public max?: Vector) {
    }

	private static InititalizeGL(glContext: WebGLRenderingContext) :void {
		if (this.pointsBuffer === null) {
			let points = [
				-0.5, -0.5, -0.5,
				-0.5, 0.5, -0.5,
				0.5, 0.5, -0.5,
				0.5, -0.5, -0.5,
				-0.5, -0.5, 0.5,
				-0.5, 0.5, 0.5,
				0.5, 0.5, 0.5,
				0.5, -0.5, 0.5];

			let indices = [
				0, 1, 2, 3,
				4, 5, 6, 7,
				0, 4,
				1, 5,
				2, 6,
				3, 7
			];

			this.drawnElements = [
				new GLBufferElement(0, 4, glContext.LINE_LOOP),
				new GLBufferElement(4, 4, glContext.LINE_LOOP),
				new GLBufferElement(8, 2, glContext.LINES),
				new GLBufferElement(10, 2, glContext.LINES),
				new GLBufferElement(12, 2, glContext.LINES),
				new GLBufferElement(14, 2, glContext.LINES)
			];

			//Create webgl buffers
			this.pointsBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ARRAY_BUFFER, this.pointsBuffer);
			glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(points), glContext.STATIC_DRAW);
			//indices buffer
			this.indexBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), glContext.STATIC_DRAW);

		}
	}

    Set(center: Vector, size: Vector) {
        let halfSize = size.Times(0.5);
        this.min = center.Minus(halfSize);
        this.max = center.Plus(halfSize);
    }


    GetCenter(): Vector {
        return this.min.Plus(this.max).Times(0.5);
    }

	GetSize(): Vector {
		return this.max.Minus(this.min);
	}

	Add(p: Vector): void {
		if (this.min == null || this.max == null) {
			this.min = new Vector(p.Flatten());
			this.max = new Vector(p.Flatten());
		}
		else {
			for (var index = 0; index < p.Dimension(); index++) {
				this.min.Set(index, Math.min(this.min.Get(index), p.Get(index)));
				this.max.Set(index, Math.max(this.max.Get(index), p.Get(index)));
			}
		}
	}

	Draw(drawingContext: DrawingContext): void {
		drawingContext.EnableNormals(false);
		BoundingBox.InititalizeGL(drawingContext.gl);

		var material = new Material([1.0, 1.0, 0.0]);
		material.InitializeLightingModel(drawingContext);

		let size = this.GetSize();
		let center = this.GetCenter();
		let shapetransform = Matrix.Identity(4);
		for (let index = 0; index < 3; index++) {
			shapetransform.SetValue(index, index, size.Get(index));
			shapetransform.SetValue(index, 3, center.Get(index));
		}

		drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));

		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, BoundingBox.pointsBuffer);
		drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
		drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, BoundingBox.indexBuffer);
		let sizeOfUnisgnedShort = 2;
		for (var index = 0; index < BoundingBox.drawnElements.length; index++) {
			let element = BoundingBox.drawnElements[index];
			drawingContext.gl.drawElements(element.type, element.count, drawingContext.gl.UNSIGNED_SHORT, sizeOfUnisgnedShort * element.from);
		}
	}
}

class GLBufferElement {
	constructor(public from: number, public count: number, public type: number) { }
}