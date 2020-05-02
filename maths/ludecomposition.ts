class LUDecomposition {
	matrix: Matrix;
	swaps: number[];

	constructor(matrix: Matrix) {
		if (matrix.width != matrix.height) {
			throw 'Cannot compute LU decomposition for non square matrix';
		}
		this.matrix = Matrix.Null(matrix.width, matrix.height);
		let factor: number = 1.0;
		this.swaps = new Array(matrix.width);

		for (let ii: number = 0; ii < matrix.height; ii++) {
			for (let jj: number = 0; jj < matrix.width; jj++) {
				this.matrix.SetValue(ii, jj, matrix.GetValue(ii, jj));
			}
		}

		//Search for the greatest element of each line
		var scale = new Array(this.matrix.width);
		for (let ii: number = 0; ii < this.matrix.height; ii++) {
			var maxval = 0;
			for (let jj: number = 0; jj < this.matrix.width; jj++) {
				let val: number = Math.abs(this.matrix.GetValue(ii, jj));
				if (val > maxval) {
					maxval = val;
				}
			}
			if (maxval < 0.000001) {
				throw 'Cannot perform LU decomposition of a singular matrix';
			}
			scale[ii] = 1.0 / maxval;
		}

		//Main loop
		for (let kk: number = 0; kk < this.matrix.width; kk++) {
			//Search for the largest pivot
			let maxval: number = 0.0;
			let maxindex: number = kk;
			for (let ii: number = kk; ii < this.matrix.height; ii++) {
				let val: number = scale[ii] * Math.abs(this.matrix.GetValue(ii, kk));
				if (val > maxval) {
					maxindex = ii;
					maxval = val;
				}
			}
			//Swap row so that current row has the best pivot
			if (kk != maxindex) {
				for (let jj: number = 0; jj < matrix.width; jj++) {
					let tmp: number = this.matrix.GetValue(maxindex, jj);
					this.matrix.SetValue(maxindex, jj, this.matrix.GetValue(kk, jj));
					this.matrix.SetValue(kk, jj, tmp);
				}
				let tmp: number = scale[maxindex];
				scale[maxindex] = scale[kk];
				scale[kk] = tmp;
				//Swap changes parity of the scale factore
				factor = -factor;
			}
			this.swaps[kk] = maxindex;

			for (let ii: number = kk + 1; ii < matrix.height; ii++) {
				let val: number = this.matrix.GetValue(ii, kk) / this.matrix.GetValue(kk, kk);
				this.matrix.SetValue(ii, kk, val);
				for (let jj: number = kk + 1; jj < matrix.width; jj++) {
					this.matrix.SetValue(ii, jj, this.matrix.GetValue(ii, jj) - val * this.matrix.GetValue(kk, jj));
				}
			}
		}
	}

	GetValue(row: number, col: number): number {
		return this.matrix.GetValue(row, col);
	}

	GetL(): Matrix {
		let result: Matrix = Matrix.Null(this.matrix.width, this.matrix.height);
		for (let ii: number = 0; ii < this.matrix.height; ii++) {
			result.SetValue(ii, ii, 1.0);
			for (let jj: number = 0; jj < ii; jj++) {
				result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
			}
		}
		return result;
	}

	GetU(): Matrix {
		let result: Matrix = Matrix.Null(this.matrix.width, this.matrix.height);
		for (let ii: number = 0; ii < this.matrix.height; ii++) {
			for (let jj: number = ii; jj <= this.matrix.width; jj++) {
				result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
			}
		}
		return result;
	}
}