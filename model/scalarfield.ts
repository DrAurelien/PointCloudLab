class ScalarField {
	private values: number[];
	private nbvalues: number;

	constructor(public name: string) {
		this.values = [];
		this.nbvalues = 0;
	}

	Reserve(capacity: number) {
		let values = new Array(capacity);
		for (let index = 0; index < this.nbvalues; index++) {
			values[index] = this.values[index];
		}
		this.values = values;
	}

	GetValue(index: number): number {
		return this.values[index];
	}

	SetValue(index: number, value: number) {
		this.values[index] = value;
	}

	PushValue(value: number) {
		this.values[this.nbvalues] = value;
		this.nbvalues++;
	}

	Size(): number {
		return this.values.length;
	}
}