function KDTree(cloud)
{
	this.cloud = cloud;
	this.root = null;
	var size = cloud.Size();
	if(size>0)
	{
		this.indices = new Array(size);
		for(var index=0; index<size; index++)
		{
			this.indices[index] = index;
		}
		this.root = this.Split(0, size, 0);
	}
	else
	{
		this.indices = [];
	}
}

KDTree.prototype.Split = function(fromIndex, toIndex, direction)
{
	var pointCloud = this.cloud;
	function compare(a, b)
	{
		var coordA = pointCloud.GetPointCoordinate(a, direction);
		var coordB = pointCloud.GetPointCoordinate(b, direction);
		
		return (coordA < coordB) ? -1 : ((coordA > coordB) ? 1 : 0);
	}
		
	if(fromIndex < toIndex)
	{
		var nbItems = toIndex - fromIndex;
		var array = new Array(nbItems);
		for(var index=0; index<nbItems; index++)
		{
			array[index] = this.indices[fromIndex + index];
		}
		array.sort(compare);
		for(var index=0; index<nbItems; index++)
		{
			this.indices[fromIndex + index] = array[index];
		}
		
		var cellData = {
			fromIndex : fromIndex,
			toIndex : toIndex,
			direction : direction
		}
		
		if(toIndex - fromIndex >= 30)
		{
			var cutIndex = Math.ceil((fromIndex +  toIndex)/2);
			var left = this.Split(fromIndex, cutIndex, (direction+1)%3);
			var right = this.Split(cutIndex, toIndex, (direction+1)%3);
			if(left && right)
			{
				cellData.left = left;
				cellData.right = right;
				cellData.cutValue = (this.indices[cutIndex - 1] + this.indices[cutIndex]) / 2;
			}
		}
		return cellData;
	}
	
	return null;
}

KDTree.prototype.Log = function(cellData)
{
	if(!cellData)
	{
		cellData = this.root;
	}
	
	if(cellData)
	{
		xmlNode = '<node from="'+cellData.fromIndex+'" to="'+cellData.toIndex+'" dir="'+cellData.direction+'"';
		if('cutValue' in cellData)
		{
			xmlNode += ' cut="'+cellData.cutValue+'"';
		}
		xmlNode+='>';
		if(cellData.left)
		{
			xmlNode += this.Log(cellData.left);
		}
		if(cellData.right)
		{
			xmlNode += this.Log(cellData.right);
		}
		xmlNode+='</node>';
	}
	
	return xmlNode;
}

KDTree.prototype.LoopOverPoints = function(cellData, callback)
{
	var nbPoints = cellData.toIndex - cellData.fromIndex;
	for(var index=0; index<nbPoints; index++)
	{
		callback(this.indices[index]);
	}
}

KDTree.prototype.FindNearestNeighbours = function(queryPoint, k, cellData, knn)
{
	if(!k)
		k = 1;
	
	var self = this;
	if(!cellData)
	{
		cellData = this.root;
	}
	if(!knn)
	{
		knn = {
			knn : [],
			
			//Get the distance from the further point to the query point
			GetDistance : function()
			{
				if(this.knn.length == 0)
					return null;
				return this.knn[this.knn.length-1].distance;
			}
			
			//Try to push a candidate
			Push : function(index, distance)
			{
				var cursor = this.knn.length;
				while(cursor >= 0 && distance<this.knn[cursor].distance)
				{
					cursor--;
				}
				if(cursor<k)
				{
					this.knn = this.knn.splice(cursor, 0, {index:index, distance:distance});
					if(this.knn.length > k)
					{
						this.knn = this.knn.splice(k);
					}
					return true;
				}
				return false;
			}
		}
	}
	
	function HandleKNN(index)
	{
		var distance = self.cloud.GetPoint(index).Minus(queryPoint).SqrNorm();
		params.Push(index, distance);
	}
	
	function Test(cell, knn)
	{
		var maxDistance = knn.GetDistance();
		
		if(maxDistance != null)
		{
			var distance = Math.abs(queryPoint.Get(cell.direction) - cell.cutValue);
			distance = distance * distance;
			return (distance < maxDistance);
		}
		return true;
	}
	
	//Handle inner nodes
	if(cellData.left && cellData.Right)
	{
		if(queryPoint.Get(cellData.direction) < cellData.cutValue)
		{
			this.FindNearestNeighbours(queryPoint, k, cellData.left, knn);
			if(Test(cellData, knn)
			{
				this.FindNearestNeighbours(queryPoint, k, cellData.right, knn);
			}
		}
		else
		{
			this.FindNearestNeighbours(queryPoint, k, cellData.right, knn);
			if(Test(cellData, knn)
			{
				this.FindNearestNeighbours(queryPoint, k, cellData.left, knn);
			}
		}
	}
	//Handle leaves
	else
	{
		this.LoopOverPoints(cellData, HandleKNN);
	}
	
	return knn.knn;
}