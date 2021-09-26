/// <reference path="octree.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="meshface.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../tools/longprocess.ts" />


class Mesh {
	faces: number[];
	flags: number[];
	size: number;
	octree: Octree;

	constructor(public pointcloud: PointCloud, faces?: number[]) {
		this.faces = faces || [];
		this.size = this.faces.length;
		this.flags = new Array(this.Size());
		for (let index = 0; index < this.Size(); index++)
			this.flags[index] = 0;
	}

	PushFace(pointindices: number[], flag:number = 0): void {
		if (pointindices.length != 3) {
			throw 'Non triangular faces are not (yet) supported in meshes';
		}

		if (this.size + pointindices.length > this.faces.length) {
			//Not optimal (Reserve should be called before callin PushFace)
			this.Reserve(this.faces.length + pointindices.length);
		}

		this.flags[this.Size()] = flag;
		for (let index = 0; index < pointindices.length; index++) {
			this.faces[this.size++] = pointindices[index];
		}
	}

	Reserve(capacity: number): void {
		let faces = new Array(3 * capacity);
		let flags = new Array(capacity);
		for (let index = 0; index < this.size && index < capacity; index++)
			faces[index] = this.faces[index];
		for (let index = 0; index < this.Size() && index < capacity; index++)
			flags[index] = this.flags[index]
		this.faces = faces;
		this.flags = flags;
	}

	GetFace(index: number): MeshFace {
		return new MeshFace(this, index);
	}

	Size(): number {
		return this.size / 3;
	}

	ComputeOctree(onDone: Function = null) {
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
			let face = this.GetFace(ii);
			let tt = face.LineFaceIntersection(ray);
			if (tt !== null) {
				result.Add(tt, face);
			}
		}
		return result;
	}

	Distance(p: Vector): number {
		if (this.octree) {
			return this.octree.Distance(p);
		}

		//We should never get here !!! but just in case ...
		let dist = null;
		for (let ii = 0; ii < this.Size(); ii++) {
			let dd = this.GetFace(ii).Distance(p);
			if (dist == null || dd < dist) {
				dist = dd;
			}
		}
		return dist;
	}

	ApplyTransform(transform: Transform) {
		this.pointcloud.ApplyTransform(transform);
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
		for (let index = 0; index < 3; index++) {
			let nindex = face.GetPointIndex(index);
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