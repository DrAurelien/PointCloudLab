﻿class Torus extends Shape {
    constructor(public center: Vector, public axis: Vector, public greatRadius: number, public smallRadius: number) {
        super('Torus');
    }

	GetGeometry(): Object {
		return {
			Center: this.MakeVectorProperty(this.center),
			Axis: this.MakeVectorProperty(this.axis),
			'Great Radius': this.greatRadius,
			'Small Radius': this.smallRadius
		};
	}

	SetGeometry(geometry: Object) {
		if ('Center' in geometry) {
			this.center = this.ParseVectorProperty(geometry.Center);
		}

		if ('Axis' in geometry) {
			this.axis = this.ParseVectorProperty(geometry.Axis);
		}

		if ('Great Radius' in geometry) {
			this.greatRadius = this.ParseRealProperty(geometry['Great Radius']);
		}

		if ('Small Radius' in geometry) {
			this.smallRadius = this.ParseRealProperty(geometry['Small Radius']);
		}

		if (this.center == null || this.axis == null || this.greatRadius == null || this.smallRadius == null) {
			return false;
		}

		this.axis = this.axis.Normalized();
		this.mesh = null;

		return true;
	}

	ComputeMesh(sampling: number) : Mesh {
		var points = new PointCloud();
		points.Reserve(sampling * sampling);

		var xx = this.axis.GetOrthogonnal();
		var yy = this.axis.Cross(xx).Normalized();
		for (var ii = 0; ii < sampling; ii++) {
			var phi = 2.0 * ii * Math.PI / sampling;
			var c = Math.cos(phi);
			var s = Math.sin(phi);
			var radiusVect = xx.Times(c).Plus(yy.Times(s));
			var faceCenter = this.center.Plus(radiusVect.Times(this.greatRadius));
			for (var jj = 0; jj < sampling; jj++) {
				var theta = 2.0 * jj * Math.PI / sampling;
				var ct = Math.cos(theta);
				var st = Math.sin(theta);
				points.PushPoint(faceCenter.Plus(radiusVect.Times(this.smallRadius * ct)).Plus(this.axis.Times(this.smallRadius * st)));
			}
		}

		var mesh = new Mesh(points);
		mesh.Reserve(2 * sampling * sampling);
		for (var ii = 0; ii < sampling; ii++) {
			var ia = ii * sampling;
			var ib = ((ii + 1) % sampling) * sampling;
			for (var jj = 0; jj < sampling; jj++) {
				var ja = jj;
				var jb = ((jj + 1) % sampling);
				//            [ia]        [ib]
				//   [ja] ---- aa -------- ba
				//             |           |
				//   [jb] ---- ab -------- bb
				var aa = ia + ja;
				var ab = ia + jb; s
				var bb = ib + jb;
				var ba = ib + ja;
				mesh.PushFace([ab, aa, ba]);
				mesh.PushFace([ab, ba, bb]);
			}
		}
		mesh.ComputeNormals();
		return mesh;
	}

	GetBoundingBox(): BoundingBox {
		var proj = new Vector([this.axis.Get(0), this.axis.Get(1)]);
		var size = new Vector([
			Math.sqrt(1 - (this.axis.Get(0) * this.axis.Get(0))) * this.greatRadius + this.smallRadius,
			Math.sqrt(1 - (this.axis.Get(1) * this.axis.Get(1))) * this.greatRadius + this.smallRadius,
			proj.Norm() * this.greatRadius + this.smallRadius
		]);
		var bb = new BoundingBox();
		bb.Set(this.center, size.Times(2.0));
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

	RayIntersection(ray: Ray): number[] {
		var worldToBase = this.GetWorldToInnerBaseMatrix();
		var innerFromMatrix = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
		var innerDirMatrix = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));

		let innerDir = new Vector([innerDirMatrix.GetValue(0, 0), innerDirMatrix.GetValue(1, 0), innerDirMatrix.GetValue(2, 0)]);
		let innerFrom = new Vector([innerFromMatrix.GetValue(0, 0), innerFromMatrix.GetValue(1, 0), innerFromMatrix.GetValue(2, 0)]);

		var grr = this.greatRadius * this.greatRadius;
		var srr = this.smallRadius * this.smallRadius;

		var alpha = innerDir.Dot(innerDir);
		var beta = 2.0 * innerDir.Dot(innerFrom);
		var gamma = innerFrom.Dot(innerFrom) + grr - srr;

		innerDir.Set(2, 0);
		innerFrom.Set(2, 0);

		var eta = innerDir.Dot(innerDir);
		var mu = 2.0 * innerDir.Dot(innerFrom);
		var nu = innerFrom.Dot(innerFrom);

		//Quartic defining the equation of the torus
		var quartic = new Polynomial([
			(gamma * gamma) - (4.0 * grr * nu),
			(2.0 * beta * gamma) - (4.0 * grr * mu),
			(beta * beta) + (2.0 * alpha * gamma) - (4.0 * grr * eta),
			2.0 * alpha * beta,
			alpha * alpha
		]);

		return quartic.FindRealRoots(this.center.Minus(ray.from).Dot(ray.dir));
	}
}