class Histogram {
	chunkcounters: number[];
	total: number;
	maxcounter: number;
	minvalue: number;
	maxvalue: number;

	constructor(values: ArrayLike<number>, nbchunks: number) {
		if (nbchunks <= 0) {
			throw "Invalid histogram parameter : " + nbchunks;
		}

		this.chunkcounters = new Array<number>(nbchunks);
		for (let index = 0; index < nbchunks; index++) {
			this.chunkcounters[index] = 0;
			if (index === 0 || values[index] < this.minvalue) {
				this.minvalue = values[index];
			}
			if (index === 0 || values[index] > this.maxvalue) {
				this.maxvalue = values[index];
			}
		}

		this.total = values.length;
		this.maxcounter = 0;

		let chunkwidth = (this.maxvalue - this.minvalue) / nbchunks;
		for (let index = 0; index < nbchunks; index++) {
			let chunkindex = Math.floor((values[index] - this.minvalue) / chunkwidth);
			this.chunkcounters[chunkindex]++;
			if (this.chunkcounters[chunkindex] > this.maxcounter) {
				this.maxcounter = this.chunkcounters[chunkindex];
			}
		}
	}

	Size(): number {
		return this.chunkcounters.length;
	}

	GetChunk(chunkindex: number = null): HistogramChunk {
		if (chunkindex === null) {
			return new HistogramChunk(
				this,
				this.minvalue,
				this.maxvalue,
				this.total);
		}
		let histowidth = this.maxvalue - this.minvalue;
		let chunkwidth = histowidth / this.chunkcounters.length;
		return new HistogramChunk(
			this,
			this.minvalue + (chunkindex * chunkwidth),
			this.minvalue + ((chunkindex + 1) * chunkwidth),
			this.chunkcounters[chunkindex]
		);
	}
}

class HistogramChunk {
	constructor(private histogram: Histogram, private from: number, private to: number, private count: number) { }

	GetStartingValue() {
		return this.from;
	}

	GetNormalizedStartingValue() {
		return (this.from - this.histogram.minvalue) / (this.histogram.maxvalue - this.histogram.minvalue);
	}

	GetEndingValue(): number {
		return this.to;
	}

	GetNormalizedEndingValue(): number {
		return (this.to - this.histogram.minvalue) / (this.histogram.maxvalue - this.histogram.minvalue);
	}

	GetWidth(): number {
		return this.from - this.to;
	}

	GetNormalizedWidth(): number {
		return this.GetWidth() / (this.histogram.maxvalue - this.histogram.minvalue);

	}

	GetCount(): number {
		return this.count;
	}

	GetNormalizedCount() : number {
		return this.count / this.histogram.total;
	}

	GetMaxNormalizedCount(): number {
		return this.count /= this.histogram.maxcounter;
	}
}