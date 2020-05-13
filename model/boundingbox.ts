/// <reference path="../maths/vector.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../maths/vector.ts" />


class BoundingBox {
	constructor(public min: Vector = null, public max: Vector = null) {
	}

	Set(center: Vector, size: Vector) {
		let halfSize = size.Times(0.5);
		this.min = center.Minus(halfSize);
		this.max = center.Plus(halfSize);
	}


	GetCenter(): Vector {
		return this.min.Plus(this.max).Times(0.5);
	}

	GetSize(): Vector {
		return this.max.Minus(this.min);
	}

	Add(p: Vector): void {
		if (this.min == null || this.max == null) {
			this.min = new Vector(p.Flatten());
			this.max = new Vector(p.Flatten());
		}
		else {
			for (var index = 0; index < p.Dimension(); index++) {
				this.min.Set(index, Math.min(this.min.Get(index), p.Get(index)));
				this.max.Set(index, Math.max(this.max.Get(index), p.Get(index)));
			}
		}
	}

	AddBoundingBox(bb: BoundingBox): void {
		if (bb && bb.IsValid()) {
			this.Add(bb.min);
			this.Add(bb.max);
		}
	}

	IsValid(): boolean {
		return (this.min != null && this.max != null);
	}

	Intersect(box: BoundingBox): boolean {
		let dim = this.min.Dimension();
		for (let index = 0; index < dim; index++) {
			if ((box.max.Get(index) < this.min.Get(index)) || (box.min.Get(index) > this.max.Get(index))) {
				return false;
			}
		}
		return true;
	}

	TestAxisSeparation(point: Vector, axis: Vector): boolean {
		let dim = this.min.Dimension();
		let v = 0.0;
		for (let index = 0; index < dim; index++) {
			v += Math.abs(axis.Get(index) * (this.max.Get(index) - this.min.Get(index)))
		}
		let proj = this.GetCenter().Minus(point).Dot(axis);
		let minproj = proj - v;
		let maxproj = proj + v;
		return (minproj * maxproj) > 0;
	}

	RayIntersection(ray: Ray): Picking {
		let result = new Picking(null);
		let dim = this.min.Dimension();
		let self = this;

		function Accept(dist: number, ignore: number) {
			let inside = true;
			let p = ray.GetPoint(dist);
			for (let index = 0; inside && index < dim; index++) {
				if (index != ignore) {
					inside = (p.Get(index) >= self.min.Get(index)) && (p.Get(index) <= self.max.Get(index));
				}
			}
			if (inside) {
				result.Add(dist);
			}
		}

		for (let index = 0; index < dim; index++) {
			let dd = ray.dir.Get(index);
			if (Math.abs(dd) > 1.0e-12) {
				Accept((this.min.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
				Accept((this.max.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
			}
		}
		return result;
	}
}
