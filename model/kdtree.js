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

KDTree.prototype.GetIndices = function(start, nbItems, direction)
{
	var array = new Array(nbItems);
	for(var index=0; index<nbItems; index++)
	{
		var cloudIndex = this.indices[start + index];
		array[index] = {
			index : cloudIndex,
			coord : this.cloud.GetPointCoordinate(cloudIndex, direction)
		}
	}
	return array;
}

KDTree.prototype.SetIndices = function(start, nbItems, array)
{
	for(var index=0; index<nbItems; index++)
	{
		this.indices[start + index] = array[index].index;
	}
}

KDTree.prototype.Split = function(fromIndex, toIndex, direction)
{
	var pointCloud = this.cloud;
	function compare(a, b)
	{	
		return (a.coord < b.coord) ? -1 : ((a.coord > b.coord) ? 1 : 0);
	}
		
	if(fromIndex < toIndex)
	{
		var nbItems = toIndex - fromIndex;

		//Sort the indices in increasing coordinate order (given the current direction)
		var subIndices = this.GetIndices(fromIndex, toIndex, direction);
		subIndices = subIndices.sort(compare);
		this.SetIndices(fromIndex, nbItems, subIndices);
		
		var cellData = {
			fromIndex : fromIndex,
			toIndex : toIndex,
			direction : direction
		}
		
		if(nbItems >= 30)
		{
			var cutIndex = Math.ceil(nbItems/2);
			var nextDirection = (direction+1)%3;
			cellData.cutValue = (subIndices[cutIndex-1] + subIndices[cutIndex]) / 2.0;
			
			cutIndex += fromIndex;
			var left = this.Split(fromIndex, cutIndex, nextDirection);
			var right = this.Split(cutIndex, toIndex, nextDirection);
			if(left && right)
			{
				cellData.left = left;
				cellData.right = right;
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

KDTree.prototype.FindNearestNeighbours = function(queryPoint, nbh, cell)
{
	if(!cell)
	{
		cell = this.root;
	}
	
	nbh.Initialize(queryPoint, this.cloud);
	
	//Handle inner nodes
	if(cell.left && cell.right)
	{
		var distToThreshold = Math.abs(queryPoint.Get(cell.direction) - cell.cutValue);
		
		//Explore left, then right
		if(queryPoint.Get(cell.direction) < cell.cutValue)
		{
			this.FindNearestNeighbours(queryPoint, nbh, cell.left);
			if(nbh.Accept(distToThreshold))
			{
				this.FindNearestNeighbours(queryPoint, nbh, cell.right);
			}
		}
		//Explore right, then left
		else
		{
			this.FindNearestNeighbours(queryPoint, nbh, cell.right);
			if(nbh.Accept(distToThreshold))
			{
				this.FindNearestNeighbours(queryPoint, nbh, cell.left);
			}
		}
	}
	//Handle leaves
	else
	{
		this.LoopOverPoints(cell, function(index) { nbh.Push(index) });
	}
	
	return nbh.Neighbours();
}

function TestNbh(cloud)
{
	var tree = new KDTree(cloud);
	var nbh = new KNearestNeighbours(10);
	tree.FindNearestNeighbours(new Vector([1,1,1]), nbh);
	return nbh;	
}