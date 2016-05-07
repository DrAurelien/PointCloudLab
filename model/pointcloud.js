function PointCloud()
{
	this.points = [];
	this.pointssize = 0;
	this.normals = [];
	this.normalssize = 0;
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
	if(this.pointssize + p.Dimension() > this.points.length)
	{
		//Not optimal (Reserve should be called before callin PushPoint)
		this.Reserve(this.points.length + p.Dimension());
	}
	
	for(var index=0; index<p.Dimension(); index++)
	{
		this.points[this.pointssize++] = p.Get(index);
	}
	this.boundingbox.Add(p);
}

PointCloud.prototype.Reserve = function(capacity)
{
	var points = new Array(3*capacity);
	for(var index=0; index<this.pointssize; index++)
	{
		points[index] = this.points[index];
	}
	this.points = points;
	
	var normals = new Array(3*capacity);
	for(var index=0; index<this.normalssize; index++)
	{
		normals[index] = this.normals[index];
	}
	this.normals = normals;
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
	return this.pointssize/3;
}

PointCloud.prototype.PushNormal = function(n)
{
	if(this.normalssize + n.Dimension() > this.normals.length)
	{
		//Not optimal (Reserve should be called before callin PushPoint)
		this.Reserve(this.normals.length + n.Dimension());
	}
	
	for(var index=0; index<n.Dimension(); index++)
	{
		this.normals[this.normalssize++] = n.Get(index);
	}
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
	this.normalssize = 0;
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
	
	if(this.normalssize == this.pointssize)
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
	
	if(this.selected && this.pointssize > 0)
	{
		this.boundingbox.Draw(drawingContext);
	}
}


PointCloud.prototype.RayIntersection = function(ray)
{
	return [];
}