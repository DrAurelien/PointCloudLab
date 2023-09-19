/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />


class Torus extends Shape {
	constructor(public center: Vector, public axis: Vector, public greatRadius: number, public smallRadius: number) {
		super();
	}

	ComputeMesh(sampling: number, onDone: Function): Mesh {
		let points = new PointCloud();
		points.Reserve(sampling * sampling);

		let xx = this.axis.GetOrthogonnal();
		let yy = this.axis.Cross(xx).Normalized();
		for (let ii = 0; ii < sampling; ii++) {
			let phi = 2.0 * ii * Math.PI / sampling;
			let c = Math.cos(phi);
			let s = Math.sin(phi);
			let radiusVect = xx.Times(c).Plus(yy.Times(s));
			let faceCenter = this.center.Plus(radiusVect.Times(this.greatRadius));
			for (let jj = 0; jj < sampling; jj++) {
				let theta = 2.0 * jj * Math.PI / sampling;
				let ct = Math.cos(theta);
				let st = Math.sin(theta);
				points.PushPoint(faceCenter.Plus(radiusVect.Times(this.smallRadius * ct)).Plus(this.axis.Times(this.smallRadius * st)));
			}
		}

		let mesh = new Mesh(points);
		mesh.Reserve(2 * sampling * sampling);
		for (let ii = 0; ii < sampling; ii++) {
			let ia = ii * sampling;
			let ib = ((ii + 1) % sampling) * sampling;
			for (let jj = 0; jj < sampling; jj++) {
				let ja = jj;
				let jb = ((jj + 1) % sampling);
				//            [ia]        [ib]
				//   [ja] ---- aa -------- ba
				//             |           |
				//   [jb] ---- ab -------- bb
				let aa = ia + ja;
				let ab = ia + jb;
				let bb = ib + jb;
				let ba = ib + ja;
				mesh.PushFace([ab, aa, ba]);
				mesh.PushFace([ab, ba, bb]);
			}
		}

		mesh.ComputeNormals(onDone);

		return mesh;
	}

	ComputeBoundingBox(): BoundingBox {
		let proj = new Vector([this.axis.Get(0), this.axis.Get(1)]);
		let size = new Vector([
			Math.sqrt(1 - (this.axis.Get(0) * this.axis.Get(0))) * this.greatRadius + this.smallRadius,
			Math.sqrt(1 - (this.axis.Get(1) * this.axis.Get(1))) * this.greatRadius + this.smallRadius,
			proj.Norm() * this.greatRadius + this.smallRadius
		]);
		let bb = new BoundingBox();
		bb.Set(this.center, size.Times(2.0));
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

	RayIntersection(ray: Ray, wrapper: Pickable): Picking {
		let worldToBase = this.GetWorldToInnerBaseMatrix();
		let innerFromMatrix = worldToBase.Multiply(new HomogeneousPoint(ray.from));
		let innerDirMatrix = worldToBase.Multiply(new HomogeneousVector(ray.dir));

		let innerDir = new Vector([innerDirMatrix.GetValue(0, 0), innerDirMatrix.GetValue(1, 0), innerDirMatrix.GetValue(2, 0)]);
		let innerFrom = new Vector([innerFromMatrix.GetValue(0, 0), innerFromMatrix.GetValue(1, 0), innerFromMatrix.GetValue(2, 0)]);

		let grr = this.greatRadius * this.greatRadius;
		let srr = this.smallRadius * this.smallRadius;

		let alpha = innerDir.Dot(innerDir);
		let beta = 2.0 * innerDir.Dot(innerFrom);
		let gamma = innerFrom.Dot(innerFrom) + grr - srr;

		innerDir.Set(2, 0);
		innerFrom.Set(2, 0);

		let eta = innerDir.Dot(innerDir);
		let mu = 2.0 * innerDir.Dot(innerFrom);
		let nu = innerFrom.Dot(innerFrom);

		//Quartic defining the equation of the torus
		let quartic = new Polynomial([
			(gamma * gamma) - (4.0 * grr * nu),
			(2.0 * beta * gamma) - (4.0 * grr * mu),
			(beta * beta) + (2.0 * alpha * gamma) - (4.0 * grr * eta),
			2.0 * alpha * beta,
			alpha * alpha
		]);

		let init = this.GetBoundingBox().RayIntersection(ray);
		let roots = quartic.FindRealRoots(init.distance);
		let result = new Picking(wrapper);
		for (let index = 0; index < roots.length; index++) {
			result.Add(roots[index]);
		}
		return result;
	}

	Distance(point: Vector): number {
		let d = point.Minus(this.center);
		let aa = this.greatRadius - this.axis.Cross(d).Norm();
		let bb = this.axis.Dot(d);
		return Math.abs(Math.sqrt(aa * aa + bb * bb) - this.smallRadius);
	}

	ApplyTransform(transform: Transform) {
		this.axis = transform.TransformVector(this.axis).Normalized();
		this.center = transform.TransformPoint(this.center);
		this.greatRadius *= transform.scalefactor;
		this.smallRadius *= transform.scalefactor;
	}

	ComputeBounds(points: PointSet) {
		//NA
	}

	static InitialGuessForFitting(cloud: PointCloud): Torus {
		const nbSeeds = 32;
		let seeds = cloud.Sample(nbSeeds);

		let split : PointSubCloud[] = [];
		let nbNeighours = Math.max(Math.floor(cloud.Size()/seeds.Size()), 150);
		for(let index=0; index<seeds.Size(); index++)
		{
			let neighbours = cloud.KNearestNeighbours(seeds.GetPoint(index), nbNeighours);
			split.push(neighbours.AsSubCloud());
		};

		// Fit a rough cylinder in each octant
		let cylinders : Cylinder[] = []
		for(let index=0; index<split.length; index++)
		{
			if(split[index].Size() < 10)
				continue;
			let localCloud = split[index].ToPointCloud();
			let localCylinder = Cylinder.InitialGuessForFitting(localCloud);
			localCylinder.ComputeBounds(localCloud);
			cylinders.push(localCylinder);
		}

		if(cylinders.length < 3)
			return null;

		// Guess the parameters from the rough cylinders
		let cylindersAxes = new PointCloud;
		let smallRadius = 0;
		for(let index=0; index<cylinders.length; index++)
		{
			cylindersAxes.PushPoint(cylinders[index].axis);
			smallRadius += cylinders[index].radius;
		}
		smallRadius /= cylinders.length;
		let axis = Geometry.PlaneFitting(cylindersAxes).normal;
		let cylindersPlanes : PlaneFittingResult[] = [];
		let cylindersCenter = new Vector([0, 0, 0]);
		for(let index=0; index<cylinders.length; index++)
		{
			cylindersPlanes.push(new PlaneFittingResult(cylinders[index].center, cylinders[index].axis));
			cylindersCenter.Add(cylinders[index].center.Times(1.0 / cylinders.length));
		}
		cylindersPlanes.push(new PlaneFittingResult(cylindersCenter, axis));
		let center = Geometry.PlanesIntersection(cylindersPlanes);
		let greatRadius = 0;
		for( let index=0; index<cylinders.length; index++)
			greatRadius += center.Minus(cylinders[index].center).Norm();
		greatRadius /= cylinders.length;
		return new Torus(center, axis, greatRadius, smallRadius);
	}

	FitToPoints(points: PointSet): Process {
		let lsFitting = new LeastSquaresFitting(
			TorusFitting.Parameters(this.center, this.axis, this.smallRadius, this.greatRadius),
			new TorusFitting(this),
			points,
			'Computing best fitting torus');
		lsFitting.Start();
		return lsFitting;
	}
}

class TorusFitting implements LeastSquaresEvaluable<Vector> {
	constructor(private torus: Torus) {
	}

	static Parameters(center: Vector, axis : Vector, smallRadius: number, greatRadius): number[] {
		let spherical = Vector.CartesianToSpherical(axis).Normalized();
		let params = center.coordinates.slice();
		params.push(spherical.Get(0));
		params.push(spherical.Get(1));
		params.push(smallRadius);
		params.push(greatRadius);
		return params;
	}

	static GetCenter(params: number[]): Vector {
		return new Vector(params.slice(0, 3));
	}

	static GetPhi(params: number[]): number {
		return params[3];
	}

	static GetTheta(params: number[]): number {
		return params[4];
	}
	
	static GetAxis(params: number[]): Vector {
		let spherical = Vector.Spherical(
			TorusFitting.GetPhi(params),
			TorusFitting.GetTheta(params),
			1);
		return Vector.SphericalToCartesian(spherical);
	}

	static GetSmallRadius(params: number[]): number {
		return params[5];
	}

	static GetGreatRadius(params: number[]): number {
		return params[6];
	}

	Distance(params: number[], point: Vector): number {
		let axis = TorusFitting.GetAxis(params).Normalized();
		let delta = point.Minus(TorusFitting.GetCenter(params));
		let vect2D =  new Vector([
			TorusFitting.GetGreatRadius(params) - axis.Cross(delta).Norm(),
			axis.Dot(delta)
		]);
		return vect2D.Norm() - TorusFitting.GetSmallRadius(params);
	} 

	DistanceGradient(params: number[], point: Vector): number[] {
		let delta = point.Minus(TorusFitting.GetCenter(params));
		let theta = TorusFitting.GetTheta(params);
		let phi = TorusFitting.GetPhi(params);
		let radius = TorusFitting.GetGreatRadius(params);

		let spherical = Vector.Spherical(phi, theta, 1);
		let uu = Vector.SphericalToCartesian(spherical, SphericalRepresentation.AzimuthColatitude);
		let vv = Vector.SphericalToCartesian(spherical, SphericalRepresentation.AzimuthLatitude);
		let ww = uu.Cross(vv);
		let dd = delta.Cross(uu).Norm();

		let ss = Math.sqrt(delta.SqrNorm() + (radius * radius) - (2. * radius * dd));

		let dTheta = radius * delta.Dot(uu) * delta.Dot(vv) / (dd * ss);
		let dPhi = radius * Math.sin(theta) * delta.Dot(uu) * delta.Dot(ww) / (dd * ss);
		let dRadius = (radius - dd) / ss;
		let dCenter = delta.Minus(
			delta.Minus(uu.Times(delta.Dot(uu))).Times(radius/dd)
			).Times(-1./ss);

		let gradient = dCenter.coordinates.slice();
		gradient.push(dPhi);
		gradient.push(dTheta);
		gradient.push(-1);
		gradient.push(dRadius);
		return gradient;
	}

	NotifyNewSolution(params: number[]) {
		this.torus.center = TorusFitting.GetCenter(params);
		this.torus.axis = TorusFitting.GetAxis(params).Normalized();
		this.torus.smallRadius = TorusFitting.GetSmallRadius(params);
		this.torus.greatRadius = TorusFitting.GetGreatRadius(params);
	}
}