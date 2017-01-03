class Cylinder extends Shape {
    constructor(public center: Vector, public axis: Vector, public radius: number, public height: number) {
        super('Cylinder');
    }

	GetGeometry(): Properties {
		let geometry = new Properties();
		geometry.PushVector('Center', this.center);
		geometry.PushVector('Axis', this.axis);
		geometry.Push('Radius', this.radius);
		geometry.Push('Height', this.height);
		return geometry;
	}

	SetGeometry(geometry: Properties) : boolean {
		this.center = geometry.GetAsVector('Center');
		this.axis = geometry.GetAsVector('Axis');
		this.radius = geometry.GetAsFloat('Radius');
		this.height = geometry.GetAsFloat('Height');
		if (this.center == null || this.axis == null || this.radius == null || this.height == null) {
			return false;
		}
		this.axis = this.axis.Normalized();
		this.mesh = null;
		this.boundingbox = null;
		return true;
	}

	ComputeBoundingBox(): BoundingBox {
		var size = new Vector([
			2 * Math.abs(0.5 * this.height * this.axis.Get(0) + this.radius * Math.sin(Math.acos(this.axis.Get(0)))),
			2 * Math.abs(0.5 * this.height * this.axis.Get(1) + this.radius * Math.sin(Math.acos(this.axis.Get(1)))),
			2 * Math.abs(0.5 * this.height * this.axis.Get(2) + this.radius * Math.sin(Math.acos(this.axis.Get(2))))
		]);
		var bb = new BoundingBox();
		bb.Set(this.center, size);
		return bb;
	}

	GetWorldToInnerBaseMatrix(): Matrix {
		var translation = Matrix.Identity(4);
		var basechange = Matrix.Identity(4);
		var xx = this.axis.GetOrthogonnal();
		var yy = this.axis.Cross(xx).Normalized();
		for (var index = 0; index < 3; index++) {
			basechange.SetValue(0, index, xx.Get(index));
			basechange.SetValue(1, index, yy.Get(index));
			basechange.SetValue(2, index, this.axis.Get(index));
			translation.SetValue(index, 3, -this.center.Get(index));
		}
		return basechange.Multiply(translation);
	}

	ComputeMesh(sampling:number) : Mesh {
		var points = new PointCloud();
		points.Reserve(4 * sampling + 2);

		var xx = this.axis.GetOrthogonnal();
		var yy = this.axis.Cross(xx).Normalized();
		var radials = [];
		for (var ii = 0; ii < sampling; ii++) {
			var phi = 2.0 * ii * Math.PI / sampling;
			var c = Math.cos(phi);
			var s = Math.sin(phi);
			var radial = xx.Times(c).Plus(yy.Times(s));
			radials.push(radial.Times(this.radius));
		}
		var northCenter = this.center.Plus(this.axis.Times(this.height / 2));
		var southCenter = this.center.Minus(this.axis.Times(this.height / 2));
		points.PushPoint(northCenter);
		points.PushPoint(southCenter);
		//North face
		for (var ii = 0; ii < radials.length; ii++) {
			points.PushPoint(northCenter.Plus(radials[ii]));
		}
		//South face
		for (var ii = 0; ii < radials.length; ii++) {
			points.PushPoint(southCenter.Plus(radials[ii]));
		}
		//Double points to separate normals
		for (var ii = 0; ii < radials.length; ii++) {
			points.PushPoint(northCenter.Plus(radials[ii]));
		}
		for (var ii = 0; ii < radials.length; ii++) {
			points.PushPoint(southCenter.Plus(radials[ii]));
		}

		var mesh = new Mesh(points);
		mesh.Reserve(4 * sampling);
		//North pole
		var northShift = 2;
		for (var ii = 0; ii < sampling; ii++) {
			mesh.PushFace([0, ii + northShift, ((ii + 1) % sampling) + northShift]);
		}
		//South pole
		var southShift = sampling + 2;
		for (var ii = 0; ii < sampling; ii++) {
			mesh.PushFace([ii + southShift, 1, ((ii + 1) % sampling) + southShift]);
		}
		//Strips
		var shift = southShift + sampling;
		for (var ii = 0; ii < sampling; ii++) {
			var ia = ii;
			var ib = (ii + 1) % sampling;
			var ja = 0;
			var jb = sampling;
			var aa = ia + ja + shift;
			var ab = ia + jb + shift;
			var bb = ib + jb + shift;
			var ba = ib + ja + shift;
			mesh.PushFace([aa, ab, ba]);
			mesh.PushFace([ba, ab, bb]);
		}
		mesh.ComputeNormals();
		return mesh;
	}

	RayIntersection(ray: Ray) : number[] {
		var worldToBase = this.GetWorldToInnerBaseMatrix();
		var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
		var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));

		//haveing p[t] = (innerFrom[i]+t*innerDir[i])
		//Solve p[t].x^2+p[t].y^2=radius for each i<3
		var aa = 0;
		var bb = 0;
		var cc = 0;
		for (var index = 0; index < 2; index++) {
			aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
			bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
			cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
		}

		//Solve [t] : aa.t^2 + bb.t + cc = radius
		var halfHeight = this.height / 2.0;
		var sqrRadius = this.radius * this.radius;
		cc -= sqrRadius;
		var dd = bb * bb - 4.0 * aa * cc;
		var tt = [];
		function acceptValue(value) {
			var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
			if (Math.abs(point.Get(2)) <= halfHeight) {
				tt.push(value);
			}
		}

		if (Math.abs(dd) < 0.0000001) {
			acceptValue(-bb / 2.0 * aa);
		}
		else if (dd > 0.) {
			acceptValue((-bb + Math.sqrt(dd)) / (2.0 * aa));
			acceptValue((-bb - Math.sqrt(dd)) / (2.0 * aa));
		}

		if (tt.length < 2 && Math.abs(innerDir.GetValue(2, 0)) > 0.000001) {
			function acceptDiskValue(value) {
				var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
				if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= sqrRadius) {
					tt.push(value);
				}
			}
			//test bounding disks
			//solve [t] : p[t].z = halfHeight
			acceptDiskValue((halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0));
			acceptDiskValue((-halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0));
		}
		return tt;
	}

	Distance(point: Vector): number {
		var delta = point.Minus(this.center);
		var hyp = delta.SqrNorm();
		var adj = this.axis.Dot(delta);
		var op = Math.sqrt(hyp - (adj * adj));

		return Math.abs(op - this.radius);
	}

	ComputeBounds(points: number[], cloud: PointCloud) : void {
		var min = 0;
		var max = 0;
		for (var ii = 0; ii < points.length; ii++) {
			var d = cloud.GetPoint(points[ii]).Minus(this.center).Dot(this.axis);
			if (ii == 0 || d < min) {
				min = d;
			}
			if (ii == 0 || d > max) {
				max = d;
			}
		}
		var d = 0.5 * (min + max);
		this.center = this.center.Plus(this.axis.Times(d));
		this.height = max - min;
	}
}