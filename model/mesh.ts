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
			self.octree = new Octree(this);
		}
	}

	ClearNormals() {
		this.pointcloud.ClearNormals();
	}

	ComputeNormals(onDone: CADNodeHandler = null): void {
		if (!this.pointcloud.HasNormals()) {
			let ncomputer = new MeshProcessing.NormalsComputer(this);
			ncomputer.SetNext(() => onDone(this));
			ncomputer.Start();
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


namespace MeshProcessing {
	export class NormalsComputer extends IterativeLongProcess {
		normals: Array<Vector>;
		constructor(private mesh: Mesh) {
			super(mesh.Size(), 'Computing normals');
		}

		Initialize() {
			this.normals = new Array<Vector>(this.mesh.pointcloud.Size());
			for (let index = 0; index < this.normals.length; index++) {
				this.normals[index] = new Vector([0, 0, 0]);
			}
		}

		Iterate(step: number) {
			let face = this.mesh.GetFace(step);
			for (let index = 0; index < face.indices.length; index++) {
				let nindex = face.indices[index];
				this.normals[nindex] = this.normals[nindex].Plus(face.Normal);
			}
		}

		Finalize() {
			let cloud = this.mesh.pointcloud;
			cloud.ClearNormals();
			let nbPoints = cloud.Size();
			for (let index = 0; index < nbPoints; index++) {
				cloud.PushNormal(this.normals[index].Normalized());
			}
		}
	};
}