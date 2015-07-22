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
		this.height = this.ParseRealProperty(geometry.Radius);
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