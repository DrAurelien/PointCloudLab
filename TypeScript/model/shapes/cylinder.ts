class Cylinder extends Shape {
    constructor(public center: Vector, public axis: Vector, public radius: number, public height: number, owner: CADGroup = null) {
        super(NameProvider.GetName('Cylinder'), owner);
    }

	GetGeometry(): Properties {
		let self = this;
		let geometry = new Properties();
		geometry.Push(new VectorProperty('Center', this.center, false, self.GeometryChangeHandler()));
		geometry.Push(new VectorProperty('Axis', this.axis, true, self.GeometryChangeHandler()));
		geometry.Push(new NumberProperty('Radius', this.radius, self.GeometryChangeHandler((value) => this.radius = value)));
		geometry.Push(new NumberProperty('Height', this.height, self.GeometryChangeHandler((value) => this.height = value)));
		return geometry;
	}

	ComputeBoundingBox(): BoundingBox {
		let size = new Vector([
			2 * Math.abs(0.5 * this.height * this.axis.Get(0) + this.radius * Math.sin(Math.acos(this.axis.Get(0)))),
			2 * Math.abs(0.5 * this.height * this.axis.Get(1) + this.radius * Math.sin(Math.acos(this.axis.Get(1)))),
			2 * Math.abs(0.5 * this.height * this.axis.Get(2) + this.radius * Math.sin(Math.acos(this.axis.Get(2))))
		]);
		let bb = new BoundingBox();
		bb.Set(this.center, size);
		return bb;
	}

	Rotate(rotation: Matrix) {
		let a = rotation.Multiply(Matrix.FromVector(this.axis));
		this.axis = Matrix.ToVector(a);
		this.Invalidate();
	}

	Translate(translation: Vector) {
		this.center = this.center.Plus(translation);
		this.Invalidate();
	}

	Scale(scale: number) {
		this.radius *= scale;
		this.height *= scale;
		this.Invalidate();
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

	ComputeMesh(sampling: number, onDone: CADNodeHandler) : Mesh {
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

		let self = this;
		mesh.ComputeNormals(mesh => { if (onDone) { onDone(self); } return true; });

		return mesh;
	}

	RayIntersection(ray: Ray) : Picking {
		let worldToBase = this.GetWorldToInnerBaseMatrix();
		let innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
		let innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));

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
		let result = new Picking(this);
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
			function acceptDiskValue(value) {
				let point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
				if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= sqrRadius) {
					result.Add(value);
				}
			}
			//test bounding disks
			//solve [t] : p[t].z = halfHeight
			acceptDiskValue((halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0));
			acceptDiskValue((-halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0));
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

	ComputeBounds(points: number[], cloud: PointCloud) : void {
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
}