//Torus class
function Torus(center, axis, greatRadius, smallRadius)
{
	this.center = center;
	this.axis = axis.Normalized();
	this.greatRadius = greatRadius;
	this.smallRadius = smallRadius;
	Shape.call(this, 'Torus');
}

//Inheritance
Torus.prototype = Object.create(Shape.prototype);
Torus.prototype.constructor = Torus;

Torus.prototype.GetGeometry = function()
{
	return {
		Center : this.MakeVectorProperty(this.center),
		Axis : this.MakeVectorProperty(this.axis),
		'Great Radius' : this.greatRadius,
		'Small Radius' : this.smallRadius
	};
}

Torus.prototype.SetGeometry = function(geometry)
{
	if('Center' in geometry)
	{
		this.center = this.ParseVectorProperty(geometry.Center);
	}
	
	if('Axis' in geometry)
	{
		this.axis = this.ParseVectorProperty(geometry.Axis);
	}
	
	if('Great Radius' in geometry)
	{
		this.greatRadius = this.ParseRealProperty(geometry['Great Radius']);
	}
	
	if('Small Radius' in geometry)
	{
		this.smallRadius = this.ParseRealProperty(geometry['Small Radius']);
	}
	
	if(this.center == null || this.axis == null || this.greatRadius == null || this.smallRadius == null)
	{
		return false;
	}
	
	this.axis = this.axis.Normalized();
	this.mesh = null;
	
	return true;
}

Torus.prototype.ComputeMesh = function(sampling)
{
	if(!this.mesh)
	{
		var points = new PointCloud();
		points.Reserve(sampling*sampling);
		
		var xx = this.axis.GetOrthogonnal();
		var yy = this.axis.Cross(xx).Normalized();
		for(var ii=0; ii<sampling; ii++)
		{
			var phi = 2.0*ii*Math.PI/sampling;
			var c = Math.cos(phi);
			var s = Math.sin(phi);
			var radiusVect = xx.Times(c).Plus(yy.Times(s));
			var faceCenter = this.center.Plus(radiusVect.Times(this.greatRadius));
			for(var jj=0; jj<sampling; jj++)
			{
				var theta = 2.0*jj*Math.PI/sampling;
				var ct = Math.cos(theta);
				var st = Math.sin(theta);
				points.PushPoint(faceCenter.Plus(radiusVect.Times(this.smallRadius*ct)).Plus(this.axis.Times(this.smallRadius*st)));
			}
		}
		
		this.mesh = new Mesh(points);
		this.mesh.Reserve(2 * sampling * sampling);
		for(var ii=0; ii<sampling; ii++)
		{
			for(var jj=0; jj<sampling; jj++)
			{
				this.mesh.PushFace([
				((ii+1)%sampling)*sampling +jj,
					ii*sampling + ((jj+1)%sampling),
					ii*sampling + jj
				]);
				
				this.mesh.PushFace([
					((ii+1)%sampling)*sampling + ((jj+1)%sampling),
					((ii+1)%sampling)*sampling + jj,
					ii*sampling + ((jj+1)%sampling)
				]);
			}
		}
		this.mesh.ComputeNormals();
		//this.mesh = points;
	}
}

Torus.prototype.Draw = function(drawingContext)
{	
	this.ComputeMesh(30);
	
	if(this.mesh)
	{
		this.mesh.Draw(drawingContext);
	}
}

Torus.prototype.GetBoundingBox = function()
{
	//TODO : improve
	var size = new Vector([
		this.greatRadius+this.smallRadius,
		this.greatRadius+this.smallRadius,
		this.greatRadius+this.smallRadius
	]);
	var bb = new BoundingBox();
	bb.Set(this.center, size);
	return bb;
}

Torus.prototype.GetWorldToInnerBaseMatrix = function()
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

Torus.prototype.RayIntersection = function(ray)
{
	return [];
}