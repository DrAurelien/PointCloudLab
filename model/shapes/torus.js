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
			var ia = ii*sampling;
			var ib = ((ii+1)%sampling)*sampling;
			for(var jj=0; jj<sampling; jj++)
			{
				var ja = jj;
				var jb = ((jj+1)%sampling);
				//            [ia]        [ib]
				//   [ja] ---- aa -------- ba
				//             |           |
				//   [jb] ---- ab -------- bb
				var aa = ia + ja;
				var ab = ia + jb;s
				var bb = ib + jb;
				var ba = ib + ja;
				this.mesh.PushFace([ab, aa, ba]);
				this.mesh.PushFace([ab, ba, bb]);
			}
		}
		this.mesh.ComputeNormals();
		//this.mesh = points;
	}
}

Torus.prototype.Draw = function(drawingContext)
{	
	this.ComputeMesh(drawingContext.sampling);
	
	if(this.mesh)
	{
		this.DrawMesh(this.mesh, drawingContext);
	}
}

Torus.prototype.GetBoundingBox = function()
{
	var proj = new Vector([this.axis.Get(0), this.axis.Get(1)]);
	var size = new Vector([
		Math.sqrt(1-(this.axis.Get(0)*this.axis.Get(0)))*this.greatRadius+this.smallRadius,
		Math.sqrt(1-(this.axis.Get(1)*this.axis.Get(1)))*this.greatRadius+this.smallRadius,
		proj.Norm()*this.greatRadius+this.smallRadius
	]);
	var bb = new BoundingBox();
	bb.Set(this.center, size.Times(2.0));
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
	var worldToBase = this.GetWorldToInnerBaseMatrix();
	var innerFrom = new Vector(worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1]))).values);
	var innerDir = new Vector(worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0]))).values);
	
	var grr = this.greatRadius*this.greatRadius;
	var srr = this.smallRadius*this.smallRadius;
	
	var alpha = innerDir.Dot(innerDir);
	var beta = 2.0*innerDir.Dot(innerFrom);
	var gamma = innerFrom.Dot(innerFrom) + grr - srr;
	
	innerDir.Set(0, 0);
	innerFrom.Set(0, 0);
	
	var eta = innerDir.Dot(innerDir);
	var mu = 2.0*innerDir.Dot(innerFrom);
	var nu = innerFrom.Dot(innerFrom);
	
	//Quartic defining the equation of the torus
	var quartic = new Polynomial([
		(gamma*gamma) - (4.0*grr*nu),
		(2.0*beta*gamma) - (4.0*grr*mu),
		(beta*beta) + (2.0*alpha*gamma) - (4.0*grr*eta),
		2.0*alpha*eta,
		alpha*alpha
	]);
	
	return quartic.FindRealRoots();
}