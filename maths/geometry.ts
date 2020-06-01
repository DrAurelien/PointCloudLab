/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
/// <reference path="eigendecomposition.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../tools/dataprovider.ts" />


class PlaneFittingResult {
	constructor(public center: Vector, public normal: Vector) { }

	ComputePatchRadius(data: DataProvider<Vector>): number {
		let maxradius = 0;
		let size = data.Size();
		for (let index = 0; index < size; index++) {
			let radius = data.GetData(index).Minus(this.center).Cross(this.normal).Norm();
			if (radius > maxradius) {
				maxradius = radius;
			}
		}
		return maxradius;
	}
}

class Geometry {
	static LinesIntersection(a: Ray, b: Ray): Vector {
		var d = a.dir.Dot(b.dir);
		var sqrLenA = a.dir.SqrNorm();
		var sqrLenB = b.dir.SqrNorm();

		var s = ((sqrLenA * sqrLenB) - (d * d));
		if (s <= 1.0e-12) {
			//Aligned axes
			return a.from.Plus(b.from).Times(0.5);
		}

		var delta = a.from.Minus(b.from);
		var t1 = delta.Dot(b.dir.Times(d).Minus(a.dir.Times(sqrLenB))) / s;
		var t2 = delta.Dot(b.dir.Times(sqrLenA).Minus(a.dir.Times(d))) / s;

		var r1 = a.from.Plus(a.dir.Times(t1));
		var r2 = b.from.Plus(b.dir.Times(t2));

		return r1.Plus(r2).Times(0.5);
	}

	static DegreeToRadian(a: number): number {
		return Math.PI * a / 180.0;
	}

	static RadianToDegree(a: number): number {
		return a / Math.PI * 180;
	}

	static DistanceToSegment(point: Vector, a: Vector, b: Vector) {
		let ab = b.Minus(a);
		let ap = point.Minus(a)
		if (ap.Dot(ab) <= 0)
			return ap.Norm();
		let bp = point.Minus(b);
		if (bp.Dot(ab) >= 0)
			return bp.Norm();
		ab.Normalize();
		return ap.Cross(ab).Norm();
	}

	static PlaneFitting(data: DataProvider<Vector>): PlaneFittingResult {
		//Compute the coletiance matrix
		let coletiance = Matrix.Null(3, 3);
		let center = new Vector([0, 0, 0]);
		let size = data.Size();
		for (let index = 0; index < size; index++) {
			center = center.Plus(data.GetData(index));
		}
		center = center.Times(1 / size);
		for (let index = 0; index < size; index++) {
			let vec = data.GetData(index).Minus(center);
			for (let ii = 0; ii < 3; ii++) {
				for (let jj = 0; jj < 3; jj++) {
					coletiance.SetValue(ii, jj,
						coletiance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj))
					);
				}
			}
		}

		//The normal is the eigenvector having the smallest eigenvalue in the coletiance matrix
		for (let ii = 0; ii < 3; ii++) {
			//Check no column is null in the coletiance matrix
			if (coletiance.GetColumnVector(ii).SqrNorm() <= 1.0e-12) {
				let result = new Vector([0, 0, 0]);
				result.Set(ii, 1);
				return new PlaneFittingResult(center, result);
			}
		}
		let eigen = new EigenDecomposition(coletiance);
		if (eigen) {
			return new PlaneFittingResult(
				center,
				eigen[0].eigenVector.Normalized()
			);
		}
		return null;
	}
}