//Cylinder class
function Cylinder(center, axis, radius, height)
{
	this.center = center;
	this.axis = axis.Normalized();
	this.radius = radius;
	this.height = height;
	Shape.call(this, 'Cylinder');
}

//Inheritance
Cylinder.prototype = Object.create(Shape.prototype);
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.GetGeometry = function()
{
	return {
		Center : this.MakeVectorProperty(this.center),
		Axis : this.MakeVectorProperty(this.axis),
		Radius : this.radius,
		Height : this.height
	};
}

Cylinder.prototype.SetGeometry = function(geometry)
{
	if('Center' in geometry)
	{
		this.center = this.ParseVectorProperty(geometry.Center);
	}
	
	if('Axis' in geometry)
	{
		this.axis = this.ParseVectorProperty(geometry.Axis);
	}
	
	if('Radius' in geometry)
	{
		this.radius = this.ParseRealProperty(geometry.Radius);
	}
	
	if('Height' in geometry)
	{
		this.height = this.ParseRealProperty(geometry.Height);
	}
	
	if(this.center == null || this.axis == null || this.radius == null || this.height == null)
	{
		return false;
	}
	
	this.axis = this.axis.Normalized();
	this.mesh = null;
	
	return true;
}

Cylinder.prototype.GetBoundingBox = function()
{
	var size = new Vector([
		2*Math.abs(0.5*this.height*this.axis.Get(0)+this.radius*Math.sin(Math.acos(this.axis.Get(0)))),
		2*Math.abs(0.5*this.height*this.axis.Get(1)+this.radius*Math.sin(Math.acos(this.axis.Get(1)))),
		2*Math.abs(0.5*this.height*this.axis.Get(2)+this.radius*Math.sin(Math.acos(this.axis.Get(2))))
	]);
	var bb = new BoundingBox();
	bb.Set(this.center, size);
	return bb;
}

Cylinder.prototype.GetWorldToInnerBaseMatrix = function()
{
	var translation = IdentityMatrix(4);
	var basechange = IdentityMatrix(4);
	var xx = this.axis.GetOrthogonnal();
	var yy = this.axis.Cross(xx).Normalized();
	for(var index=0; index<3; index++)
	{
		basechange.SetValue(0, index, xx.Get(index));
		basechange.SetValue(1, index, yy.Get(index));
		basechange.SetValue(2, index, this.axis.Get(index));
		translation.SetValue(index, 3, -this.center.Get(index));
	}
	return basechange.Multiply(translation);
}

Cylinder.prototype.ComputeMesh = function(sampling)
{
	var points = new PointCloud();
	points.Reserve(4*sampling+2);
	
	var xx = this.axis.GetOrthogonnal();
	var yy = this.axis.Cross(xx).Normalized();
	var radials = [];
	for(var ii=0; ii<sampling; ii++)
	{
		var phi = 2.0*ii*Math.PI/sampling;
		var c = Math.cos(phi);
		var s = Math.sin(phi);
		var radial = xx.Times(c).Plus(yy.Times(s));
		radials.push(radial.Times(this.radius));
	}
	var northCenter = this.center.Plus(this.axis.Times(this.height/2));
	var southCenter = this.center.Minus(this.axis.Times(this.height/2));
	points.PushPoint(northCenter);
	points.PushPoint(southCenter);
	//North face
	for(var ii=0; ii<radials.length; ii++)
	{
		points.PushPoint(northCenter.Plus(radials[ii]));
	}
	//South face
	for(var ii=0; ii<radials.length; ii++)
	{
		points.PushPoint(southCenter.Plus(radials[ii]));
	}
	//Double points to separate normals
	for(var ii=0; ii<radials.length; ii++)
	{
		points.PushPoint(northCenter.Plus(radials[ii]));
	}
	for(var ii=0; ii<radials.length; ii++)
	{
		points.PushPoint(southCenter.Plus(radials[ii]));
	}
	
	var mesh = new Mesh(points);
	mesh.Reserve(4 * sampling);
	//North pole
	var northShift = 2;
	for(var ii=0; ii<sampling; ii++)
	{
		mesh.PushFace([ii+northShift, 0, ((ii+1)%sampling)+northShift]);
	}
	//South pole
	var southShift = sampling + 2;
	for(var ii=0; ii<sampling; ii++)
	{
		mesh.PushFace([1, ii+southShift, ((ii+1)%sampling)+southShift]);
	}
	//Strips
	var shift = southShift + sampling;
	for(var ii=0; ii<sampling; ii++)
	{
		var ia = ii;
		var ib = (ii+1)%sampling;
		var ja = 0;
		var jb = sampling;
		var aa = ia + ja + shift;
		var ab = ia + jb + shift;
		var bb = ib + jb + shift;
		var ba = ib + ja + shift;
		mesh.PushFace([ab, aa, ba]);
		mesh.PushFace([ab, ba, bb]);
	}
	mesh.ComputeNormals();
	return mesh;
}

Cylinder.prototype.RayIntersection = function(ray)
{
	var worldToBase = this.GetWorldToInnerBaseMatrix();
	var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
	var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
	
	//haveing p[t] = (innerFrom[i]+t*innerDir[i])
	//Solve p[t].x^2+p[t].y^2=radius for each i<3
	var aa = 0;
	var bb = 0;
	var cc = 0;
	for(var index=0; index<2; index++)
	{
		aa += innerDir.GetValue(index,0) * innerDir.GetValue(index,0);
		bb += 2.0*innerDir.GetValue(index,0)*innerFrom.GetValue(index,0);
		cc += innerFrom.GetValue(index,0) * innerFrom.GetValue(index,0);
	}
	
	//Solve [t] : aa.t^2 + bb.t + cc = radius
	var halfHeight = this.height/2.0;
	var sqrRadius = this.radius*this.radius;
	cc -= sqrRadius;
	var dd = bb*bb - 4.0*aa*cc;
	var tt = [];
	function acceptValue(value)
	{
		var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
		if(Math.abs(point.Get(2))<=halfHeight)
		{
			tt.push(value);
		}
	}
	
	if(Math.abs(dd)<0.0000001)
	{
		acceptValue(-bb/2.0*aa);
	}
	else if(dd > 0.)
	{
		acceptValue((-bb+Math.sqrt(dd))/(2.0*aa));
		acceptValue((-bb-Math.sqrt(dd))/(2.0*aa));
	}
	
	if(tt.length<2 && Math.abs(innerDir.GetValue(2, 0))>0.000001)
	{
		function acceptDiskValue(value)
		{
			var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
			if(point.Get(0)*point.Get(0) + point.Get(1)*point.Get(1) <= sqrRadius)
			{
				tt.push(value);
			}
		}
		//test bounding disks
		//solve [t] : p[t].z = halfHeight
		acceptDiskValue((halfHeight-innerFrom.GetValue(2, 0))/innerDir.GetValue(2, 0));
		acceptDiskValue((-halfHeight-innerFrom.GetValue(2, 0))/innerDir.GetValue(2, 0));
	}
	return tt;
}

Cylinder.prototype.Distance = function(point)
{
	var delta = point.Minus(this.center);
	var hyp = delta.SqrNorm();
	var adj = this.axis.Dot(delta);
	var op = Math.sqrt(hyp - (adj*adj));
	
	return Math.abs(op - this.radius);
}