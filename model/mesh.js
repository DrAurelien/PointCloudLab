function Mesh(cloud)
{
	this.pointcloud = cloud;
	this.faces = [];
	this.size = 0;
	this.boundingbox = new BoundingBox();
	this.glIndexBuffer = null;
	CADPrimitive.call(this, 'Mesh');
}

//Inheritance
Mesh.prototype = Object.create(CADPrimitive.prototype);
Mesh.prototype.constructor = Mesh;

Mesh.prototype.PushFace = function(f)
{
	if(f.length != 3)
	{
		throw 'Non triangular faces are not (yet) supported in meshes';
	}
	
	if(this.size + f.length > this.faces.length)
	{
		//Not optimal (Reserve should be called before callin PushFace)
		this.Reserve(this.faces.length + f.length);
	}
	
	for(index=0; index<f.length; index++)
	{
		this.faces[this.size++] = f[index];
	}
}

Mesh.prototype.Reserve = function(capacity)
{
	var faces = new Array(3*capacity);
	for(var index=0; index<this.size; index++)
	{
		faces[index] = this.faces[index];
	}
	this.faces = faces;
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
	return this.size / 3;
}

Mesh.prototype.ComputeNormals = function()
{
	var nbFaces = this.Size();
	var nbPoints = this.pointcloud.Size();
	var normals = new Array(nbPoints);
	var self = this;
	
	function Initialize()
	{
		var index = 0;
		LongProcess('Initializing normals (step 1 / 3)',
			function()
			{
				if(index>=nbPoints)
				{
					return null;
				}
				normals[index++] = new Vector([0, 0, 0]);
				return {current : index, total : nbPoints};
			},
			Compute
		);
	}
	
	function Compute()
	{
		var index = 0;
		LongProcess('Computing normals (step 2 / 3)',
			function()
			{
				if(index>=nbFaces)
				{
					return null;
				}
				var face = self.GetFace(index++);
				var normal = face.points[1].Minus(face.points[0]).Cross(face.points[2].Minus(face.points[0])).Normalized();
				for(var pointindex=0; pointindex<face.indices.length; pointindex++)
				{
					normals[face.indices[pointindex]] = normals[face.indices[pointindex]].Plus(normal);
				}
				return {current : index, total : nbFaces};
			},
			FillPointCloud
		);
	}
	
	function FillPointCloud()
	{
		var index = 0;
		self.pointcloud.ClearNormals();
		LongProcess('Assigning normals (step 3 / 3)',
			function()
			{
				if(index>=nbPoints)
				{
					return null;
				}
				self.pointcloud.PushNormal(normals[index++].Normalized());
				return {current : index, total : nbPoints};
			}
		);
	}
	
	Initialize();
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
		drawingContext.gl.drawElements(drawingContext.gl.TRIANGLES, this.size, drawingContext.gl.UNSIGNED_SHORT, 0);
	}
	
	//Wire rendering
	if(drawingContext.rendering.Wire())
	{
		drawingContext.gl.drawElements(drawingContext.gl.LINES, this.size, drawingContext.gl.UNSIGNED_SHORT, 0);
	}
	
	if(this.selected)
	{
		this.GetBoundingBox().Draw(drawingContext);
	}
}


Mesh.prototype.RayIntersection = function(ray)
{
	function LineFaceIntersection(line, face)
	{
		//Compute line / face intersection
		//solve line.from + t * line.dir
		var normal = face[1].Minus(face[0]).Cross(face[2].Minus(face[0]));
		var dd = normal.Dot(face[0]);
		var nn = line.dir.Dot(normal);
		if(Math.abs(nn) < 1e-6)
		{
			return null;
		}
		var tt = (dd - line.from.Dot(normal)) / nn;
		
		var point = line.from.Plus(line.dir.Times(tt));
		
		//Check the point is inside the triangle
		for(var ii=0; ii<3; ii++)
		{
			var test = point.Minus(face[ii]).Cross(face[(ii+1)%3].Minus(face[ii]));
			if(test.Dot(normal) > 0)
			{
				return null;
			}
		}
		return tt;
	}
	
	var result = [];
	for(var ii=0; ii<this.Size(); ii++)
	{
		var tt = LineFaceIntersection(ray, this.GetFace(ii).points);
		if(tt !== null)
		{
			result.push(tt);
		}
	}
	return result;
}