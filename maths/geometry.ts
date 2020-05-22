/// <reference path="vector.ts" />
/// <reference path="../tools/picking.ts" />


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
}