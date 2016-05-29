function PointCloud()
{
	this.points = [];
	this.pointssize = 0;
	this.normals = [];
	this.normalssize = 0;
	this.boundingbox = new BoundingBox();
	this.glPointsBuffer = null;
	this.glNormalsBuffer = null;
	this.tree = null;
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
	this.tree = null;
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

PointCloud.prototype.GetPointCoordinate = function(i, j)
{
	return this.points[3*i+j]
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

PointCloud.prototype.KNearestNeighbours = function(queryPoint, k)
{
	if(!this.tree)
	{
		console.log('Computing KD-Tree for point cloud "' + this.name + '"');
		this.tree = new KDTree(this);
	}
	
	var knn = new KNearestNeighbours(k);
	this.tree.FindNearestNeighbours(queryPoint, knn);
	return knn.Neighbours();
}

PointCloud.prototype.RayIntersection = function(ray)
{
	return [];
}

PointCloud.prototype.ComputeNormal = function(index, k)
{
	if(index>=this.Size())
	{
		return null;
	}
	
	//Get the K-nearest neighbours (including the query point)
	var point = this.GetPoint(index);
	var knn = this.KNearestNeighbours(point, k+1);
	
	//Compute the covariance matrix
	var covariance = NullMatrix(3, 3);
	var center = new Vector([0, 0, 0]);
	for(var ii=0; ii<knn.length; ii++)
	{
		center = center.Plus(this.GetPoint(knn[ii].index));
	}
	center = center.Times(1/knn.length);
	for(var kk=0; kk<knn.length; kk++)
	{
		var vec = this.GetPoint(knn[kk].index).Minus(center);
		for(var ii=0; ii<3; ii++)
		{
			for(var jj=0; jj<3; jj++)
			{
				covariance.SetValue(ii, jj,
					covariance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj))
				);
			}
		}
	}
	
	//The normal is the eigenvector having the smallest eigenvalue in the covariance matrix
	var eigen = covariance.EigenDecomposition();
	if(eigen)
	{
		return eigen[0].eigenVector.Normalized();
	}
	return null;
}

PointCloud.prototype.ComputeNormals = function(k, onDone)
{
	if(!k)
	{
		k = 30;
	}
	
	if(this.normals.length != this.points.length)
	{
		this.normals = new Array(this.points.length);
	}
	
	var index=0;
	var cloud = this;
	var summary = { success : 0, failure: 0 };
	LongProcess('Computing normals', function()
		{
			if(index >= cloud.Size())
			{
				console.log('Successfully computed ' + summary.success + ' normals (' + summary.failure + ' failures)');
				return null;
			}
			
			var normal = cloud.ComputeNormal(index, k);
			if(normal)
			{
				summary.success++;
				cloud.PushNormal(normal);
			}
			else
			{
				summary.failure++;
				cloud.PushNormal(new Vector([0,0,0]));
			}
			index++;
			return {current : index, total : cloud.Size()};
		},
		onDone
	);
}

PointCloud.prototype.GetActions = function(onDone)
{
	var cloud = this;
	return [
		{
			label : 'Compute normals',
			callback : function() { cloud.ComputeNormals(0, onDone) }
		}
	];
}