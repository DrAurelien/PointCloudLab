class Plane extends Shape {
    constructor(public center: Vector, public normal: Vector, public patchRadius: number, owner: CADGroup = null) {
        super(NameProvider.GetName('Plane'), owner);
    }

	GetGeometry(): Properties {
		let geometry = new Properties();
		geometry.PushVector('Center', this.center);
		geometry.PushVector('Normal', this.normal);
		geometry.Push('Patch Radius', this.patchRadius);
		return geometry;
	}

	SetGeometry(geometry: Properties) : boolean {

		this.center = geometry.GetAsVector('Center');
		this.normal = geometry.GetAsVector('Normal');
		this.patchRadius = geometry.GetAsFloat('Patch Radius');
		if (this.center == null || this.normal == null || this.patchRadius == null) {
			return false;
		}
		this.normal = this.normal.Normalized();
		this.mesh = null;
		this.boundingbox = null;
		return true;
	}

	ComputeMesh(sampling: number): Mesh {
		var points = new PointCloud();
		points.Reserve(sampling + 1);

		var xx = this.normal.GetOrthogonnal();
		var yy = this.normal.Cross(xx).Normalized();
		for (var ii = 0; ii < sampling; ii++) {
			var phi = 2.0 * ii * Math.PI / sampling;
			var c = Math.cos(phi);
			var s = Math.sin(phi);
			var radiusVect = xx.Times(c).Plus(yy.Times(s));
			points.PushPoint(this.center.Plus(radiusVect.Times(this.patchRadius)));
		}
		points.PushPoint(this.center);

		var mesh = new Mesh(points);
		mesh.Reserve(sampling);
		for (var ii = 0; ii < sampling; ii++) {
			mesh.PushFace([ii, sampling, (ii + 1) % sampling]);
		}
		mesh.ComputeNormals();
		return mesh;
	}

	Distance(point: Vector): number {
		return Math.abs(point.Minus(this.center).Dot(this.normal));
	}

	ComputeBoundingBox(): BoundingBox {
		var size = new Vector([
			2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(0)))),
			2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(1)))),
			2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(2))))
		]);
		var bb = new BoundingBox();
		bb.Set(this.center, size);
		return bb;
	}

	GetWorldToInnerBaseMatrix(): Matrix {
		var translation = Matrix.Identity(4);
		var basechange = Matrix.Identity(4);
		var xx = this.normal.GetOrthogonnal();
		var yy = this.normal.Cross(xx).Normalized();
		for (var index = 0; index < 3; index++) {
			basechange.SetValue(0, index, xx.Get(index));
			basechange.SetValue(1, index, yy.Get(index));
			basechange.SetValue(2, index, this.normal.Get(index));
			translation.SetValue(index, 3, -this.center.Get(index));
		}
		return basechange.Multiply(translation);
	}

	RayIntersections(ray: Ray): number[] {
		var worldToBase = this.GetWorldToInnerBaseMatrix();
		var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
		var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));

		//solve [t] : p[t].z = 0
		var result = [];
		var tt = -innerFrom.GetValue(2, 0) / innerDir.GetValue(2, 0);
		var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(tt));
		if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (this.patchRadius * this.patchRadius)) {
			result.push(tt);
		}
		return result;
	}

	ComputeBounds(points: number[], cloud: PointCloud): void {
		this.center = new Vector([0, 0, 0]);
		for (var ii = 0; ii < points.length; ii++) {
			this.center = this.center.Plus(cloud.GetPoint(points[ii]));
		}
		this.center = this.center.Times(1.0 / points.length);
		this.patchRadius = 0;
		for (var ii = 0; ii < points.length; ii++) {
			var d = cloud.GetPoint(points[ii]).Minus(this.center).SqrNorm();
			if (d > this.patchRadius) {
				this.patchRadius = d;
			}
		}
		this.patchRadius = Math.sqrt(this.patchRadius);
	}
}