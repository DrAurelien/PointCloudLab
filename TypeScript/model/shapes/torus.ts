class Torus extends Shape {
    constructor(public center: Vector, public axis: Vector, public greatRadius: number, public smallRadius: number, owner: CADGroup=null) {
        super(NameProvider.GetName('Torus'), owner);
    }

	GetGeometry(): Properties {
		let geometry = new Properties();
		geometry.PushVector('Center', this.center);
		geometry.PushVector('Axis', this.axis);
		geometry.Push('Great Radius', this.greatRadius);
		geometry.Push('Small Radius', this.smallRadius);
		return geometry;
	}

	SetGeometry(geometry: Properties) : boolean {
		this.center = geometry.GetAsVector('Center');
		this.axis = geometry.GetAsVector('Axis');
		this.greatRadius = geometry.GetAsFloat('Great Radius');
		this.smallRadius = geometry.GetAsFloat('Small Radius');
		if (this.center == null || this.axis == null || this.greatRadius == null || this.smallRadius == null) {
			return false;
		}
		this.axis = this.axis.Normalized();
		this.mesh = null;
		this.boundingbox = null;
		return true;
	}

	ComputeMesh(sampling: number) : Mesh {
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
		mesh.ComputeNormals();
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

	RayIntersection(ray: Ray): Picking {
		let worldToBase = this.GetWorldToInnerBaseMatrix();
		let innerFromMatrix = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
		let innerDirMatrix = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));

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

		let roots = quartic.FindRealRoots(this.center.Minus(ray.from).Dot(ray.dir));
		let result = new Picking(this);
		for (let index = 0; index < roots.length; index++) {
			result.Add(roots[index]);
		}
		return result;
	}

	Distance(point: Vector): number {
		//TODO
		return 0;
	}
}