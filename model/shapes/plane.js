//Plane class
function Plane(center, normal, radius)
{
	this.center = center;
	this.normal = normal.Normalized();
	this.patchRadius = radius;
	Shape.call(this, 'Plane');
}

//Inheritance
Plane.prototype = Object.create(Shape.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.GetGeometry = function()
{
	return {
		Center : this.MakeVectorProperty(this.center),
		Normal : this.MakeVectorProperty(this.normal),
		'Patch Radius' : this.patchRadius,
	};
}

Plane.prototype.SetGeometry = function(geometry)
{
	if('Center' in geometry)
	{
		this.center = this.ParseVectorProperty(geometry.Center);
	}
	
	if('Normal' in geometry)
	{
		this.normal = this.ParseVectorProperty(geometry.Normal);
	}
	
	if('Patch Radius' in geometry)
	{
		this.patchRadius = this.ParseRealProperty(geometry['Patch Radius']);
	}
	
	
	if(this.center == null || this.normal == null || this.patchRadius == null)
	{
		return false;
	}
	
	this.normal = this.normal.Normalized();
	this.mesh = null;
	
	return true;
}

Plane.prototype.ComputeMesh = function(sampling)
{
	if(!this.mesh)
	{
		var points = new PointCloud();
		points.Reserve(sampling+1);
		
		var xx = this.normal.GetOrthogonnal();
		var yy = this.normal.Cross(xx).Normalized();
		for(var ii=0; ii<sampling; ii++)
		{
			var phi = 2.0*ii*Math.PI/sampling;
			var c = Math.cos(phi);
			var s = Math.sin(phi);
			var radiusVect = xx.Times(c).Plus(yy.Times(s));
			points.PushPoint(this.center.Plus(radiusVect.Times(this.patchRadius)));
		}
		points.PushPoint(this.center);
		
		this.mesh = new Mesh(points);
		this.mesh.Reserve(sampling);
		for(var ii=0; ii<sampling; ii++)
		{
			this.mesh.PushFace([ii, sampling, (ii+1)%sampling]);
		}
		this.mesh.ComputeNormals();
	}
}

Plane.prototype.Draw = function(drawingContext)
{	
	this.ComputeMesh(drawingContext.sampling);
	
	if(this.mesh)
	{
		this.DrawMesh(this.mesh, drawingContext);
	}
}

Plane.prototype.GetBoundingBox = function()
{
	var size = new Vector([
		2*Math.abs(this.patchRadius*Math.sin(Math.acos(this.normal.Get(0)))),
		2*Math.abs(this.patchRadius*Math.sin(Math.acos(this.normal.Get(1)))),
		2*Math.abs(this.patchRadius*Math.sin(Math.acos(this.normal.Get(2))))
	]);
	var bb = new BoundingBox();
	bb.Set(this.center, size);
	return bb;
}

Plane.prototype.GetWorldToInnerBaseMatrix = function()
{
	var translation = IdentityMatrix(4);
	var basechange = IdentityMatrix(4);
	var xx = this.normal.GetOrthogonnal();
	var yy = this.normal.Cross(xx).Normalized();
	for(var index=0; index<3; index++)
	{
		basechange.SetValue(0, index, xx.Get(index));
		basechange.SetValue(1, index, yy.Get(index));
		basechange.SetValue(2, index, this.normal.Get(index));
		translation.SetValue(index, 3, -this.center.Get(index));
	}
	return basechange.Multiply(translation);
}

Plane.prototype.RayIntersection = function(ray)
{
	var worldToBase = this.GetWorldToInnerBaseMatrix();
	var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
	var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
	
	//solve [t] : p[t].z = 0
	var result = [];
	var tt = -innerFrom.GetValue(2, 0)/innerDir.GetValue(2, 0);
	var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(tt));
	if(point.Get(0)*point.Get(0) + point.Get(1)*point.Get(1) <= (this.patchRadius*this.patchRadius))
	{
		result.push(tt);
	}
	return result;
}