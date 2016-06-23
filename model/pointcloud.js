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
		this.points[index],
		this.points[index+1],
		this.points[index+2]]);
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
	return new Vector([
		this.normals[index],
		this.normals[index+1],
		this.normals[index+2]]);
}

PointCloud.prototype.InvertNormal = function(i)
{
	for(index=0; index<3; index++)
	{
		this.normals[3*i+index] = -this.normals[3*i+index];
	}
}

PointCloud.prototype.HasNormals = function()
{
	return (this.normalssize == this.pointssize);
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
	
	if(this.HasNormals())
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
	//Get the K-nearest neighbours (including the query point)
	var point = this.GetPoint(index);
	var knn = this.KNearestNeighbours(point, k+1);

	//Compute the covariance matrix
	var covariance = NullMatrix(3, 3);
	var center = new Vector([0, 0, 0]);
	for(var ii=0; ii<knn.length; ii++)
	{
		if(knn[ii].index != index)
		{
			center = center.Plus(this.GetPoint(knn[ii].index));
		}
	}
	center = center.Times(1/(knn.length-1));
	for(var kk=0; kk<knn.length; kk++)
	{
		if(knn[kk].index != index)
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
	}
	
	//The normal is the eigenvector having the smallest eigenvalue in the covariance matrix
	for(var ii=0; ii<3; ii++)
	{
		//Check no column is null in the covariance matrix
		if(covariance.GetColumnVector(ii).SqrNorm() <= 1.0e-12)
		{
			var result = new Vector([0, 0, 0]);
			result.Set(ii, 1);
			return result;
		}
	}
	var eigen = covariance.EigenDecomposition();
	if(eigen)
	{
		return eigen[0].eigenVector.Normalized();
	}
		
	return null;
}


PointCloud.prototype.HarmonizeNormal = function(index, k, done)
{
	if(!done[index])
	{
		var point = this.GetPoint(index);
		var normal = this.GetNormal(index);
		var knn = this.KNearestNeighbours(point, k+1);
		
		var votes =
		{
			pros : 0,
			cons : 0
		};
		
		for(var ii = 0; ii<knn.length; ii++)
		{
			if(done[knn[ii].index])
			{
				var nnormal = this.GetNormal(knn[ii].index);
				var s = nnormal.Dot(normal);
				if(s < 0)
				{
					votes.cons++;
				}
				else
				{
					votes.pros++;
				}
			}
		}
		if(votes.pros < votes.cons)
		{
			this.InvertNormal(index);
		}
		done[index] = true;
	}
}

PointCloud.prototype.ComputeNormals = function(k, onDone)
{
	if(!k)
	{
		k = 30;
	}
	
	var cloud = this;
	
	function Harmonize()
	{
		var index = 0;
		var done = new Array(cloud.Size());
		for(var ii=0; ii<cloud.Size(); ii++)
		{
			done[ii] = false;
		}
		
		LongProcess('Harmonizing normals (' + cloud.Size() + ' data points)', function()
			{
				if(index >= cloud.Size())
				{
					return null;
				}
				cloud.HarmonizeNormal(index, k, done);
				index++;
				return {current : index, total : cloud.Size()};
			},
			onDone
		);
	}
	
	function Compute()
	{
		var index = 0;
		if(cloud.normals.length != cloud.points.length)
		{
			cloud.normals = new Array(cloud.points.length);
		}
		cloud.ClearNormals();
	
		LongProcess('Computing normals (' + cloud.Size() + ' data points)', function()
			{
				if(index >= cloud.Size())
				{
					return null;
				}
				var normal = cloud.ComputeNormal(index, k);
				cloud.PushNormal(normal);
				index++;
				return {current : index, total : cloud.Size()};
			},
			Harmonize
		);
	}
	
	Compute();
}

PointCloud.prototype.GaussianSphere = function()
{
	var gsphere = new PointCloud();
	gsphere.Reserve(this.Size());
	for(var index=0; index<this.Size(); index++)
	{
		gsphere.PushPoint(this.GetNormal(index));
	}
	return gsphere;
}


PointCloud.prototype.GetCSVData = function()
{
	var result = 'x;y;z';
	if(this.HasNormals())
	{
		result += ';nx;ny;nz';
	}
	result += '\n';
	
	for(var index=0; index<this.Size(); index++)
	{
		var point = this.GetPoint(index);
		result += point.Get(0) + ';' +
				point.Get(1) + ';' +
				point.Get(2);
				
		if(this.HasNormals())
		{
			var normal = this.GetNormal(index);
			result += ';' + normal.Get(0) + ';' +
					normal.Get(1) + ';' +
					normal.Get(2);
		}
		result += '\n';
	}
	return result;
}

PointCloud.prototype.GetActions = function(onDone)
{
	var cloud = this;
	var result = [];
	
	if(this.HasNormals())
	{
		result.push({
			label : 'Gaussian sphere',
			callback : function() { var gsphere = cloud.GaussianSphere(); if(onDone) onDone(gsphere); }
		});
		
		result.push({
			label : 'Clear normals',
			callback : function() { cloud.ClearNormals(); if(onDone) onDone(); }
		});
	}
	else
	{
		result.push({
			label : 'Compute normals',
			callback : function() { cloud.ComputeNormals(0, onDone) }
		});
	}
	
	result.push({
			label : 'Export',
			callback : function() { ExportFile(cloud.name + '.csv', cloud.GetCSVData(), 'text/csv'); }
	});
	
	result.push({
		label : 'Detect a sphere',
		callback: function() {
			var ransac = new Ransac(cloud, [RansacSphere]);
			var sphere = ransac.FindBestFittingShape();
			if(onDone)
			{
				onDone(sphere);
			}
		}
	});
	
	return result;
}