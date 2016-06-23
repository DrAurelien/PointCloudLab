function Ransac(cloud, generators)
{
	this.cloud = cloud;
	this.generators = generators;
	this.nbPoints = 3;
	this.nbFailure = 100;
	this.noise = 0.1;
}

Ransac.prototype.FindBestFittingShape = function()
{
	var nbTrials = 0;
	var best = null;
	
	while(nbTrials < this.nbFailure)
	{
		var points = this.PickPoints();
		var candidate = this.GenerateCandidate(points);
		nbTrials ++;
		if(candidate != null)
		{
			if(best == null || best.score > candidate.score)
			{
				best = candidate;
				nbTrials = 0;
			}
		}
	}
	
	return best.shape;
}

Ransac.prototype.PickPoints = function()
{
	var points = [];

	while(points.length < this.nbPoints)
	{
		var index = Math.floor(Math.random()*this.cloud.Size());
		for(var ii=0; ii<points.length; ii++)
		{
			if(index === points[ii].index)
				index = null;
		}
		if(index != null && index < this.cloud.Size())
		{
			points.push({
				index : index,
				point : this.cloud.GetPoint(index),
				normal : this.cloud.GetNormal(index)
			});
		}
	}
	
	return points;
}

Ransac.prototype.GenerateCandidate = function(points)
{
	//Generate a candidate shape
	var candidates = [];
	for(var ii=0; ii<this.generators.length; ii++)
	{
		var shape = this.generators[ii](points);
		if(shape != null)
		{
			candidates.push(shape);
		}
	}
	
	//Compute scores and keep the best candidate
	var candidate = null;
	for(var ii=0; ii<candidates.length; ii++)
	{
		var score = this.ComputeShapeScore(candidates[ii]);
		if(candidate == null || candidate.score > score)
		{
			candidate = {
				score : score,
				shape : candidates[ii]
			};
		}
	}
	
	return candidate;
}

Ransac.prototype.ComputeShapeScore = function(shape)
{
	var score = 0;
	for(var ii=0; ii<this.cloud.Size(); ii++)
	{
		var dist = shape.Distance(this.cloud.GetPoint(ii));
		if(dist > this.noise)
			dist = this.noise;
		score += dist * dist;
	}
	return score;
}

function RansacSphere(points)
{
	var r1 = {
		point : points[0].point,
		direction : points[0].normal
	};
	var r2 = {
		point : points[1].point,
		direction : points[1].normal
	};
	
	var center = LinesIntersection(r1, r2);
	var radius = 0.5 * (r1.point.Minus(center).Norm() + r2.point.Minus(center).Norm());
	
	return new Sphere(center, radius);
}

function RansacCylinder(points)
{
	var r1 = {
		point : points[0].point,
		direction : points[0].normal
	};
	var r2 = {
		point : points[1].point,
		direction : points[1].normal
	};
	
	var center = LinesIntersection(r1, r2);
	var axis = r1.direction.Cross(r2.direction);
	var radius = 0.5 * (r1.point.Minus(center).Norm() + r2.point.Minus(center).Norm());
	
	return new Cylinder(center, axis, radius, 1.0);
}