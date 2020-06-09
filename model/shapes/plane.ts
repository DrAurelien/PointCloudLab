/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />


class Plane extends Shape {
	constructor(public center: Vector, public normal: Vector, public patchRadius: number) {
		super();
	}

	ComputeMesh(sampling: number, onDone: Function): Mesh {
		let points = new PointCloud();
		points.Reserve(sampling + 1);

		let xx = this.normal.GetOrthogonnal();
		let yy = this.normal.Cross(xx).Normalized();
		for (let ii = 0; ii < sampling; ii++) {
			let phi = 2.0 * ii * Math.PI / sampling;
			let c = Math.cos(phi);
			let s = Math.sin(phi);
			let radiusVect = xx.Times(c).Plus(yy.Times(s));
			points.PushPoint(this.center.Plus(radiusVect.Times(this.patchRadius)));
		}
		points.PushPoint(this.center);

		let mesh = new Mesh(points);
		mesh.Reserve(sampling);
		for (let ii = 0; ii < sampling; ii++) {
			mesh.PushFace([ii, sampling, (ii + 1) % sampling]);
		}

		mesh.ComputeNormals(onDone);

		return mesh;
	}

	Distance(point: Vector): number {
		return Math.abs(point.Minus(this.center).Dot(this.normal));
	}

	ApplyTransform(transform: Transform) {
		this.normal = transform.TransformVector(this.normal).Normalized();
		this.center = transform.TransformPoint(this.center);
		this.patchRadius *= transform.scalefactor;
	}

	ComputeBoundingBox(): BoundingBox {
		let size = new Vector([
			2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(0)))),
			2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(1)))),
			2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(2))))
		]);
		let bb = new BoundingBox();
		bb.Set(this.center, size);
		return bb;
	}

	GetWorldToInnerBaseMatrix(): Matrix {
		let translation = Matrix.Identity(4);
		let basechange = Matrix.Identity(4);
		let xx = this.normal.GetOrthogonnal();
		let yy = this.normal.Cross(xx).Normalized();
		for (let index = 0; index < 3; index++) {
			basechange.SetValue(0, index, xx.Get(index));
			basechange.SetValue(1, index, yy.Get(index));
			basechange.SetValue(2, index, this.normal.Get(index));
			translation.SetValue(index, 3, -this.center.Get(index));
		}
		return basechange.Multiply(translation);
	}

	RayIntersection(ray: Ray, wrapper: Pickable): Picking {
		let worldToBase = this.GetWorldToInnerBaseMatrix();
		let innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
		let innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));

		//solve [t] : p[t].z = 0
		let result = new Picking(wrapper);
		let tt = -innerFrom.GetValue(2, 0) / innerDir.GetValue(2, 0);
		let point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(tt));
		if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (this.patchRadius * this.patchRadius)) {
			result.Add(tt);
		}
		return result;
	}

	ComputeBounds(points: PointSet): void {
		this.center = new Vector([0, 0, 0]);
		let size = points.Size();
		for (let ii = 0; ii < points.Size(); ii++) {
			this.center = this.center.Plus(points.GetPoint(ii));
		}
		this.center = this.center.Times(1.0 / size);
		this.patchRadius = 0;
		for (let ii = 0; ii < size; ii++) {
			let d = points.GetPoint(ii).Minus(this.center).SqrNorm();
			if (d > this.patchRadius) {
				this.patchRadius = d;
			}
		}
		this.patchRadius = Math.sqrt(this.patchRadius);
	}

	FitToPoints(points: PointSet): Process {
		let result = Geometry.PlaneFitting(points);
		this.normal = result.normal;
		this.center = result.center;
		this.patchRadius = result.ComputePatchRadius(points);
		return null;
	}
}