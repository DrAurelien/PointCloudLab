var Sampling = 30;

//Unit sphere centered at (0,0,0)
var UnitSpherePoints =
{
	points : [],
	indices : [],
	pointsBuffer : null,
	normalsBuffer : null,
	indexBuffer : null,
	sampling : 0,
	elements : [],
	
	Sample : function(sampling, glContext)
	{
		if(sampling != this.sampling)
		{
			this.sampling = sampling;
			
			//Poles
			this.points = [
				0, 0, 1,
				0, 0, -1
			];
			//Spherical coordinates
			var halfSampling = Math.ceil(sampling/2);
			for(var jj=1; jj<halfSampling; jj++)
			{
				for(var ii=0; ii<sampling; ii++)
				{
					var phi = jj*Math.PI/halfSampling;
					var theta = 2.0*ii*Math.PI/sampling;
					this.points = this.points.concat([
						Math.cos(theta) * Math.sin(phi),
						Math.sin(theta) * Math.sin(phi),
						Math.cos(phi)
					]);
				}
			}
			
			this.elements = [];
			//poles indices
			var firstSliceShift = 2;
			var lastSliceShift = (halfSampling-2)*sampling+firstSliceShift;
			//North
			var northPole = new Array(sampling+2)
			var southPole = new Array(sampling+2)
			northPole[0] = 0;
			southPole[0] = 1;
			for(var ii=0; ii<sampling; ii++)
			{
				northPole[1+ii] = ii+firstSliceShift;
				southPole[1+ii] = ii+lastSliceShift;
			}
			northPole[1+sampling] = firstSliceShift;
			southPole[1+sampling] = lastSliceShift;
			this.elements.push({from : this.indices.length, count : northPole.length, type : glContext.TRIANGLE_FAN});
			this.indices = northPole;
			this.elements.push({from : this.indices.length, count : southPole.length, type : glContext.TRIANGLE_FAN});
			this.indices = this.indices.concat(southPole);
			
			//strips
			var nbStrips = halfSampling-2;
			for(var jj=0; jj<nbStrips; jj++)
			{
				var strip = new Array(2*(sampling+1));
				var fromSliceShift = firstSliceShift+(jj*sampling);
				var toSliceShift = firstSliceShift+((jj+1)*sampling);
				for(var ii=0; ii<sampling; ii++)
				{
					strip[2*ii] = fromSliceShift+ii;
					strip[2*ii+1] = toSliceShift+ii;
				}
				strip[2*sampling] = firstSliceShift+(jj*sampling);
				strip[2*sampling+1] = firstSliceShift+((jj+1)*sampling);
				this.elements.push({from : this.indices.length, count : strip.length, type : glContext.TRIANGLE_STRIP});
				this.indices = this.indices.concat(strip);
			}
			
			//Create webgl buffers
			//positions buffer
			console.log('   Creating sphere points buffer ('+this.points.length/3+' points)');
			this.pointsBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ARRAY_BUFFER, this.pointsBuffer);
			glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.points), glContext.STATIC_DRAW);
			//indices buffer
			console.log('   Creating sphere indices buffer');
			this.indexBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), glContext.STATIC_DRAW);
			//normals buffer
			this.normalsBuffer = this.pointsBuffer;
		}
	}
}

//Z-axis oriented cylinder, with unit height, centered at (0,0,0)
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

function DrawUnitShape(unitShape, drawingContext)
{
	unitShape.Sample(Sampling, drawingContext.gl);
	
	drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, unitShape.pointsBuffer);
	drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
	if(unitShape.normalsBuffer)
	{
		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, unitShape.normalsBuffer);
		drawingContext.gl.vertexAttribPointer(drawingContext.normals, 3, drawingContext.gl.FLOAT, false, 0, 0);
	}
	
	if(drawingContext.rendering.Point())
	{
		drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, unitShape.points.length/3);
	}
	
	if(drawingContext.rendering.Surface())
	{
		var sizeOfUnisgnedShort = 2;
		drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, unitShape.indexBuffer);
		for(var index=0; index<unitShape.elements.length; index++)
		{
			var element = unitShape.elements[index];
			drawingContext.gl.drawElements(element.type, element.count, drawingContext.gl.UNSIGNED_SHORT, sizeOfUnisgnedShort*element.from);
		}
	}
}

function Sphere(center, radius)
{
	this.center = center;
	this.radius = radius;
	this.name = 'Sphere';
	
	this.Draw = function(drawingContext)
	{
		var shapetransform = IdentityMatrix(4);
		for(var index=0; index<3; index++)
		{
			shapetransform.SetValue(index, index, this.radius);
			shapetransform.SetValue(index, 3, this.center.coordinates[index]);
		}
		
		drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, drawingContext.gl.FALSE, new Float32Array(shapetransform.values));
		
		DrawUnitShape(UnitSpherePoints, drawingContext);
	}
}

function Cylinder(center, axis, radius, height)
{
	this.center = center;
	this.axis = axis.Normalized();
	this.radius = radius;
	this.height = height;
	this.name = 'Cylinder';
	
	this.Draw = function(drawingContext)
	{	
		var shapetransform = IdentityMatrix(4);
		//Scale
		shapetransform.SetValue(0, 0, this.radius);
		shapetransform.SetValue(1, 1, this.radius);
		shapetransform.SetValue(2, 2, this.height);
		//Rotate
		var rotation;
		if(1-this.axis.coordinates[2]>0.0000001)
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
		
		DrawUnitShape(UnitCylinderPoints, drawingContext);
	}
}