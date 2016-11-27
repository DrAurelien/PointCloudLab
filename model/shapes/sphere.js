//Sphere class
function Sphere(center, radius)
{
	this.center = center;
	this.radius = radius;
	Shape.call(this, 'Sphere');
}

//Inheritance
Sphere.prototype = Object.create(Shape.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.GetGeometry = function()
{
	return {
		Center : this.MakeVectorProperty(this.center),
		Radius : this.radius
	};
};

Sphere.prototype.SetGeometry= function(geometry)
{
	if('Center' in geometry)
	{
		this.center = this.ParseVectorProperty(geometry.Center);
	}

	if('Radius' in geometry)
	{
		this.radius = this.ParseRealProperty(geometry.Radius);
	}
	
	if(this.center == null || this.radius == null)
	{
		return false;
	}
	return true;
};

Sphere.prototype.GetBoundingBox = function()
{
	var size = new Vector([1, 1, 1]).Times(2*this.radius);
	var bb = new BoundingBox();
	bb.Set(this.center, size);
	return bb;
}

Sphere.prototype.GetWorldToInnerBaseMatrix = function()
{
	var matrix = IdentityMatrix(4);
	for(var index=0; index<3; index++)
	{
		matrix.SetValue(index, 3, -this.center.Get(index));
	}
	return matrix;
}

Sphere.prototype.GetInnerBaseToWorldMatrix = function()
{
	var matrix = IdentityMatrix(4);
	for(var index=0; index<3; index++)
	{
		matrix.SetValue(index, 3, this.center.Get(index));
	}
	return matrix;
}

Sphere.prototype.ComputeMesh = function(sampling)
{
	var halfSampling = Math.ceil(sampling/2);
	var points = new PointCloud();
	points.Reserve(sampling*halfSampling+2);
	
	points.PushPoint(new Vector([0, 0, 1]));
	points.PushPoint(new Vector([0, 0, -1]));
	//Spherical coordinates
	for(var jj=0; jj<halfSampling; jj++)
	{
		for(var ii=0; ii<sampling; ii++)
		{
			var phi = ((jj+1)*Math.PI)/(halfSampling+1);
			var theta = 2.0*ii*Math.PI/sampling;
			var radial = new Vector([
				Math.cos(theta) * Math.sin(phi),
				Math.sin(theta) * Math.sin(phi),
				Math.cos(phi)
			]);
			points.PushPoint(this.center.Plus(radial.Times(this.radius)));
		}
	}
	
	var mesh = new Mesh(points);
	mesh.Reserve(2 * sampling  + (halfSampling-1) * sampling);
	
	//North pole
	var northShift = 2;
	for(var ii=0; ii<sampling; ii++)
	{
		mesh.PushFace([ii+northShift, 0, ((ii+1)%sampling)+northShift]);
	}
	//South pole
	var southShift = (halfSampling-1)*sampling+northShift;
	for(var ii=0; ii<sampling; ii++)
	{
		mesh.PushFace([1, ii+southShift, ((ii+1)%sampling)+southShift]);
	}
	//Strips
	for(var jj=0; (jj+1)<halfSampling; jj++)
{
		var ja = jj*sampling;
		var jb = (jj+1)*sampling;
		for(var ii=0; ii<sampling; ii++)
		{
			var ia = ii;
			var ib = (ii+1)%sampling;
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

Sphere.prototype.RayIntersection = function(ray)
{
	var worldToBase = this.GetWorldToInnerBaseMatrix();
	var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
	var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
	
	//Solve [t] : sqrnorm(innerFrom[i]+t*innerDir[i])=radius
	var aa = 0;
	var bb = 0;
	var cc = 0;
	for(var index=0; index<3; index++)
	{
		aa += innerDir.GetValue(index,0) * innerDir.GetValue(index,0);
		bb += 2.0*innerDir.GetValue(index,0)*innerFrom.GetValue(index,0);
		cc += innerFrom.GetValue(index,0) * innerFrom.GetValue(index,0);
	}
	
	//Solve [t] : aa.t^2 + bb.t + cc = radius
	cc -= this.radius*this.radius;
	var dd = bb*bb - 4.0*aa*cc;
	var tt = [];
	if(Math.abs(dd)<0.0000001)
	{
		tt.push(-bb/2.0*aa);
	}
	else if(dd > 0.)
	{
		tt.push((-bb+Math.sqrt(dd))/(2.0*aa));
		tt.push((-bb-Math.sqrt(dd))/(2.0*aa));
	}
	
	return tt;
}

Sphere.prototype.Distance = function(point)
{
	return Math.abs(point.Minus(this.center).Norm() - this.radius);
}