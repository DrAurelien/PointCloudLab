/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/leatssquaresfitting.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />


class Sphere extends Shape {
	constructor(public center: Vector, public radius: number) {
		super();
	}

	ComputeBoundingBox(): BoundingBox {
		let size = new Vector([1, 1, 1]).Times(2 * this.radius);
		let bb = new BoundingBox();
		bb.Set(this.center, size);
		return bb;
	}

	GetWorldToInnerBaseMatrix(): Matrix {
		let matrix = Matrix.Identity(4);
		for (let index = 0; index < 3; index++) {
			matrix.SetValue(index, 3, -this.center.Get(index));
		}
		return matrix;
	}

	GetInnerBaseToWorldMatrix(): Matrix {
		let matrix = Matrix.Identity(4);
		for (let index = 0; index < 3; index++) {
			matrix.SetValue(index, 3, this.center.Get(index));
		}
		return matrix;
	}

	ComputeMesh(sampling: number, onDone: Function): Mesh {
		let halfSampling = Math.ceil(sampling / 2);
		let points = new PointCloud();
		points.Reserve(sampling * halfSampling + 2);

		points.PushPoint(this.center.Plus(new Vector([0, 0, this.radius])));
		points.PushPoint(this.center.Plus(new Vector([0, 0, -this.radius])));
		//Spherical coordinates
		for (let jj = 0; jj < halfSampling; jj++) {
			for (let ii = 0; ii < sampling; ii++) {
				let phi = ((jj + 1) * Math.PI) / (halfSampling + 1);
				let theta = 2.0 * ii * Math.PI / sampling;
				let radial = new Vector([
					Math.cos(theta) * Math.sin(phi),
					Math.sin(theta) * Math.sin(phi),
					Math.cos(phi)
				]);
				points.PushPoint(this.center.Plus(radial.Times(this.radius)));
			}
		}

		let mesh = new Mesh(points);
		mesh.Reserve(2 * sampling + (halfSampling - 1) * sampling);

		//North pole
		let northShift = 2;
		for (let ii = 0; ii < sampling; ii++) {
			mesh.PushFace([0, ii + northShift, ((ii + 1) % sampling) + northShift]);
		}
		//South pole
		let southShift = (halfSampling - 1) * sampling + northShift;
		for (let ii = 0; ii < sampling; ii++) {
			mesh.PushFace([ii + southShift, 1, ((ii + 1) % sampling) + southShift]);
		}
		//Strips
		for (let jj = 0; (jj + 1) < halfSampling; jj++) {
			let ja = jj * sampling;
			let jb = (jj + 1) * sampling;
			for (let ii = 0; ii < sampling; ii++) {
				let ia = ii;
				let ib = (ii + 1) % sampling;
				//            [ia]        [ib]
				//   [ja] ---- aa -------- ba
				//             |           |
				//   [jb] ---- ab -------- bb
				let aa = ia + ja + northShift;
				let ab = ia + jb + northShift;
				let bb = ib + jb + northShift;
				let ba = ib + ja + northShift;
				mesh.PushFace([aa, ab, ba]);
				mesh.PushFace([ba, ab, bb]);
			}
		}

		mesh.ComputeNormals(onDone);

		return mesh;
	}

	RayIntersection(ray: Ray, wrapper: Pickable): Picking {
		let worldToBase = this.GetWorldToInnerBaseMatrix();
		let innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
		let innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));

		//Solve [t] : sqrnorm(innerFrom[i]+t*innerDir[i])=radius
		let aa = 0;
		let bb = 0;
		let cc = 0;
		for (let index = 0; index < 3; index++) {
			aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
			bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
			cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
		}

		//Solve [t] : aa.t^2 + bb.t + cc = radius
		cc -= this.radius * this.radius;
		let dd = bb * bb - 4.0 * aa * cc;
		let result = new Picking(wrapper);
		if (Math.abs(dd) < 0.0000001) {
			result.Add(-bb / 2.0 * aa);
		}
		else if (dd > 0.) {
			result.Add((-bb + Math.sqrt(dd)) / (2.0 * aa));
			result.Add((-bb - Math.sqrt(dd)) / (2.0 * aa));
		}

		return result;
	}

	Distance(point: Vector): number {
		return Math.abs(point.Minus(this.center).Norm() - this.radius);
	}

	ApplyTransform(transform: Transform) {
		this.center = transform.TransformPoint(this.center);
		this.radius *= transform.scalefactor;
	}

	static InitialGuessForFitting(cloud: PointCloud): Sphere {
		let center = new Vector([0, 0, 0]);
		let size = cloud.Size();

		//Rough estimate
		for (let index = 0; index < size; index++) {
			center.Add(cloud.GetPoint(index));
		}
		center = center.Times(1 / size);

		let radius = 0;
		for (let index = 0; index < cloud.Size(); index++) {
			radius += center.Minus(cloud.GetPoint(index)).Norm();
		}
		radius /= size;

		return new Sphere(center, radius);
	}

	ComputeBounds(points: PointSet) {
		//NA
	}

	FitToPoints(points: PointSet): Process {
		let lsFitting = new LeastSquaresFitting(
			SphereFitting.Parameters(this.center, this.radius),
			new SphereFitting(this),
			points,
			'Computing best fitting sphere');
		let self = this;
		lsFitting.Start();
		return lsFitting;
	}
}

class SphereFitting implements LeastSquaresEvaluable<Vector> {
	constructor(private sphere: Sphere) {
	}

	static Parameters(center: Vector, radius: number): number[] {
		let params = center.coordinates.slice();
		params.push(radius);
		return params;
	}

	static GetCenter(params: number[]): Vector {
		return new Vector(params.slice(0, 3));
	}

	static GetRadius(params: number[]): number {
		return params[3];
	}

	Distance(params: number[], point: Vector): number {
		return SphereFitting.GetCenter(params).Minus(point).Norm() - SphereFitting.GetRadius(params);
	}

	DistanceGradient(params: number[], point: Vector): number[] {
		let delta = SphereFitting.GetCenter(params).Minus(point);
		delta.Normalize();
		let gradient = delta.Flatten();
		gradient.push(-1);
		return gradient;
	}

	NotifyNewSolution(params: number[]) {
		this.sphere.center = SphereFitting.GetCenter(params);
		this.sphere.radius = SphereFitting.GetRadius(params);
	}
}