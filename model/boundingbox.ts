/// <reference path="../maths/vector.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../gui/opengl/drawingcontext.ts" />


class BoundingBox {
	static pointsBuffer: WebGLBuffer = null;
	static indexBuffer: WebGLBuffer = null;
	static drawnElements: GLBufferElement[];

	constructor(public min: Vector = null, public max: Vector = null) {
	}

	private static InititalizeGL(glContext: WebGLRenderingContext): void {
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

	AddBoundingBox(bb: BoundingBox): void {
		if (bb && bb.IsValid()) {
			this.Add(bb.min);
			this.Add(bb.max);
		}
	}

	IsValid(): boolean {
		return (this.min != null && this.max != null);
	}

	Intersect(box: BoundingBox): boolean {
		let dim = this.min.Dimension();
		for (let index = 0; index < dim; index++) {
			if ((box.max.Get(index) < this.min.Get(index)) || (box.min.Get(index) > this.max.Get(index))) {
				return false;
			}
		}
		return true;
	}

	TestAxisSeparation(point: Vector, axis: Vector): boolean {
		let dim = this.min.Dimension();
		let v = 0.0;
		for (let index = 0; index < dim; index++) {
			v += Math.abs(axis.Get(index) * (this.max.Get(index) - this.min.Get(index)))
		}
		let proj = this.GetCenter().Minus(point).Dot(axis);
		let minproj = proj - v;
		let maxproj = proj + v;
		return (minproj * maxproj) > 0;
	}

	RayIntersection(ray: Ray): Picking {
		let result = new Picking(null);
		let dim = this.min.Dimension();
		let self = this;

		function Accept(dist: number, ignore: number) {
			let inside = true;
			let p = ray.GetPoint(dist);
			for (let index = 0; inside && index < dim; index++) {
				if (index != ignore) {
					inside = (p.Get(index) >= self.min.Get(index)) && (p.Get(index) <= self.max.Get(index));
				}
			}
			if (inside) {
				result.Add(dist);
			}
		}

		for (let index = 0; index < dim; index++) {
			let dd = ray.dir.Get(index);
			if (Math.abs(dd) > 1.0e-12) {
				Accept((this.min.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
				Accept((this.max.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
			}
		}
		return result;
	}

	Draw(drawingContext: DrawingContext): void {
		if (this.IsValid()) {
			drawingContext.EnableNormals(false);
			BoundingBox.InititalizeGL(drawingContext.gl);

			drawingContext.gl.uniform3fv(drawingContext.color, new Float32Array([1.0, 1.0, 0.0]));

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
}

class GLBufferElement {
	constructor(public from: number, public count: number, public type: number) { }
}