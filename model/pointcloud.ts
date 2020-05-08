﻿/// <reference path="kdtree.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="neighbourhood.ts" />
/// <reference path="regiongrowth.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/matrix.ts" />
/// <reference path="../maths/eigendecomposition.ts" />


class PointCloud {
	points: number[];
	pointssize: number;
	normals: number[];
	normalssize: number;
	tree: KDTree = null;
	boundingbox: BoundingBox;

	constructor() {
		this.points = [];
		this.pointssize = 0;
		this.normals = [];
		this.normalssize = 0;
		this.boundingbox = new BoundingBox();
	}

	PushPoint(p: Vector): void {
		if (this.pointssize + p.Dimension() > this.points.length) {
			//Not optimal (Reserve should be called before callin PushPoint)
			this.Reserve(this.points.length + p.Dimension());
		}

		for (var index = 0; index < p.Dimension(); index++) {
			this.points[this.pointssize++] = p.Get(index);
		}
		this.boundingbox.Add(p);
		this.tree = null;
	}

	Reserve(capacity: number) {
		var points = new Array(3 * capacity);
		for (var index = 0; index < this.pointssize; index++) {
			points[index] = this.points[index];
		}
		this.points = points;

		var normals = new Array(3 * capacity);
		for (var index = 0; index < this.normalssize; index++) {
			normals[index] = this.normals[index];
		}
		this.normals = normals;
	}

	GetPoint(i: number): Vector {
		var index = 3 * i;
		return new Vector([
			this.points[index],
			this.points[index + 1],
			this.points[index + 2]]);
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

		for (var index = 0; index < n.Dimension(); index++) {
			this.normals[this.normalssize++] = n.Get(index);
		}
	}

	GetNormal(i: number): Vector {
		var index = 3 * i;
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

		var knn = new KNearestNeighbours(k);
		this.tree.FindNearestNeighbours(queryPoint, knn);
		return knn.Neighbours();
	}

	RayIntersection(ray: Ray): Picking {
		return new Picking(this);
	}

	ComputeNormal(index: number, k: number): Vector {
		//Get the K-nearest neighbours (including the query point)
		var point = this.GetPoint(index);
		let knn = this.KNearestNeighbours(point, k + 1);

		//Compute the covariance matrix
		var covariance = Matrix.Null(3, 3);
		var center = new Vector([0, 0, 0]);
		for (var ii = 0; ii < knn.length; ii++) {
			if (knn[ii].index != index) {
				center = center.Plus(this.GetPoint(knn[ii].index));
			}
		}
		center = center.Times(1 / (knn.length - 1));
		for (var kk = 0; kk < knn.length; kk++) {
			if (knn[kk].index != index) {
				var vec = this.GetPoint(knn[kk].index).Minus(center);
				for (var ii = 0; ii < 3; ii++) {
					for (var jj = 0; jj < 3; jj++) {
						covariance.SetValue(ii, jj,
							covariance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj))
						);
					}
				}
			}
		}

		//The normal is the eigenvector having the smallest eigenvalue in the covariance matrix
		for (var ii = 0; ii < 3; ii++) {
			//Check no column is null in the covariance matrix
			if (covariance.GetColumnVector(ii).SqrNorm() <= 1.0e-12) {
				var result = new Vector([0, 0, 0]);
				result.Set(ii, 1);
				return result;
			}
		}
		var eigen = new EigenDecomposition(covariance);
		if (eigen) {
			return eigen[0].eigenVector.Normalized();
		}

		return null;
	}
}
