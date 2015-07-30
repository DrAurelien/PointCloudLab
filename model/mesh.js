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
	var indices = [
			this.faces[index++],
			this.faces[index++],
			this.faces[index++]
		];
	return {
		indices : indices,
		points : [
			this.pointcloud.GetPoint(indices[0]),
			this.pointcloud.GetPoint(indices[1]),
			this.pointcloud.GetPoint(indices[2])
		]
	};
}

Mesh.prototype.Size = function()
{
	return this.faces.length / 3;
}

Mesh.prototype.ComputeNormals = function()
{
	var nbFaces = this.Size();
	var nbPoints = this.pointcloud.Size();
	var normals = new Array(nbPoints);
	for(var index=0; index<nbPoints; index++)
	{
		normals[index] = new Vector([0, 0, 0]);
	}
	
	for(var index=0; index<nbFaces; index++)
	{
		var face = this.GetFace(index);
		var normal = face.points[1].Minus(face.points[0]).Cross(face.points[2].Minus(face.points[0])).Normalized();
		for(var pointindex=0; pointindex<face.indices.length; pointindex++)
		{
			normals[face.indices[pointindex]] = normals[face.indices[pointindex]].Plus(normal);
		}
	}
	
	this.pointcloud.ClearNormals();
	for(var index=0; index<nbPoints; index++)
	{
		this.pointcloud.PushNormal(normals[index].Normalized());
	}
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
		drawingContext.gl.drawElements(drawingContext.gl.TRIANGLES, this.faces.length, drawingContext.gl.UNSIGNED_SHORT, 0);
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