/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />


class Cylinder extends Shape {
	constructor(public center: Vector, public axis: Vector, public radius: number, public height: number) {
		super();
	}

	ApplyTransform(transform: Transform) {
		this.axis = transform.TransformVector(this.axis).Normalized();
		this.center = transform.TransformPoint(this.center);
		this.radius *= transform.scalefactor;
		this.height *= transform.scalefactor;
	}

	ComputeBoundingBox(): BoundingBox {
		let size = new Vector([
			2 * (Math.abs(0.5 * this.height * this.axis.Get(0)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(0))))),
			2 * (Math.abs(0.5 * this.height * this.axis.Get(1)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(1))))),
			2 * (Math.abs(0.5 * this.height * this.axis.Get(2)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(2)))))
		]);
		let bb = new BoundingBox();
		bb.Set(this.center, size);
		return bb;
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
			translation.SetValue(index, 3, -this.center.Get(index));
		}
		return basechange.Multiply(translation);
	}

	ComputeMesh(sampling: number, onDone: Function): Mesh {
		let points = new PointCloud();
		points.Reserve(4 * sampling + 2);

		let xx = this.axis.GetOrthogonnal();
		let yy = this.axis.Cross(xx).Normalized();
		let radials = [];
		for (let ii = 0; ii < sampling; ii++) {
			let phi = 2.0 * ii * Math.PI / sampling;
			let c = Math.cos(phi);
			let s = Math.sin(phi);
			let radial = xx.Times(c).Plus(yy.Times(s));
			radials.push(radial.Times(this.radius));
		}
		let northCenter = this.center.Plus(this.axis.Times(this.height / 2));
		let southCenter = this.center.Minus(this.axis.Times(this.height / 2));
		points.PushPoint(northCenter);
		points.PushPoint(southCenter);
		//North face
		for (let ii = 0; ii < radials.length; ii++) {
			points.PushPoint(northCenter.Plus(radials[ii]));
		}
		//South face
		for (let ii = 0; ii < radials.length; ii++) {
			points.PushPoint(southCenter.Plus(radials[ii]));
		}
		//Double points to separate normals
		for (let ii = 0; ii < radials.length; ii++) {
			points.PushPoint(northCenter.Plus(radials[ii]));
		}
		for (let ii = 0; ii < radials.length; ii++) {
			points.PushPoint(southCenter.Plus(radials[ii]));
		}

		let mesh = new Mesh(points);
		mesh.Reserve(4 * sampling);
		//North pole
		let northShift = 2;
		for (let ii = 0; ii < sampling; ii++) {
			mesh.PushFace([0, ii + northShift, ((ii + 1) % sampling) + northShift]);
		}
		//South pole
		let southShift = sampling + 2;
		for (let ii = 0; ii < sampling; ii++) {
			mesh.PushFace([ii + southShift, 1, ((ii + 1) % sampling) + southShift]);
		}
		//Strips
		let shift = southShift + sampling;
		for (let ii = 0; ii < sampling; ii++) {
			let ia = ii;
			let ib = (ii + 1) % sampling;
			let ja = 0;
			let jb = sampling;
			let aa = ia + ja + shift;
			let ab = ia + jb + shift;
			let bb = ib + jb + shift;
			let ba = ib + ja + shift;
			mesh.PushFace([aa, ab, ba]);
			mesh.PushFace([ba, ab, bb]);
		}

		mesh.ComputeNormals(onDone);

		return mesh;
	}

	RayIntersection(ray: Ray, wrapper: Pickable): Picking {
		let worldToBase = this.GetWorldToInnerBaseMatrix();
		let innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
		let innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));

		//haveing p[t] = (innerFrom[i]+t*innerDir[i])
		//Solve p[t].x^2+p[t].y^2=radius for each i<3
		let aa = 0;
		let bb = 0;
		let cc = 0;
		for (let index = 0; index < 2; index++) {
			aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
			bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
			cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
		}

		//Solve [t] : aa.t^2 + bb.t + cc = radius
		let halfHeight = this.height / 2.0;
		let sqrRadius = this.radius * this.radius;
		cc -= sqrRadius;
		let dd = bb * bb - 4.0 * aa * cc;
		let result = new Picking(wrapper);
		let nbResults = 0;
		function acceptValue(value) {
			let point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
			if (Math.abs(point.Get(2)) <= halfHeight) {
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

		if (nbResults < 2 && Math.abs(innerDir.GetValue(2, 0)) > 0.000001) {
			//test bounding disks
			//solve [t] : p[t].z = halfHeight
			let values = [
				(halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0),
				(-halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0)
			];
			for (let ii = 0; ii < 2; ii++) {
				let value = values[ii];
				let point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
				if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= sqrRadius) {
					result.Add(value);
				}
			}
		}
		return result;
	}

	Distance(point: Vector): number {
		let delta = point.Minus(this.center);
		let hyp = delta.SqrNorm();
		let adj = this.axis.Dot(delta);
		let op = Math.sqrt(hyp - (adj * adj));

		return Math.abs(op - this.radius);
	}

	ComputeBounds(points: number[], cloud: PointCloud): void {
		let min = 0;
		let max = 0;
		for (let ii = 0; ii < points.length; ii++) {
			let d = cloud.GetPoint(points[ii]).Minus(this.center).Dot(this.axis);
			if (ii == 0 || d < min) {
				min = d;
			}
			if (ii == 0 || d > max) {
				max = d;
			}
		}
		let d = 0.5 * (min + max);
		this.center = this.center.Plus(this.axis.Times(d));
		this.height = max - min;
	}

	static InitialGuessForFitting(cloud: PointCloud): Cylinder {
		let gsphere = new GaussianSphere(cloud);
		let plane = Geometry.PlaneFitting(gsphere);
		let center = Geometry.Centroid(cloud);
		let radius = 0;
		let size = cloud.Size();
		for (let index = 0; index < size; index++) {
			radius += cloud.GetPoint(index).Minus(center).Cross(plane.normal).Norm();
		}
		radius /= size;

		return new Cylinder(center, plane.normal, radius, 0);
	}

	FitToPointCloud(cloud: PointCloud) {
		let self = this;
		let lsFitting = new LeastSquaresFitting(
			CylinderFitting.Parameters(this.center, this.axis, this.radius),
			new CylinderFitting(this),
			cloud,
			'Computing best fitting cylinder');
		lsFitting.SetNext(() => self.FinalizeFitting(cloud));
		lsFitting.Start();
	}

	private FinalizeFitting(cloud: PointCloud) {
		//Compute actual cylinder center and bounds along the axis
		let zmin = null;
		let zmax = null;
		let size = cloud.Size();
		for (let index = 0; index < size; index++) {
			let z = cloud.GetPoint(index).Minus(this.center).Dot(this.axis);
			if (zmin === null || zmin > z) {
				zmin = z;
			}
			if (zmax === null || zmax < z) {
				zmax = z;
			}
		}
		this.center = this.center.Plus(this.axis.Times((zmax + zmin) / 2.0));
		this.height = zmax - zmin;

		this.NotifyChange();
	}
}

class CylinderFitting implements LeastSquaresEvaluable<Vector> {
	constructor(private cylinder: Cylinder) {
	}

	static Parameters(center: Vector, axis: Vector, radius: number): number[] {
		let theta = Geometry.GetTheta(axis);
		let phi = Geometry.GetPhi(axis);
		let xaxis = Geometry.GetXAxis(theta, phi);
		let yaxis = Geometry.GetYAxis(theta, phi);
		let x = xaxis.Dot(center);
		let y = yaxis.Dot(center);
		return [x, y, theta, phi, radius];

	}

	static GetCenter(params: number[]): Vector {
		let theta = CylinderFitting.GetTheta(params);
		let phi = CylinderFitting.GetPhi(params);
		let x = CylinderFitting.GetX(params);
		let y = CylinderFitting.GetY(params);
		return Geometry.GetXAxis(theta, phi).Times(x).Plus(Geometry.GetYAxis(theta, phi).Times(y));
	}

	static GetAxis(params: number[]): Vector {
		return Geometry.GetZAxis(
			CylinderFitting.GetTheta(params),
			CylinderFitting.GetPhi(params)
		);
	}

	private static GetX(params: number[]): number {
		return params[0];
	}

	private static GetY(params: number[]): number {
		return params[1];
	}

	private static GetTheta(params: number[]): number {
		return params[2];
	}

	private static GetPhi(params: number[]): number {
		return params[3];
	}

	static GetRadius(params: number[]): number {
		return params[4];
	}

	Distance(params: number[], point: Vector): number {
		let theta = CylinderFitting.GetTheta(params);
		let phi = CylinderFitting.GetPhi(params);
		let x = CylinderFitting.GetX(params);
		let y = CylinderFitting.GetY(params);
		let radius = CylinderFitting.GetRadius(params);
		let xaxis = Geometry.GetXAxis(theta, phi);
		let yaxis = Geometry.GetYAxis(theta, phi);

		let dx = point.Dot(xaxis) - x;
		let dy = point.Dot(yaxis) - y;
		return Math.sqrt(dx ** 2 + dy ** 2) - radius;
	}

	DistanceGradient(params: number[], point: Vector): number[] {
		let theta = CylinderFitting.GetTheta(params);
		let phi = CylinderFitting.GetPhi(params);
		let x = CylinderFitting.GetX(params);
		let y = CylinderFitting.GetY(params);
		let xaxis = Geometry.GetXAxis(theta, phi);
		let yaxis = Geometry.GetYAxis(theta, phi);
		let zaxis = Geometry.GetZAxis(theta, phi);
		let waxis = Geometry.GetWAxis(theta, phi);

		let px = point.Dot(xaxis);
		let py = point.Dot(yaxis);
		let pz = point.Dot(zaxis);
		let pw = point.Dot(waxis);

		let dx = px - x;
		let dy = py - y;
		let dist = Math.sqrt((dx ** 2) + (dy ** 2));

		let ddx = - dx / dist;
		let ddy = - dy / dist;
		let ddtheta = - dx * pz / dist;
		let ddphi = ((Math.cos(theta) * dx * py) - (dy * pw)) / dist;
		let ddradius = -1;

		return [ddx, ddy, ddtheta, ddphi, ddradius];
	}

	NotifyNewSolution(params: number[]) {
		this.cylinder.center = CylinderFitting.GetCenter(params);
		this.cylinder.axis = CylinderFitting.GetAxis(params);
		this.cylinder.radius = CylinderFitting.GetRadius(params);
	}
}