function PointCloud()
{
	this.points = [];
	this.normals = [];
	this.boundingbox = new BoundingBox();
	this.glPointsBuffer = null;
	this.glNormalsBuffer = null;
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
	return new Vector([
		this.points[index++],
		this.points[index++],
		this.points[index++]]);
}

PointCloud.prototype.Size = function()
{
	return this.points.length/3;
}

PointCloud.prototype.PushNormal = function(n)
{
	this.normals = this.normals.concat(n.Flatten());
}

PointCloud.prototype.GetNormal = function(i)
{
	var index = 3*i;
	return new Vector(
		this.normals[index++],
		this.normals[index++],
		this.normals[index++]);
}

PointCloud.prototype.ClearNormals = function()
{
	this.normals = [];
}

PointCloud.prototype.GetBoundingBox = function()
{
	return this.boundingbox;
}

PointCloud.prototype.PrepareRendering = function(drawingContext)
{
	var shapetransform = IdentityMatrix(4);
	drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, drawingContext.gl.FALSE, new Float32Array(shapetransform.values));
	
	if(!this.glPointsBuffer)
	{
		this.glPointsBuffer = drawingContext.gl.createBuffer();
		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
		drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.points), drawingContext.gl.STATIC_DRAW);
	}
	drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
	drawingContext.gl.vertexAttribPointer(drawingContext.points, 3, drawingContext.gl.FLOAT, false, 0, 0);
	
	if(this.normals.length == this.points.length)
	{
		drawingContext.EnableNormals(true);
		if(!this.glNormalsBuffer)
		{
			this.glNormalsBuffer = drawingContext.gl.createBuffer();
			drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glNormalsBuffer);
			drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.normals), drawingContext.gl.STATIC_DRAW);
		}
		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glNormalsBuffer);
		drawingContext.gl.vertexAttribPointer(drawingContext.normals, 3, drawingContext.gl.FLOAT, false, 0, 0);
	}
	else
	{
		drawingContext.EnableNormals(false);
	}
}

PointCloud.prototype.Draw = function(drawingContext)
{
	this.material.InitializeLightingModel(drawingContext);
	
	this.PrepareRendering(drawingContext);
	
	drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, this.Size());
	
	if(this.selected)
	{
		this.boundingbox.Draw(drawingContext);
	}
}


PointCloud.prototype.RayIntersection = function(ray)
{
	return [];
}