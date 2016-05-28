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

KDTree.prototype.SetIndices = function(start, array)
{
	for(var index=0; index<array.length; index++)
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
		var subIndices = this.GetIndices(fromIndex, nbItems, direction);
		subIndices = subIndices.sort(compare);
		this.SetIndices(fromIndex, subIndices);
		
		var cellData = {
			fromIndex : fromIndex,
			toIndex : toIndex,
			direction : direction
		}
		
		if(nbItems >= 30)
		{
			var cutIndex = Math.ceil(nbItems/2);
			var nextDirection = (direction+1)%3;
			cellData.cutValue = (subIndices[cutIndex-1].coord + subIndices[cutIndex].coord) / 2.0;
			
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

KDTree.prototype.FindNearestNeighbours = function(queryPoint, nbh, cell)
{
	if(!cell)
	{
		cell = this.root;
		nbh.Initialize(queryPoint, this.cloud);
	}
	
	
	//Handle inner nodes
	if(cell.left && cell.right)
	{
		var distToThreshold = Math.abs(queryPoint.Get(cell.direction) - cell.cutValue);
		
		//Determine which cell should be explored first
		var first = cell.right;
		var second = cell.left;
		if(queryPoint.Get(cell.direction) < cell.cutValue)
		{
			first = cell.left;
			second = cell.right;
		}
		
		//Explore cells
		this.FindNearestNeighbours(queryPoint, nbh, first);
		if(nbh.Accept(distToThreshold))
		{
			this.FindNearestNeighbours(queryPoint, nbh, second);
		}
	}
	//Handle leaves
	else
	{
		for(var index=cell.fromIndex; index<cell.toIndex; index++)
		{
			nbh.Push(this.indices[index]);
		}
	}
	
	return nbh.Neighbours();
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