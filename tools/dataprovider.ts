interface DataProvider<DataType> {
	Size(): number;
	GetData(i: number): DataType;
}