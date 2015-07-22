//Drawable unit sphere centered at (0,0,0)
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

Sphere.prototype.Draw = function(drawingContext)
{
	var shapetransform = IdentityMatrix(4);
	for(var index=0; index<3; index++)
	{
		shapetransform.SetValue(index, index, this.radius);
		shapetransform.SetValue(index, 3, this.center.Get(index));
	}
	
	drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, drawingContext.gl.FALSE, new Float32Array(shapetransform.values));
	
	this.DrawUnitShape(UnitSpherePoints, drawingContext);
};
