class Sphere extends Shape {
    constructor(public center: Vector, public radius: number) {
        super('Sphere');
    }

	GetGeometry(): Properties {
		let geometry = new Properties();
		geometry.PushVector('Center', this.center);
		geometry.Push('Radius', this.radius);
		return geometry;
	};

	SetGeometry(geometry: Properties) {
		this.center = geometry.GetAsVector('Center');
		this.radius = geometry.GetAsFloat('Radius');
		if (this.center == null || this.radius == null) {
			return false;
		}
		this.mesh = null;
		return true;
	};

	GetBoundingBox(): BoundingBox {
		var size = new Vector([1, 1, 1]).Times(2 * this.radius);
		var bb = new BoundingBox();
		bb.Set(this.center, size);
		return bb;
	}

	GetWorldToInnerBaseMatrix(): Matrix {
		var matrix = Matrix.Identity(4);
		for (var index = 0; index < 3; index++) {
			matrix.SetValue(index, 3, -this.center.Get(index));
		}
		return matrix;
	}

	GetInnerBaseToWorldMatrix(): Matrix {
		var matrix = Matrix.Identity(4);
		for (var index = 0; index < 3; index++) {
			matrix.SetValue(index, 3, this.center.Get(index));
		}
		return matrix;
	}

	ComputeMesh(sampling: number) : Mesh {
		var halfSampling = Math.ceil(sampling / 2);
		var points = new PointCloud();
		points.Reserve(sampling * halfSampling + 2);

		points.PushPoint(this.center.Plus(new Vector([0, 0, 1])));
		points.PushPoint(this.center.Plus(new Vector([0, 0, -1])));
		//Spherical coordinates
		for (var jj = 0; jj < halfSampling; jj++) {
			for (var ii = 0; ii < sampling; ii++) {
				var phi = ((jj + 1) * Math.PI) / (halfSampling + 1);
				var theta = 2.0 * ii * Math.PI / sampling;
				var radial = new Vector([
					Math.cos(theta) * Math.sin(phi),
					Math.sin(theta) * Math.sin(phi),
					Math.cos(phi)
				]);
				points.PushPoint(this.center.Plus(radial.Times(this.radius)));
			}
		}

		var mesh = new Mesh(points);
		mesh.Reserve(2 * sampling + (halfSampling - 1) * sampling);

		//North pole
		var northShift = 2;
		for (var ii = 0; ii < sampling; ii++) {
			mesh.PushFace([ii + northShift, 0, ((ii + 1) % sampling) + northShift]);
		}
		//South pole
		var southShift = (halfSampling - 1) * sampling + northShift;
		for (var ii = 0; ii < sampling; ii++) {
			mesh.PushFace([1, ii + southShift, ((ii + 1) % sampling) + southShift]);
		}
		//Strips
		for (var jj = 0; (jj + 1) < halfSampling; jj++) {
			var ja = jj * sampling;
			var jb = (jj + 1) * sampling;
			for (var ii = 0; ii < sampling; ii++) {
				var ia = ii;
				var ib = (ii + 1) % sampling;
				//            [ia]        [ib]
				//   [ja] ---- aa -------- ba
				//             |           |
				//   [jb] ---- ab -------- bb
				var aa = ia + ja + northShift;
				var ab = ia + jb + northShift;
				var bb = ib + jb + northShift;
				var ba = ib + ja + northShift;
				mesh.PushFace([ab, aa, ba]);
				mesh.PushFace([ab, ba, bb]);
			}
		}
		mesh.ComputeNormals();

		return mesh;
	}

	RayIntersection(ray: Ray) : number[] {
		var worldToBase = this.GetWorldToInnerBaseMatrix();
		var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
		var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));

		//Solve [t] : sqrnorm(innerFrom[i]+t*innerDir[i])=radius
		var aa = 0;
		var bb = 0;
		var cc = 0;
		for (var index = 0; index < 3; index++) {
			aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
			bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
			cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
		}

		//Solve [t] : aa.t^2 + bb.t + cc = radius
		cc -= this.radius * this.radius;
		var dd = bb * bb - 4.0 * aa * cc;
		var tt = [];
		if (Math.abs(dd) < 0.0000001) {
			tt.push(-bb / 2.0 * aa);
		}
		else if (dd > 0.) {
			tt.push((-bb + Math.sqrt(dd)) / (2.0 * aa));
			tt.push((-bb - Math.sqrt(dd)) / (2.0 * aa));
		}

		return tt;
	}

	Distance(point: Vector): number {
		return Math.abs(point.Minus(this.center).Norm() - this.radius);
	}
}