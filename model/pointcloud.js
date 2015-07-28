function PointCloud()
{
	this.points = [];
	this.boundingbox = new BoundingBox();
	this.glPointsBuffer = null;
	CADPrimitive.call(this, 'PointCloud');
}

//Inheritance
PointCloud.prototype = Object.create(CADPrimitive.prototype);
PointCloud.prototype.constructor = PointCloud;

PointCloud.prototype.PushPoint = function(p)
{
	this.points = this.points.concat(p.Flatten());
	this.boundingbox.Add(p);
}

PointCloud.prototype.GetPoint = function(i)
{
	var index = 3*i;
	return new Vector(
		this.points[index++],
		this.points[index++],
		this.points[index++]);
}

PointCloud.prototype.GetBoundingBox = function()
{
	return this.boundingbox;
}

PointCloud.prototype.Draw = function(drawingContext)
{
	var glContext = drawingContext.gl;
	drawingContext.EnableNormals(false);
	
	var shapetransform = IdentityMatrix(4);
	glContext.uniformMatrix4fv(drawingContext.shapetransform, glContext.FALSE, new Float32Array(shapetransform.values));
	
	this.material.InitializeLightingModel(drawingContext);
	
	if(!this.glPointsBuffer)
	{
		this.glPointsBuffer = glContext.createBuffer();
		glContext.bindBuffer(glContext.ARRAY_BUFFER, this.glPointsBuffer);
		glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.points), glContext.STATIC_DRAW);
	}
	
	glContext.bindBuffer(glContext.ARRAY_BUFFER, this.glPointsBuffer);
	glContext.vertexAttribPointer(drawingContext.points, 3, drawingContext.gl.FLOAT, false, 0, 0);
	glContext.drawArrays(drawingContext.gl.POINTS, 0, this.points.length/3);
	
	drawingContext.EnableNormals(true);
	
	if(this.selected)
	{
		this.boundingbox.Draw(drawingContext);
	}
}


PointCloud.prototype.RayIntersection = function(ray)
{
	return [];
}