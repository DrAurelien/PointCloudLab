/// <reference path="octree.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="meshface.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../tools/longprocess.ts" />


class Mesh {
	faces: number[];
	size: number;
	octree: Octree;

	constructor(public pointcloud: PointCloud) {
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
		if (onDone)
			onDone(this);
	}

	ClearNormals() {
		this.pointcloud.ClearNormals();
	}

	ComputeNormals(onDone: Function = null): void {
		if (!this.pointcloud.HasNormals()) {
			let ncomputer = new MeshNormalsComputer(this);
			ncomputer.SetNext(() => { if (onDone) onDone(this) });
			ncomputer.Start();
		}
	}

	GetBoundingBox(): BoundingBox {
		return this.pointcloud.boundingbox;
	}

	RayIntersection(ray: Ray, wrapper: Pickable): Picking {
		if (this.octree) {
			return this.octree.RayIntersection(ray, wrapper);
		}

		//We should never get here !!! but just in case ...
		let result = new Picking(wrapper);
		for (let ii = 0; ii < this.Size(); ii++) {
			let tt = this.GetFace(ii).LineFaceIntersection(ray);
			if (tt !== null) {
				result.Add(tt);
			}
		}
		return result;
	}
}

class MeshNormalsComputer extends IterativeLongProcess {
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
}