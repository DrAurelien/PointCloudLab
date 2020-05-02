class QRDecomposition {
	Q: Matrix;
	R: Matrix;

	constructor(matrix: Matrix) {
		//Naive method :
		//https://en.wikipedia.org/wiki/QR_decomposition
		if (matrix.width != matrix.height) {
			throw 'Cannot compute QR decomposition for non square matrix';
		}

		this.Q = Matrix.Null(matrix.width, matrix.width);
		this.R = Matrix.Null(matrix.width, matrix.width);

		let vects: Vector[] = [];
		let normalized: Vector[] = [];
		for (let ii: number = 0; ii < matrix.width; ii++) {
			let vec: Vector = matrix.GetColumnVector(ii);
			let current: Vector = vec;
			if (ii > 0) {
				//Compute vec - sum[jj<ii](proj(vects[jj], vec))
				for (let jj: number = 0; jj < ii; jj++) {
					var proj = vects[jj].Times(vects[jj].Dot(vec) / vects[jj].Dot(vects[jj]));
					current = current.Minus(proj);
				}
			}
			vects.push(current);

			current = current.Normalized();
			normalized.push(current);
			for (var jj = 0; jj < vec.Dimension(); jj++) {
				this.Q.SetValue(jj, ii, current.Get(jj));
				if (jj <= ii) {
					this.R.SetValue(jj, ii, normalized[jj].Dot(vec));
				}
			}
		}
	}
}