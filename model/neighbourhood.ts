/// <reference path="../maths/vector.ts" />
/// <reference path="pointcloud.ts" />


abstract class Neighbourhood {
	cloud: PointCloud;
	queryPoint: Vector;
	neighbours: Neighbour[];

	Initialize(cloud: PointCloud, queryPoint: Vector) {
		this.cloud = cloud;
		this.queryPoint = queryPoint;
		this.neighbours = [];
	}

	GetPointData(pointIndex: number): Neighbour {
		var sqrdist = this.queryPoint.Minus(this.cloud.GetPoint(pointIndex)).SqrNorm();
		return new Neighbour(sqrdist, pointIndex);
	}

	Accept(distance: number): boolean {
		var sqrdist = distance * distance;
		var maxdist = this.GetSqrDistance();
		if (maxdist === null || sqrdist <= maxdist) {
			return true;
		}
		return false;
	}

	abstract GetSqrDistance(): number;
	abstract Push(index: number): void;

	Neighbours(): Neighbour[] {
		return this.neighbours;
	}
}

//==================================
// Neighbor
//==================================
class Neighbour {
	constructor(public sqrdistance: number, public index: number) {
	}
}

//==================================
// K-Nearest Neighbours
//==================================
class KNearestNeighbours extends Neighbourhood {
	constructor(public k: number) {
		super();
		k = k;
	}

	Push(index: number) {
		var data = this.GetPointData(index);
		var cursor = this.neighbours.length;

		if (this.neighbours.length < this.k) {
			this.neighbours.push(data);
		}

		//Locate the cursor to the data whose distance is smaller than the current data distance
		while (cursor > 0 && data.sqrdistance < this.neighbours[cursor - 1].sqrdistance) {
			if (cursor < this.k) {
				this.neighbours[cursor] = this.neighbours[cursor - 1];
			}
			cursor--;
		}

		//Add the data so that neighbors list remains sorted
		if (cursor < this.k) {
			this.neighbours[cursor] = data;
		}
		return false;
	}

	GetSqrDistance(): number {
		if (this.neighbours.length < this.k) {
			return null;
		}
		return this.neighbours[this.neighbours.length - 1].sqrdistance;
	}
}