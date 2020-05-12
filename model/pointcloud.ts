/// <reference path="kdtree.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="neighbourhood.ts" />
/// <reference path="regiongrowth.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/matrix.ts" />
/// <reference path="../maths/eigendecomposition.ts" />
/// <reference path="../tools/transform.ts" />


class PointCloud {
	points: Float32Array;
	pointssize: number;
	normals: Float32Array;
	normalssize: number;
	tree: KDTree = null;
	boundingbox: BoundingBox;

	constructor() {
		this.points = new Float32Array([]);
		this.pointssize = 0;
		this.normals = new Float32Array([]);
		this.normalssize = 0;
		this.boundingbox = new BoundingBox();
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
		if (this.normalssize + n.Dimension() > this.normals.length) {
			//Not optimal (Reserve should be called before callin PushPoint)
			this.Reserve(this.normals.length + n.Dimension());
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

	KNearestNeighbours = function (queryPoint: Vector, k: number) {
		if (!this.tree) {
			console.log('Computing KD-Tree for point cloud "' + this.name + '"');
			this.tree = new KDTree(this);
		}

		let knn = new KNearestNeighbours(k);
		this.tree.FindNearestNeighbours(queryPoint, knn);
		return knn.Neighbours();
	}

	RayIntersection(ray: Ray): Picking {
		return new Picking(this);
	}

	ComputeNormal(index: number, k: number): Vector {
		//Get the K-nearest neighbours (including the query point)
		let point = this.GetPoint(index);
		let knn = this.KNearestNeighbours(point, k + 1);

		//Compute the coletiance matrix
		let coletiance = Matrix.Null(3, 3);
		let center = new Vector([0, 0, 0]);
		for (let ii = 0; ii < knn.length; ii++) {
			if (knn[ii].index != index) {
				center = center.Plus(this.GetPoint(knn[ii].index));
			}
		}
		center = center.Times(1 / (knn.length - 1));
		for (let kk = 0; kk < knn.length; kk++) {
			if (knn[kk].index != index) {
				let vec = this.GetPoint(knn[kk].index).Minus(center);
				for (let ii = 0; ii < 3; ii++) {
					for (let jj = 0; jj < 3; jj++) {
						coletiance.SetValue(ii, jj,
							coletiance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj))
						);
					}
				}
			}
		}

		//The normal is the eigenvector having the smallest eigenvalue in the coletiance matrix
		for (let ii = 0; ii < 3; ii++) {
			//Check no column is null in the coletiance matrix
			if (coletiance.GetColumnVector(ii).SqrNorm() <= 1.0e-12) {
				let result = new Vector([0, 0, 0]);
				result.Set(ii, 1);
				return result;
			}
		}
		let eigen = new EigenDecomposition(coletiance);
		if (eigen) {
			return eigen[0].eigenVector.Normalized();
		}

		return null;
	}

	ApplyTransform(transform: Transform) {
		this.boundingbox = new BoundingBox();
		for (let index = 0; index < this.Size(); index++) {
			let p = this.GetPoint(index);
			p = transform.TransformPoint(p);
			PointCloud.SetValues(index, p, this.points);
			this.boundingbox.Add(p);
			if (this.HasNormals()) {
				let n = this.GetPoint(index);
				n = transform.TransformVector(n);
				PointCloud.SetValues(index, n, this.normals);
			}
		}
	}
}
