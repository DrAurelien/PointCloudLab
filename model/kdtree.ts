/// <reference path="../maths/vector.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="neighbourhood.ts" />


class KDTree {
	root: KDTreeCell;
	indices: number[];

	constructor(public cloud: PointCloud) {
		this.root = null;
		var size = cloud.Size();
		if (size > 0) {
			this.indices = new Array(size);
			for (var index = 0; index < size; index++) {
				this.indices[index] = index;
			}
			this.root = this.Split(0, size, 0);
		}
		else {
			this.indices = [];
		}
	}

	private GetIndices = function (start, nbItems, direction) {
		var array = new Array(nbItems);
		for (var index = 0; index < nbItems; index++) {
			var cloudIndex = this.indices[start + index];
			array[index] = {
				index: cloudIndex,
				coord: this.cloud.GetPointCoordinate(cloudIndex, direction)
			}
		}
		return array;
	}

	private SetIndices = function (start, array) {
		for (var index = 0; index < array.length; index++) {
			this.indices[start + index] = array[index].index;
		}
	}

	private Split(fromIndex: number, toIndex: number, direction: number): KDTreeCell {
		var pointCloud = this.cloud;
		function compare(a, b) {
			return (a.coord < b.coord) ? -1 : ((a.coord > b.coord) ? 1 : 0);
		}

		if (fromIndex < toIndex) {
			var nbItems = toIndex - fromIndex;

			//Sort the indices in increasing coordinate order (given the current direction)
			var subIndices = this.GetIndices(fromIndex, nbItems, direction);
			subIndices = subIndices.sort(compare);
			this.SetIndices(fromIndex, subIndices);

			var cellData = new KDTreeCell(fromIndex, toIndex, direction);

			if (nbItems >= 30) {
				var cutIndex = Math.ceil(nbItems / 2);
				var nextDirection = (direction + 1) % 3;
				cellData.cutValue = (subIndices[cutIndex - 1].coord + subIndices[cutIndex].coord) / 2.0;

				cutIndex += fromIndex;
				var left = this.Split(fromIndex, cutIndex, nextDirection);
				var right = this.Split(cutIndex, toIndex, nextDirection);
				if (left && right) {
					cellData.left = left;
					cellData.right = right;
				}
			}
			return cellData;
		}

		return null;
	}

	FindNearestNeighbours(queryPoint: Vector, nbh: Neighbourhood, cell: KDTreeCell=null) {
		if (!cell) {
			cell = this.root;
			nbh.Initialize(this.cloud, queryPoint);
		}


		//Handle inner nodes
		if (cell.left && cell.right) {
			var distToThreshold = Math.abs(queryPoint.Get(cell.direction) - cell.cutValue);

			//Determine which cell should be explored first
			var first = cell.right;
			var second = cell.left;
			if (queryPoint.Get(cell.direction) < cell.cutValue) {
				first = cell.left;
				second = cell.right;
			}

			//Explore cells
			this.FindNearestNeighbours(queryPoint, nbh, first);
			if (nbh.Accept(distToThreshold)) {
				this.FindNearestNeighbours(queryPoint, nbh, second);
			}
		}
		//Handle leaves
		else {
			for (var index = cell.fromIndex; index < cell.toIndex; index++) {
				nbh.Push(this.indices[index]);
			}
		}

		return nbh.Neighbours();
	}

	ExtractSamples(nbSamples : number, cell: KDTreeCell=null) : number[]
	{
		if(nbSamples == 0)
			return [];
		if(!cell)
			cell = this.root;

		let nbItems = cell.toIndex - cell.fromIndex;
		if(nbSamples == 1)
		{
			let index = cell.fromIndex + Math.floor(Math.random() * nbItems)
			return [this.indices[index]];
		}
		else if(cell.left && cell.right)
		{
			let nbLeft = Math.floor(nbSamples / 2);
			let nbRight = nbSamples - nbLeft;
			let samples = this.ExtractSamples(nbLeft, cell.left);
			samples = samples.concat(this.ExtractSamples(nbRight, cell.right));
			return samples;
		}
		else
		{
			let candidates = new Array<number>(nbItems);
			for(let index=cell.fromIndex; index<cell.toIndex; index++)
				candidates[index] = this.indices[cell.toIndex + index];

			let samples : number[] = [];
			while(samples.length < nbSamples && candidates.length > 0)
			{
				let index = Math.floor(Math.random() * candidates.length);
				samples.push(candidates[index]);
				candidates[index] = candidates[candidates.length - 1]
				candidates.splice(candidates.length-1, 1);
			}
			return samples;
		}
	}

	Log(cellData): string {
		if (!cellData) {
			cellData = this.root;
		}

		let xmlNode = '';
		if (cellData) {
			xmlNode = '<node from="' + cellData.fromIndex + '" to="' + cellData.toIndex + '" dir="' + cellData.direction + '"';
			if ('cutValue' in cellData) {
				xmlNode += ' cut="' + cellData.cutValue + '"';
			}
			xmlNode += '>';
			if (cellData.left) {
				xmlNode += this.Log(cellData.left);
			}
			if (cellData.right) {
				xmlNode += this.Log(cellData.right);
			}
			xmlNode += '</node>';
		}

		return xmlNode;
	}
}

class KDTreeCell {
	cutValue: number;
	right: KDTreeCell;
	left: KDTreeCell;

	constructor(public fromIndex: number, public toIndex: number, public direction: number) {
		this.right = null;
		this.left = null;
	}
}