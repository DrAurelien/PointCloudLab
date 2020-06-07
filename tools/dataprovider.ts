interface DataProvider<DataType> {
	Size(): number;
	GetData(i: number): DataType;
}

abstract class PointSet implements DataProvider<Vector> {
	constructor() { }

	GetData(index: number): Vector {
		return this.GetPoint(index);
	}
	abstract GetPoint(index: number): Vector;
	abstract Size(): number;
}
