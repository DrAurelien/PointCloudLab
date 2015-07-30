function Mesh(cloud)
{
	this.pointcloud = cloud;
	this.faces = [];
	this.boundingbox = new BoundingBox();
	this.glIndexBuffer = null;
	CADPrimitive.call(this, 'Mesh');
}

//Inheritance
Mesh.prototype = Object.create(CADPrimitive.prototype);
Mesh.prototype.constructor = Mesh;

Mesh.prototype.PushFace = function(f)
{
	this.faces = this.faces.concat(f);
}

Mesh.prototype.GetFace = function(i)
{
	var index = 3*i;
	return [
		this.pointcloud.GetPoint(this.faces[index++]),
		this.pointcloud.GetPoint(this.faces[index++]),
		this.pointcloud.GetPoint(this.faces[index++])
	];
}

Mesh.prototype.GetBoundingBox = function()
{
	return this.pointcloud.GetBoundingBox();
}

Mesh.prototype.PrepareRendering = function(drawingContext)
{
	this.pointcloud.PrepareRendering(drawingContext);
	if(!this.glIndexBuffer)
	{
		this.glIndexBuffer = drawingContext.gl.createBuffer();
		drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
		drawingContext.gl.bufferData(drawingContext.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), drawingContext.gl.STATIC_DRAW);
	}
	drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
}

Mesh.prototype.Draw = function(drawingContext)
{
	this.material.InitializeLightingModel(drawingContext);
	
	this.PrepareRendering(drawingContext);
	
	//Points-based rendering
	if(drawingContext.rendering.Point())
	{
		this.pointcloud.Draw(drawingContext);
	}
	
	//Surface rendering
	if(drawingContext.rendering.Surface())
	{
		drawingContext.EnableNormals(false);
		drawingContext.gl.drawElements(drawingContext.gl.TRIANGLES, this.faces.length/3, drawingContext.gl.UNSIGNED_SHORT, 0);
	}
	
	if(this.selected)
	{
		this.GetBoundingBox().Draw(drawingContext);
	}
}


Mesh.prototype.RayIntersection = function(ray)
{
	return [];
}