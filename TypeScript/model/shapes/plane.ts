class Plane extends Shape {
    constructor(public center: Vector, public normal: Vector, public patchRadius: number, owner: CADGroup = null) {
        super(NameProvider.GetName('Plane'), owner);
    }

	private Updaye
	GetGeometry(): Properties {
		let self = this
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', this.center, false, self.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Normal', this.normal, true, self.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Patch Radius', this.patchRadius, self.GeometryChangeHandler((value) => self.patchRadius = value)));
		return geometry;
	}

	ComputeMesh(sampling: number, onDone: CADNodeHandler): Mesh {
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

		let self = this;
		mesh.ComputeNormals(mesh => { if (onDone) { onDone(self); } return true; });

		return mesh;
	}

	Distance(point: Vector): number {
		return Math.abs(point.Minus(this.center).Dot(this.normal));
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

	RayIntersection(ray: Ray): Picking {
		let worldToBase = this.GetWorldToInnerBaseMatrix();
		let innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
		let innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));

		//solve [t] : p[t].z = 0
		let result = new Picking(this);
		let tt = -innerFrom.GetValue(2, 0) / innerDir.GetValue(2, 0);
		let point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(tt));
		if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (this.patchRadius * this.patchRadius)) {
			result.Add(tt);
		}
		return result;
	}

	ComputeBounds(points: number[], cloud: PointCloud): void {
		this.center = new Vector([0, 0, 0]);
		for (let ii = 0; ii < points.length; ii++) {
			this.center = this.center.Plus(cloud.GetPoint(points[ii]));
		}
		this.center = this.center.Times(1.0 / points.length);
		this.patchRadius = 0;
		for (let ii = 0; ii < points.length; ii++) {
			let d = cloud.GetPoint(points[ii]).Minus(this.center).SqrNorm();
			if (d > this.patchRadius) {
				this.patchRadius = d;
			}
		}
		this.patchRadius = Math.sqrt(this.patchRadius);
	}
}