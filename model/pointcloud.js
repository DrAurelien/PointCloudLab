function PointCloud()
{
	this.points = [];
	
	this.glPointsBuffer = null;
}

PointCloud.prototype.PushPoint = function(p)
{
	this.points.push(p.Flatten());
}

PointCloud.prototype.GetPoint = function(i)
{
	var index = 3*i;
	return new Vector(
		this.points[index++],
		this.points[index++],
		this.points[index++]);
}


PointCloud.prototype.GetProperties = function()
{
	return {};
}

PointCloud.prototype.GetProperties = function(properties)
{
}

PointCloud.prototype.GetBoundingBox = function()
{
	return new BoundingBox(new Vector([0, 0, 0]), new Vector([0, 0, 0]));
}

PointCloud.prototype.Draw = function(drawingContext)
{
	var glContext = drawingContext.gl;
	if(!this.glPointsBuffer)
	{
		this.glPointsBuffer = glContext.createBuffer();
		glContext.bindBuffer(glContext.ARRAY_BUFFER, this.glPointsBuffer);
		glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.points), glContext.STATIC_DRAW);
	}
	
	glContext.bindBuffer(glContext.ARRAY_BUFFER, this.glPointsBuffer);
	drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, this.points.length/3);
}


PointCloud.prototype.RayIntersection = function(ray)
{
	return [];
}