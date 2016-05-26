function Neighbourhood()
{
	this.cloud = null;
	this.queryPoint = null;
	this.neighbours = null;
}

Neighbourhood.prototype.GetPointData = function(pointIndex)
{
	var distance = this.queryPoint.Minus(this.cloud.GetPoint(pointIndex)).SqrNorm();
	return {
		distance : distance,
		index : pointIndex
	};
}

Neighbourhood.prototype.Initialize = function(queryPoint, cloud)
{
	this.queryPoint = queryPoint;
	this.cloud = cloud;
	this.neighbours = [];
}

Neighbourhood.prototype.Accept = function(distance)
{
	var sqrdist = distance * distance;
	var maxdist = this.GetSqrDistance();
	if(maxdist === null || sqrdist <= maxdist)
	{
		return true;
	}
	return false;
}

Neighbourhood.prototype.Neighbours = function()
{
	return this.neighbours;
}

//==================================
// K-Nearest Neighbours
//==================================
function KNearestNeighbours(k)
{
	this.k = k;
	Neighbourhood.call(this);
}

KNearestNeighbours.prototype = Object.create(Neighbourhood.prototype);
KNearestNeighbours.prototype.constructor = KNearestNeighbours;

KNearestNeighbours.prototype.Push = function(index)
{
	var data = this.GetPointData(index);
	var cursor = this.neighbours.length;
	
	if(this.neighbours.length < this.k)
	{
		this.neighbours.push(data);
	}
	
	//Locate the cursor to the data whose distance is smaller than the current data distance
	while(cursor > 0 && data.distance < this.neighbours[cursor-1].distance)
	{
		if(cursor < this.k)
		{
			this.neighbours[cursor] = this.neighbours[cursor-1];
		}
		cursor--;
	}
	
	//Add the data so that neighbors list remains sorted
	if(cursor < this.k)
	{
		this.neighbours[cursor] = data;
	}
	return false;
}

KNearestNeighbours.prototype.GetSqrDistance = function()
{
	if(this.neighbours.length < this.k)
	{
		return null;
	}
	return this.neighbours[this.neighbours.length-1].distance;
}