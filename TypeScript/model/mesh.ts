//import './meshface.ts';

class Mesh extends CADPrimitive {
    faces: number[];
    size: number;
	octree: Octree;
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

	GetFace(i: number): MeshFace {
		let index = 3 * i;
		let indices = [
			this.faces[index++],
			this.faces[index++],
			this.faces[index++]
		];
		return new MeshFace(indices, [
			this.pointcloud.GetPoint(indices[0]),
			this.pointcloud.GetPoint(indices[1]),
			this.pointcloud.GetPoint(indices[2])
		]
		);
	}

	Size(): number {
		return this.size / 3;
	}

	ComputeOctree(onDone: Function) {
		if (!this.octree) {
			let self = this;
			LongProcess.Run('Computing space partitionning of the mesh', () => {self.octree = new Octree(this);}, onDone);
		}
	}

	ClearNormals() {
		this.pointcloud.ClearNormals();
	}

	ComputeNormals(onDone: CADNodeHandler=null): void {
		let nbFaces = this.Size();
		let nbPoints = this.pointcloud.Size();
		let normals = new Array(nbPoints);
		let self = this;

		function Initialize() {
			let index = 0;
			LongProcess.Run(onDone ? 'Initializing normals (step 1 / 3)' : null,
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
			LongProcess.Run(onDone ? 'Computing normals (step 2 / 3)' : null,
				function () {
					if (index >= nbFaces) {
						return null;
					}
					let face = self.GetFace(index++);
					for (let pointindex = 0; pointindex < face.indices.length; pointindex++) {
						normals[face.indices[pointindex]] = normals[face.indices[pointindex]].Plus(face.Normal);
					}
					return { current: index, total: nbFaces };
				},
				FillPointCloud
			);
		}

		function FillPointCloud() {
			let index = 0;
			self.pointcloud.ClearNormals();
			LongProcess.Run(onDone ? 'Assigning normals (step 3 / 3)' : null,
				function () {
					if (index >= nbPoints) {
						return null;
					}
					self.pointcloud.PushNormal(normals[index++].Normalized());
					return { current: index, total: nbPoints };
				},
				function () {
					if (onDone) {
						onDone(self);
					}
				}
			);
		}

		if (!this.pointcloud.HasNormals()) {
			Initialize();
		}
	}

	GetBoundingBox(): BoundingBox {
		return this.pointcloud.GetBoundingBox();
	}

	PrepareRendering(drawingContext: DrawingContext): void {
		this.pointcloud.PrepareRendering(drawingContext);
		if (!this.glIndexBuffer) {
			this.glIndexBuffer = drawingContext.gl.createBuffer();
			drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
			drawingContext.gl.bufferData(drawingContext.gl.ELEMENT_ARRAY_BUFFER, drawingContext.GetIntArray(this.faces), drawingContext.gl.STATIC_DRAW);
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
			drawingContext.gl.drawElements(drawingContext.gl.TRIANGLES, this.size, drawingContext.GetIntType(), 0);
		}

		//Wire rendering
		if (drawingContext.rendering.Wire()) {
			drawingContext.gl.drawElements(drawingContext.gl.LINES, this.size, drawingContext.GetIntType(), 0);
		}

		if (this.selected) {
			this.GetBoundingBox().Draw(drawingContext);
		}
	}

    RayIntersection(ray: Ray): Picking {
		if (this.octree) {
			return this.octree.RayIntersection(ray);
		}

        let result = new Picking(this);
		for (let ii = 0; ii < this.Size(); ii++) {
            let tt = this.GetFace(ii).LineFaceIntersection(ray);
			if (tt !== null) {
				result.Add(tt);
			}
		}
		return result;
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();

		let points = new NumberProperty('Points', this.pointcloud.Size(), null);
		points.SetReadonly();
		let faces = new NumberProperty('Faces', this.Size(), null);
		faces.SetReadonly();

		properties.Push(points);
		properties.Push(faces);

		return properties;
	}
}