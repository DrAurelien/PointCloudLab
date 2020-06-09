/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
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
		let c = this.apex.Plus(this.axis.Times(this.height * 0.5));
		this.axis = transform.TransformVector(this.axis).Normalized();
		this.height *= transform.scalefactor;
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
		let radius = this.height * Math.tan(this.angle);
		let radials = [];
		for (let ii = 0; ii < sampling; ii++) {
			let phi = 2.0 * ii * Math.PI / sampling;
			let c = Math.cos(phi);
			let s = Math.sin(phi);
			let radial = xx.Times(c).Plus(yy.Times(s));
			radials.push(radial.Times(radius));
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
		let delta = point.Minus(this.apex);
		let dist = delta.Norm();
		let beyondApex = (delta.Dot(this.axis)) < (- Math.sin(this.angle) * dist);
		if (beyondApex) {
			return dist;
		}
		else {
			return (Math.cos(this.angle) * delta.Cross(this.axis).Norm()) - (Math.sin(this.angle) * delta.Dot(this.axis));
		}
	}

	ComputeBounds(points: PointSet): void {
		let max = 0;
		for (let ii = 0; ii < points.Size(); ii++) {
			let d = points.GetPoint(ii).Minus(this.apex).Dot(this.axis);
			if (ii == 0 || d > max) {
				max = d;
			}
		}
		this.height = max;
	}

	static InitialGuessForFitting(cloud: PointCloud): Cone {
		let gsphere = new GaussianSphere(cloud);
		let plane = Geometry.PlaneFitting(gsphere);
		let planeheight = plane.center.Norm();
		let angle = Math.asin(planeheight);
		let size = cloud.Size();

		let planes = new Array<PlaneFittingResult>(size);
		for (let index = 0; index < size; index++) {
			planes[index] = new PlaneFittingResult(cloud.GetPoint(index), gsphere.GetPoint(index));
		}
		let apex = Geometry.PlanesIntersection(planes);

		//Handle axis orientation : make it point to he cloud centroid ... otherwise, we could face ill-conditionned matrices during the fitting step
		let delta = Geometry.Centroid(cloud).Minus(apex);
		if (plane.normal.Dot(delta) < 0) {
			plane.normal = plane.normal.Times(-1);
		}
		return new Cone(apex, plane.normal, angle, 0);
	}

	FitToPoints(points: PointSet): Process {
		let self = this;
		let lsFitting = new LeastSquaresFitting(
			ConeFitting.Parameters(this.apex, this.axis, this.angle),
			new ConeFitting(this),
			points,
			'Computing best fitting cone'
		);
		lsFitting.SetNext(() => self.FinalizeFitting(points));
		lsFitting.Start();
		return lsFitting;
	}

	private FinalizeFitting(points: PointSet) {
		//Compute actual cone height and axis direction
		let zmax = null;
		let size = points.Size();
		for (let index = 0; index < size; index++) {
			let z = points.GetPoint(index).Minus(this.apex).Dot(this.axis);
			if (zmax === null || Math.abs(zmax) < Math.abs(z)) {
				zmax = z;
			}
		}
		if (zmax < 0) {
			this.axis = this.axis.Times(-1);
		}
		this.height = Math.abs(zmax);
	}
}

class ConeFitting implements LeastSquaresEvaluable<Vector> {
	constructor(private cone: Cone) {
	}

	static Parameters(apex: Vector, axis: Vector, angle: number): number[] {
		let theta = Geometry.GetTheta(axis);
		let phi = Geometry.GetPhi(axis);
		let result = apex.Clone().Flatten();
		result.push(theta);
		result.push(phi);
		result.push(angle);
		return result;
	}

	static GetApex(params: number[]): Vector {
		return new Vector(params.slice(0, 3));
	}

	static GetAxis(params: number[]): Vector {
		return Geometry.GetZAxis(
			ConeFitting.GetTheta(params),
			ConeFitting.GetPhi(params)
		);
	} 

	private static GetTheta(params: number[]): number {
		return params[3];
	}

	private static GetPhi(params: number[]): number {
		return params[4];
	}

	static GetAngle(params: number[]): number {
		return params[5];
	}

	static IsBeyondApex(apexToPoint: Vector, axis: Vector, angle: number): boolean {
		return (apexToPoint.Dot(axis)) < (- Math.sin(angle) * apexToPoint.Norm());
	}

	Distance(params: number[], point: Vector): number {
		let apex = ConeFitting.GetApex(params);
		let axis = ConeFitting.GetAxis(params);
		let angle = ConeFitting.GetAngle(params);
		let delta = point.Minus(apex);
		if (ConeFitting.IsBeyondApex(delta, axis, angle)) {
			return delta.Norm();
		}
		else {
			return (Math.cos(angle) * delta.Cross(axis).Norm()) - (Math.sin(angle) * delta.Dot(axis));
		}
	}

	DistanceGradient(params: number[], point: Vector): number[] {
		let apex = ConeFitting.GetApex(params);
		let theta = ConeFitting.GetTheta(params);
		let phi = ConeFitting.GetPhi(params);
		let zaxis = Geometry.GetZAxis(theta, phi);
		let angle = ConeFitting.GetAngle(params);
		let delta = point.Minus(apex);

		if (ConeFitting.IsBeyondApex(delta, zaxis, angle)) {
			delta.Normalized();
			let result = delta.Times(-1).Flatten();
			result.push(0);
			result.push(0);
			result.push(0);
			return result;
		}
		else {
			let xaxis = Geometry.GetXAxis(theta, phi);
			let yaxis = Geometry.GetYAxis(theta, phi);
			let ca = Math.cos(angle);
			let sa = Math.sin(angle);
			let ss = delta.Dot(zaxis);
			let cc = delta.Cross(zaxis).Norm();
			let ff = (ca * ss / cc) + sa;

			let ddtheta = - ff * delta.Dot(xaxis);
			let ddphi = - Math.sin(theta) * ff * delta.Dot(yaxis);
			let ddapex = delta.Times(-ca / cc).Plus(zaxis.Times(ff));
			let ddangle = (- sa * cc) - (ca * ss);

			let result = ddapex.Flatten();
			result.push(ddtheta);
			result.push(ddphi);
			result.push(ddangle);
			return result;
		}
	}

	NotifyNewSolution(params: number[]) {
		this.cone.apex = ConeFitting.GetApex(params);
		this.cone.axis = ConeFitting.GetAxis(params);
		this.cone.angle = ConeFitting.GetAngle(params);
	}
}