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

	static PlanesIntersection(planes: PlaneFittingResult[]): Vector {
		//Simply solve the (over constrained) linear problem
		//Having ni.x = ni.pi for all ni, pi being respectively the planes normals and centers
		//Thus N.x = Y (N being the normals matrix, Y being the matrix of dot products between normals and centers)
		//Use the Pseudo inverse method, we have to find x satifying N[t].N.x = N[t].Y ([t] = transposed)
		let left = Matrix.Null(3, 3);
		let right = Matrix.Null(1, 3);
		let size = planes.length;
		for (let index = 0; index < size; index++) {
			let n = planes[index].normal;
			let p = planes[index].center;
			let s = p.Dot(n);
			for (let ii = 0; ii < 3; ii++) {
				right.AddValue(ii, 0, n.Get(ii) * s);
				for (let jj = 0; jj < 3; jj++) {
					left.AddValue(ii, jj, n.Get(ii) * n.Get(jj));
				}
			}
		}
		return left.LUSolve(right).GetColumnVector(0);
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

	static Centroid(data: DataProvider<Vector>, weights: DataProvider<number>=null): Vector {
		let center = new Vector([0, 0, 0]);
		let size = data.Size();
		for (let index = 0; index < size; index++) {
			let datum = data.GetData(index);
			if (weights) {
				datum = datum.Times(weights.GetData(index));
			}
			center.Add(datum);
		}
		center = center.Times(1 / size);
		return center;
	}

	static PlaneFitting(data: DataProvider<Vector>): PlaneFittingResult {
		//Compute the coletiance matrix
		let coletiance = Matrix.Null(3, 3);
		let center = Geometry.Centroid(data);
		let size = data.Size();
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

	//=======================================================
	// Spherical coordinates tools
	// Let theta, phi, fully describing an orthogonal base (theta, phi being the spherical coordinates of the Z axis)
	//=======================================================
	static GetTheta(zaxis: Vector): number {
		return Math.acos(zaxis.Get(2));
	}

	static GetPhi(zaxis: Vector): number {
		if (Math.abs(zaxis.Get(0)) > 1e-6) {
			return Math.atan2(zaxis.Get(1), zaxis.Get(0));
		}
		return 0;
	}

	static GetZAxis(theta: number, phi: number): Vector {
		return new Vector([
			Math.cos(phi) * Math.sin(theta),
			Math.sin(phi) * Math.sin(theta),
			Math.cos(theta)
		]);
	}

	static GetXAxis(theta: number, phi: number): Vector {
		return new Vector([
			Math.cos(phi) * Math.cos(theta),
			Math.sin(phi) * Math.cos(theta),
			-Math.sin(theta)
		]);
	}

	static GetYAxis(theta: number, phi: number): Vector {
		return new Vector([
			-Math.sin(phi),
			Math.cos(phi),
			0
		]);
	}

	//This one is the projection of both Zaxis and XAxis in the plane Z=0 (thus, it's orthogonal to YAxis as well)
	static GetWAxis(theta: number, phi: number): Vector {
		return new Vector([
			Math.cos(phi),
			Math.sin(phi),
			0
		]);
	}
}