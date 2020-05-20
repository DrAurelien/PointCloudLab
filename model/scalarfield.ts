class ScalarField {
	public values: Float32Array;
	private nbvalues: number;
	private min: number;
	private max: number;

	constructor(values: Float32Array) {
		this.values = values || new Float32Array([]);
		this.nbvalues = this.values.length;
		this.min = null;
		this.max = null;
	}

	Reserve(capacity: number) {
		if (capacity > this.nbvalues) {
			let values = new Float32Array(capacity);
			for (let index = 0; index < this.nbvalues; index++) {
				values[index] = this.values[index];
			}
			this.values = values;
		}
	}

	GetValue(index: number): number {
		return this.values[index];
	}

	SetValue(index: number, value: number) {
		this.values[index] = value;
		if (this.min === null || value < this.min) {
			this.min = value;
		}
		if (this.max === null || value > this.max) {
			this.max = value;
		}
	}

	PushValue(value: number) {
		this.SetValue(this.nbvalues, value);
		this.nbvalues++;
	}

	Size(): number {
		return this.nbvalues;
	}

	Min(): number {
		if (this.min === null) {
			for (let index = 0; index < this.nbvalues; index++) {
				if (this.min === null || this.values[index] < this.min) {
					this.min = this.values[index];
				}
			}
		}
		return this.min;
	}

	Max(): number {
		if (this.max === null) {
			for (let index = 0; index < this.nbvalues; index++) {
				if (this.max === null || this.values[index] > this.max) {
					this.max = this.values[index];
				}
			}
		}
		return this.max;
	}
}