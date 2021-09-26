/// <reference path="../maths/vector.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../tools/picking.ts" />


class MeshFace {
	private normal: Vector;
	private boundingbox: BoundingBox;

	constructor(private owner: Mesh, private index: number) {
	}

	LineFaceIntersection(line: Ray): number {
		//Compute line / face intersection
		//solve line.from + t * line.dir
		let dd = this.Normal.Dot(this.GetPoint(0));
		let nn = line.dir.Dot(this.Normal);
		if (Math.abs(nn) < 1e-6) {
			return null;
		}
		let tt = (dd - line.from.Dot(this.Normal)) / nn;

		let point = line.from.Plus(line.dir.Times(tt));
		if (!this.Inside(point)) {
			return null;
		}

		return tt;
	}

	Inside(point: Vector): boolean {
		for (let ii = 0; ii < 3; ii++) {
			let test = point.Minus(this.GetPoint(ii)).Cross(this.GetPoint((ii + 1) % 3).Minus(this.GetPoint(ii)));
			if (test.Dot(this.Normal) > 0) {
				return false;;
			}
		}
		return true;
	}

	get Normal(): Vector {
		if (!this.normal) {
			this.normal = this.GetPoint(1).Minus(this.GetPoint(0)).Cross(this.GetPoint(2).Minus(this.GetPoint(0))).Normalized();
		}
		return this.normal;
	}

	get BoundingBox(): BoundingBox {
		if (!this.boundingbox) {
			this.boundingbox = new BoundingBox();
			for (let index = 0; index < 3; index++) {
				this.boundingbox.Add(this.GetPoint(index));
			}
		}
		return this.boundingbox;
	}

	get Flag(): number {
		return this.owner.flags[this.index];
	}

	set Flag(value: number) {
		this.owner.flags[this.index] = value;
	}

	IntersectBox(box: BoundingBox): boolean {
		//Separated axis theorem : search for a separation axis
		if (!this.BoundingBox.Intersect(box)) {
			return false;
		}

		//Todo : Normal cross edges ?

		return !box.TestAxisSeparation(this.GetPoint(0), this.Normal);
	}

	Distance(point: Vector): number {
		if (this.Inside(point)) {
			return Math.abs(this.Normal.Dot(point.Minus(this.GetPoint(0))));
		}
		let dist = null;
		for (let ii = 0; ii < 3; ii++) {
			let dd = Geometry.DistanceToSegment(point, this.GetPoint(ii), this.GetPoint((ii + 1) % 3));
			if (dist == null || dd < dist) {
				dist = dd;
			}
		}
		return dist;
	}

	GetPointIndex(index: number): number {
		return this.owner.faces[3*this.index + index];
	}

	GetPoint(index: number): Vector {
		return this.owner.pointcloud.GetPoint(this.GetPointIndex(index))
	}
}