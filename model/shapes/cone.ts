/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />


class Cone extends Shape {
	constructor(public apex: Vector, public axis: Vector, public angle: number, public height: number) {
		super();
	}

	ComputeBoundingBox(): BoundingBox {
		let radius = Math.tan(this.angle) * this.height;
		let size = new Vector([
			2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(0)))),
			2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(1)))),
			2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(2))))
		]);
		let bb = new BoundingBox();
		bb.Set(this.apex.Plus(this.axis.Times(this.height)), size);
		bb.Add(this.apex);
		return bb;
	}

	ApplyTransform(transform: Transform) {
		this.axis = transform.TransformVector(this.axis).Normalized();
		this.height *= transform.scalefactor;
		let c = this.apex.Plus(this.axis.Times(this.height * 0.5));
		c = transform.TransformPoint(c);
		this.apex = c.Minus(this.axis.Times(this.height * 0.5));
	}

	GetWorldToInnerBaseMatrix(): Matrix {
		let translation = Matrix.Identity(4);
		let basechange = Matrix.Identity(4);
		let xx = this.axis.GetOrthogonnal();
		let yy = this.axis.Cross(xx).Normalized();
		for (let index = 0; index < 3; index++) {
			basechange.SetValue(0, index, xx.Get(index));
			basechange.SetValue(1, index, yy.Get(index));
			basechange.SetValue(2, index, this.axis.Get(index));
			translation.SetValue(index, 3, -this.apex.Get(index));
		}
		return basechange.Multiply(translation);
	}

	ComputeMesh(sampling: number, onDone: Function): Mesh {
		let points = new PointCloud();
		points.Reserve(1 + 3 * sampling);

		let xx = this.axis.GetOrthogonnal();
		let yy = this.axis.Cross(xx).Normalized();
		let radials = [];
		for (let ii = 0; ii < sampling; ii++) {
			let phi = 2.0 * ii * Math.PI / sampling;
			let c = Math.cos(phi);
			let s = Math.sin(phi);
			let radial = xx.Times(c).Plus(yy.Times(s));
			radials.push(radial.Times(this.angle));
		}
		let center = this.apex.Plus(this.axis.Times(this.height));
		points.PushPoint(center);
		//Face circle (double points for normals compuation)
		for (let ii = 0; ii < radials.length; ii++) {
			points.PushPoint(center.Plus(radials[ii]));
		}
		for (let ii = 0; ii < radials.length; ii++) {
			points.PushPoint(this.apex);
		}
		for (let ii = 0; ii < radials.length; ii++) {
			points.PushPoint(center.Plus(radials[ii]));
		}

		let mesh = new Mesh(points);
		mesh.Reserve(2 * sampling);
		let shift = 1;
		//Face
		for (let ii = 0; ii < sampling; ii++) {
			mesh.PushFace([0, ii + shift, ((ii + 1) % sampling) + shift]);
		}
		//Strips
		shift += sampling;
		for (let ii = 0; ii < sampling; ii++) {
			mesh.PushFace([ii + shift + sampling, ii + shift, ((ii + 1) % sampling) + shift + sampling]);
			mesh.PushFace([ii + shift + sampling, ((ii + 1) % sampling) + shift, ((ii + 1) % sampling) + shift + sampling]);
		}

		mesh.ComputeNormals(onDone);

		return mesh;
	}

	RayIntersection(ray: Ray, wrapper: Pickable): Picking {
		let worldToBase = this.GetWorldToInnerBaseMatrix();
		let innerFrom = Homogeneous.ToVector(worldToBase.Multiply(new HomogeneousPoint(ray.from)));
		let innerDir = Homogeneous.ToVector(worldToBase.Multiply(new HomogeneousVector(ray.dir)));

		//having p[t] = (innerFrom[i]+t*innerDir[i])
		//Solve p[t].x^2+p[t].y^2-(p[t].z * tan(a))^2=0 for each i<3
		let aa = .0;
		let bb = .0;
		let cc = .0;
		let tana = Math.tan(this.angle);
		for (let index = 0; index < 3; index++) {
			let coef = (index == 2) ? (-tana * tana) : 1.0;
			aa += coef * innerDir.Get(index) * innerDir.Get(index);
			bb += coef * 2.0 * innerDir.Get(index) * innerFrom.Get(index);
			cc += coef * innerFrom.Get(index) * innerFrom.Get(index);
		}

		//Solve [t] aa.t^2 + bb.t + cc.t = 0
		let dd = bb * bb - 4.0 * aa * cc;
		let result = new Picking(wrapper);
		let nbResults = 0;
		let height = this.height;
		function acceptValue(value) {
			let point = innerFrom.Plus(innerDir.Times(value));
			if (0 <= point.Get(2) && point.Get(2) <= height) {
				result.Add(value);
				nbResults++;
			}
		}

		if (Math.abs(dd) < 0.0000001) {
			acceptValue(-bb / 2.0 * aa);
		}
		else if (dd > 0.) {
			acceptValue((-bb + Math.sqrt(dd)) / (2.0 * aa));
			acceptValue((-bb - Math.sqrt(dd)) / (2.0 * aa));
		}

		if (nbResults < 2 && Math.abs(innerDir.Get(2)) > 0.000001) {
			let radius = tana * height;
			//test bounding disks
			//solve [t] : p[t].z = this.height
			let value = (this.height - innerFrom.Get(2)) / innerDir.Get(2);
			let point = innerFrom.Plus(innerDir.Times(value));
			if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (radius * radius)) {
				result.Add(value);
			}
		}
		return result;
	}

	Distance(point: Vector): number {
		return 0.0;
	}

	ComputeBounds(points: number[], cloud: PointCloud): void {
		let min = 0;
		let max = 0;
		for (let ii = 0; ii < points.length; ii++) {
			let d = cloud.GetPoint(points[ii]).Minus(this.apex).Dot(this.axis);
			if (ii == 0 || d > max) {
				max = d;
			}
		}
		this.height = max;
	}
}