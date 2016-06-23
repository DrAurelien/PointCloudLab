//Drawable Z-axis oriented cylinder, with unit height, centered at (0,0,0)
var UnitCylinderPoints =
{
	points : [],
	indices : [],
	pointsBuffer : null,
	indexBuffer : null,
	sampling : 0,
	elements : [],
	
	Sample : function(sampling, glContext)
	{
		if(sampling != this.sampling)
		{
			this.sampling = sampling;
			
			//Points
			this.points = new Array(2*3*sampling);
			this.normals = new Array(2*3*sampling);
			for(var ii=0; ii<sampling; ii++)
			{
				var phi = 2.0*ii*Math.PI/sampling;
				var c = Math.cos(phi);
				var s = Math.sin(phi);
				var index = 3*ii;
				this.points[index] = c; this.points[index+1] = s; this.points[index+2] = 0.5;
				this.normals[index] = c; this.normals[index+1] = s; this.normals[index+2] = 0;
				index = 3*(sampling+ii);
				this.points[index] = c; this.points[index+1] = s; this.points[index+2] = -0.5;
				this.normals[index] = c; this.normals[index+1] = s; this.normals[index+2] = 0;
			}
			//Double points because their normals differ
			this.points = [0, 0, 0.5, 0, 0, -0.5].concat(this.points.concat(this.points));
			this.normals = [0, 0, 1.0, 0, 0, -1.0].concat(this.normals);
			for(var ii=0; ii<sampling; ii++)
			{
				this.normals = this.normals.concat([0, 0, 1.0]);
			}
			for(var ii=0; ii<sampling; ii++)
			{
				this.normals = this.normals.concat([0, 0, -1.0]);
			}
			
			this.elements = [];
			this.indices = [];
			
			//strips
			var strip = new Array(2*(sampling+1));
			for(var ii=0; ii<sampling; ii++)
			{
				strip[2*ii] = 2+ii;
				strip[2*ii+1] = 2+ii+sampling;
			}
			strip[2*sampling] = 2;
			strip[2*sampling+1] = 2+sampling;
			this.elements.push({from : this.indices.length, count : strip.length, type : glContext.TRIANGLE_STRIP});
			this.indices = this.indices.concat(strip);
			
			//Faces
			var northFace = new Array(sampling+2)
			var southFace = new Array(sampling+2)
			northFace[0] = 0;
			southFace[0] = 1;
			var faceShift = 2*sampling;
			for(var ii=0; ii<sampling; ii++)
			{
				northFace[1+ii] = ii+2+faceShift;
				southFace[1+ii] = ii+2+faceShift+sampling;
			}
			northFace[1+sampling] = 2+faceShift;
			southFace[1+sampling] = 2+faceShift+sampling;
			this.elements.push({from : this.indices.length, count : northFace.length, type : glContext.TRIANGLE_FAN});
			this.indices = this.indices.concat(northFace);
			this.elements.push({from : this.indices.length, count : southFace.length, type : glContext.TRIANGLE_FAN});
			this.indices = this.indices.concat(southFace);
			
			//Create webgl buffers
			//positions buffer
			console.log('   Creating cylinder points buffer ('+this.points.length/3+' points)');
			this.pointsBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ARRAY_BUFFER, this.pointsBuffer);
			glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.points), glContext.STATIC_DRAW);
			//indices buffer
			console.log('   Creating cylinder indices buffer');
			this.indexBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), glContext.STATIC_DRAW);
			console.log('   Creating cylinder normals buffer');
			this.normalsBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ARRAY_BUFFER, this.normalsBuffer);
			glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.normals), glContext.STATIC_DRAW);
		}
	}
}

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
	
	return true;
}

Cylinder.prototype.Draw = function(drawingContext)
{	
	var shapetransform = IdentityMatrix(4);
	//Scale
	shapetransform.SetValue(0, 0, this.radius);
	shapetransform.SetValue(1, 1, this.radius);
	shapetransform.SetValue(2, 2, this.height);
	//Rotate
	var rotation;
	if(1-this.axis.Get(2)>0.0000001)
	{
		var z = new Vector([0.0, 0.0, 1.0]);
		var w = this.axis.Cross(z);
		w = w.Normalized();
		var angle = Math.acos(this.axis.Dot(z));
		var rotation = new RotationMatrix(w, angle);
		shapetransform = rotation.Multiply(shapetransform);
	}
	//Translate
	var translation = TranslationMatrix(this.center);
	shapetransform = translation.Multiply(shapetransform);
	
	drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, drawingContext.gl.FALSE, new Float32Array(shapetransform.values));
	
	this.DrawUnitShape(UnitCylinderPoints, drawingContext);
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