class Mesh extends CADPrimitive {
    faces: number[];
    size: number;
    glIndexBuffer: WebGLBuffer;

    constructor(public pointcloud: PointCloud) {
        super(NameProvider.GetName('Mesh'));
		this.faces = [];
		this.size = 0;
    }

    PushFace(f: number[]): void {
		if (f.length != 3) {
			throw 'Non triangular faces are not (yet) supported in meshes';
		}

		if (this.size + f.length > this.faces.length) {
			//Not optimal (Reserve should be called before callin PushFace)
			this.Reserve(this.faces.length + f.length);
		}

		for (let index = 0; index < f.length; index++) {
			this.faces[this.size++] = f[index];
		}
	}

	Reserve(capacity: number): void {
		let faces = new Array(3 * capacity);
		for (let index = 0; index < this.size; index++) {
			faces[index] = this.faces[index];
		}
		this.faces = faces;
	}

	GetFace(i: number) : Face {
		let index = 3 * i;
		let indices = [
			this.faces[index++],
			this.faces[index++],
			this.faces[index++]
		];
		return new Face(indices, [
				this.pointcloud.GetPoint(indices[0]),
				this.pointcloud.GetPoint(indices[1]),
				this.pointcloud.GetPoint(indices[2])
			]
		);
	}

	Size(): number {
		return this.size / 3;
	}

	ComputeNormals(): void {
		let nbFaces = this.Size();
		let nbPoints = this.pointcloud.Size();
		let normals = new Array(nbPoints);
		let self = this;

		function Initialize() {
			let index = 0;
			LongProcess.Run('Initializing normals (step 1 / 3)',
				function () {
					if (index >= nbPoints) {
						return null;
					}
					normals[index++] = new Vector([0, 0, 0]);
					return { current: index, total: nbPoints };
				},
				Compute
			);
		}

		function Compute() {
			let index = 0;
			LongProcess.Run('Computing normals (step 2 / 3)',
				function () {
					if (index >= nbFaces) {
						return null;
					}
					let face = self.GetFace(index++);
					let normal = face.points[1].Minus(face.points[0]).Cross(face.points[2].Minus(face.points[0])).Normalized();
					for (let pointindex = 0; pointindex < face.indices.length; pointindex++) {
						normals[face.indices[pointindex]] = normals[face.indices[pointindex]].Plus(normal);
					}
					return { current: index, total: nbFaces };
				},
				FillPointCloud
			);
		}

		function FillPointCloud() {
			let index = 0;
			self.pointcloud.ClearNormals();
			LongProcess.Run('Assigning normals (step 3 / 3)',
				function () {
					if (index >= nbPoints) {
						return null;
					}
					self.pointcloud.PushNormal(normals[index++].Normalized());
					return { current: index, total: nbPoints };
				}
			);
		}

		Initialize();
	}

	GetBoundingBox(): BoundingBox {
		return this.pointcloud.GetBoundingBox();
	}

	PrepareRendering(drawingContext: DrawingContext): void {
		this.pointcloud.PrepareRendering(drawingContext);
		if (!this.glIndexBuffer) {
			this.glIndexBuffer = drawingContext.gl.createBuffer();
			drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
			drawingContext.gl.bufferData(drawingContext.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), drawingContext.gl.STATIC_DRAW);
		}
		drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
	}

	Draw(drawingContext: DrawingContext): void {
		this.material.InitializeLightingModel(drawingContext);

		this.PrepareRendering(drawingContext);

		//Points-based rendering
		if (drawingContext.rendering.Point()) {
			this.pointcloud.Draw(drawingContext);
		}

		//Surface rendering
		if (drawingContext.rendering.Surface()) {
			drawingContext.gl.drawElements(drawingContext.gl.TRIANGLES, this.size, drawingContext.gl.UNSIGNED_SHORT, 0);
		}

		//Wire rendering
		if (drawingContext.rendering.Wire()) {
			drawingContext.gl.drawElements(drawingContext.gl.LINES, this.size, drawingContext.gl.UNSIGNED_SHORT, 0);
		}

		if (this.selected) {
			this.GetBoundingBox().Draw(drawingContext);
		}
	}

	RayIntersection(ray: Ray) : number[] {
		function LineFaceIntersection(line, face) {
			//Compute line / face intersection
			//solve line.from + t * line.dir
			let normal = face[1].Minus(face[0]).Cross(face[2].Minus(face[0]));
			let dd = normal.Dot(face[0]);
			let nn = line.dir.Dot(normal);
			if (Math.abs(nn) < 1e-6) {
				return null;
			}
			let tt = (dd - line.from.Dot(normal)) / nn;

			let point = line.from.Plus(line.dir.Times(tt));

			//Check the point is inside the triangle
			for (let ii = 0; ii < 3; ii++) {
				let test = point.Minus(face[ii]).Cross(face[(ii + 1) % 3].Minus(face[ii]));
				if (test.Dot(normal) > 0) {
					return null;
				}
			}
			return tt;
		}

		let result = [];
		for (let ii = 0; ii < this.Size(); ii++) {
			let tt = LineFaceIntersection(ray, this.GetFace(ii).points);
			if (tt !== null) {
				result.push(tt);
			}
		}
		return result;
	}
}

class Face {
	constructor(public indices : number[], public points : Vector[]) {
	}
}