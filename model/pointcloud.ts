/// <reference path="kdtree.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="neighbourhood.ts" />
/// <reference path="regiongrowth.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/geometry.ts" />
/// <reference path="../tools/transform.ts" />


class PointCloud extends PointSet {
	points: Float32Array;
	pointssize: number;
	normals: Float32Array;
	normalssize: number;
	tree: KDTree = null;
	boundingbox: BoundingBox;

	constructor(points?: Float32Array, normals?: Float32Array) {
		super();

		this.points = points || new Float32Array([]);
		this.pointssize = this.points.length;
		this.normals = normals || new Float32Array([]);
		this.normalssize = this.normals.length;
		this.boundingbox = new BoundingBox();
		for (let index = 0; index < this.Size(); index++) {
			this.boundingbox.Add(this.GetPoint(index));
		}
	}

	PushPoint(p: Vector): void {
		if (this.pointssize + p.Dimension() > this.points.length) {
			//Not optimal (Reserve should be called before callin PushPoint)
			this.Reserve(this.points.length + p.Dimension());
		}

		for (let index = 0; index < p.Dimension(); index++) {
			this.points[this.pointssize++] = p.Get(index);
		}
		this.boundingbox.Add(p);
		this.tree = null;
	}

	Reserve(capacity: number) {
		let points = new Float32Array(3 * capacity);
		for (let index = 0; index < this.pointssize; index++) {
			points[index] = this.points[index];
		}
		this.points = points;

		let normals = new Float32Array(3 * capacity);
		for (let index = 0; index < this.normalssize; index++) {
			normals[index] = this.normals[index];
		}
		this.normals = normals;
	}

	GetPoint(i: number): Vector {
		let index = 3 * i;
		return new Vector([
			this.points[index],
			this.points[index + 1],
			this.points[index + 2]]);
	}

	GetData(i: number): Vector {
		return this.GetPoint(i);
	}

	private static SetValues(i: number, p: Vector, target: Float32Array) {
		let index = 3 * i;
		for (let ii = 0; ii < 3; ii++) {
			target[index + ii] = p.Get(ii);
		}
	}

	GetPointCoordinate(i: number, j: number): number {
		return this.points[3 * i + j]
	}

	Size(): number {
		return this.pointssize / 3;
	}

	PushNormal(n: Vector): void {
		if (this.normals.length < this.points.length) {
			let normals = new Float32Array(this.points.length);
			for (let index = 0; index < this.normalssize; index++) {
				normals[index] = this.normals[index];
			}
			this.normals = normals;
		}

		for (let index = 0; index < n.Dimension(); index++) {
			this.normals[this.normalssize++] = n.Get(index);
		}
	}

	GetNormal(i: number): Vector {
		let index = 3 * i;
		return new Vector([
			this.normals[index],
			this.normals[index + 1],
			this.normals[index + 2]]);
	}

	InvertNormal(i: number): void {
		for (let index = 0; index < 3; index++) {
			this.normals[3 * i + index] = -this.normals[3 * i + index];
		}
	}

	HasNormals(): boolean {
		return (this.normalssize == this.pointssize);
	}

	ClearNormals(): void {
		this.normalssize = 0;
	}

	Distance(p: Vector): number {
		let nearest = this.KNearestNeighbours(p, 1).Neighbours();
		return Math.sqrt(nearest[0].sqrdistance);
	}

	KNearestNeighbours(queryPoint: Vector, k: number): KNearestNeighbours {
		if (!this.tree) {
			this.tree = new KDTree(this);
		}

		let knn = new KNearestNeighbours(k);
		this.tree.FindNearestNeighbours(queryPoint, knn);
		return knn;
	}

	RayIntersection(ray: Ray): Picking {
		return new Picking(this);
	}

	ComputeNormal(index: number, k: number): Vector {
		//Get the K-nearest neighbours (including the query point)
		let point = this.GetPoint(index);
		let knn = this.KNearestNeighbours(point, k + 1);

		return Geometry.PlaneFitting(knn).normal;
	}

	ApplyTransform(transform: Transform) {
		this.boundingbox = new BoundingBox();
		for (let index = 0; index < this.Size(); index++) {
			let p = this.GetPoint(index);
			p = transform.TransformPoint(p);
			PointCloud.SetValues(index, p, this.points);
			this.boundingbox.Add(p);
			if (this.HasNormals()) {
				let n = this.GetNormal(index);
				n = transform.TransformVector(n).Normalized();
				PointCloud.SetValues(index, n, this.normals);
			}
		}
		if (this.tree) {
			delete this.tree;
		}
	}
}

class GaussianSphere extends PointSet {
	normals: Vector[];
	constructor(private cloud: PointCloud) {
		super();
		this.normals = null;
		if (!cloud.HasNormals()) {
			let size = cloud.Size();
			this.normals = new Array<Vector>(size);
			for (let index = 0; index < size; index++) {
				this.normals[index] = cloud.ComputeNormal(index, 30);
			}
		}
	}

	Size(): number {
		return this.cloud.Size();
	}

	GetPoint(index: number): Vector {
		if (this.normals) {
			return this.normals[index];
		}
		else {
			return this.cloud.GetNormal(index);
		}
	}

	ToPointCloud(): PointCloud {
		let gsphere = new PointCloud();
		let size = this.Size();
		gsphere.Reserve(size);
		for (let index = 0; index < size; index++) {
			gsphere.PushPoint(this.GetPoint(index));
		}
		return gsphere;
	}
}


class PointSubCloud extends PointSet{
	constructor(public cloud: PointCloud, public indices: number[]) {
		super();
	}

	Size(): number {
		return this.indices.length;
	}

	GetPoint(index: number): Vector {
		return this.cloud.GetPoint(this.indices[index]);
	}
}