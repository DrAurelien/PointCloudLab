/// <reference path="../tools/dataprovider.ts" />
/// <reference path="vector.ts" />
/// <reference path="ludecomposition.ts" />


class Matrix {
	constructor(public width: number, public height: number, public values: Float32Array) {
	}

	//Common matrix Builders
	static Null(width: number, height: number): Matrix {
		let values = new Float32Array(width * height);
		for (let index = 0; index < values.length; index++) {
			values[index] = 0.0;
		}
		return new Matrix(width, height, values);
	}

	static Identity(dimension: number): Matrix {
		let result = Matrix.Null(dimension, dimension);
		for (let index = 0; index < dimension; index++) {
			result.SetValue(index, index, 1.0);
		}
		return result;
	}

	static Translation(v: Vector): Matrix {
		let result = Matrix.Identity(4);
		for (let index = 0; index < 3; index++) {
			result.SetValue(index, 3, v.Get(index));
		}
		return result;
	}

	static Rotation(axis: Vector, angle: number): Matrix {
		let result = Matrix.Identity(4);
		let c = Math.cos(angle);
		let s = Math.sin(angle);
		let x = axis.Get(0);
		let y = axis.Get(1);
		let z = axis.Get(2);

		result.SetValue(0, 0, x * x + (1 - (x * x)) * c);
		result.SetValue(0, 1, x * y * (1 - c) - z * s);
		result.SetValue(0, 2, x * z * (1 - c) + y * s);

		result.SetValue(1, 0, x * y * (1 - c) + z * s);
		result.SetValue(1, 1, y * y + (1 - (y * y)) * c);
		result.SetValue(1, 2, y * z * (1 - c) - x * s);

		result.SetValue(2, 0, x * z * (1 - c) - y * s);
		result.SetValue(2, 1, y * z * (1 - c) + x * s);
		result.SetValue(2, 2, z * z + (1 - (z * z)) * c);

		return result;
	}

	private FlatIndex(row: number, col: number): number {
		//Column-Major flat storage
		return row + col * this.width;
	}

	SetValue(row: number, col: number, value: number): void {
		this.values[this.FlatIndex(row, col)] = value;
	}

	AddValue(row: number, col: number, value: number): void {
		this.values[this.FlatIndex(row, col)] += value;
	}

	GetValue(row: number, col: number): number {
		return this.values[this.FlatIndex(row, col)];
	}

	Clone(): Matrix {
		return new Matrix(this.width, this.height, this.values.slice());
	}

	Times(s: number): Matrix {
		let result = new Float32Array(this.width * this.height);
		for (let index = 0; index < this.values.length; index++) {
			result[index] = this.values[index] * s;
		}
		return new Matrix(this.width, this.height, result);
	}

	Multiply(m: Matrix): Matrix {
		if (this.width != m.height) {
			throw 'Cannot multiply matrices whose dimension do not match';
		}
		let result = Matrix.Null(m.width, this.height);
		for (let ii = 0; ii < this.height; ii++) {
			for (let jj = 0; jj < m.width; jj++) {
				let value = 0;
				for (let kk = 0; kk < this.width; kk++) {
					value += this.GetValue(ii, kk) * m.GetValue(kk, jj);
				}
				result.SetValue(ii, jj, value);
			}
		}
		return result;
	}

	Plus(m: Matrix): Matrix {
		if (this.width != m.width || this.height != this.height) {
			throw 'Cannot add matrices whose dimension do not match';
		}
		let result = this.Clone();
		for (let index = 0; index < result.values.length; index++) {
			result.values[index] += m.values[index];
		}
		return result;
	}

	Transposed(): Matrix {
		let transposed = Matrix.Null(this.height, this.width);
		for (let ii = 0; ii < this.height; ii++) {
			for (let jj = 0; jj < this.width; jj++) {
				transposed.SetValue(jj, ii, this.GetValue(ii, jj));
			}
		}
		return transposed;
	}

	GetColumnVector(col: number, startrow: number = 0): Vector {
		let values = new Array(this.height - startrow);
		for (let index = startrow; index < this.height; index++) {
			values[index - startrow] = this.GetValue(index, col);
		}
		return new Vector(values);
	}

	SetColumnVector(col: number, v: Vector) {
		for (let index = 0; index < this.height; index++) {
			this.SetValue(index, col, v.Get(index));
		}
	}

	GetRowVector(row: number, startcol: number = 0): Vector {
		let values = new Array(this.width - startcol);
		for (let index = startcol; index < this.width; index++) {
			values[index - startcol] = this.GetValue(row, index);
		}
		return new Vector(values);
	}

	SetRowVector(row: number, v: Vector) {
		for (let index = 0; index < this.height; index++) {
			this.SetValue(row, index, v.Get(index));
		}
	}

	IsDiagonnal(error: number = 1.0e-10): boolean {
		for (let ii = 0; ii < this.height; ii++) {
			for (let jj = 0; jj < this.width; jj++) {
				if (ii != jj && Math.abs(this.GetValue(ii, jj)) > error) {
					return false;
				}
			}
		}
		return true;
	}

	//Solve THIS * X = rightHand (rightHand being a matrix)
	LUSolve(rightHand: Matrix): Matrix {
		if (rightHand.width != 1 || rightHand.height != this.width) {
			throw 'Cannot solve equations system, due to inconsistent dimensions';
		}

		let solution = Matrix.Null(rightHand.width, rightHand.height);
		for (let ii = 0; ii < rightHand.height; ii++) {
			solution.SetValue(ii, 0, rightHand.GetValue(ii, 0));
		}

		let LU = new LUDecomposition(this);

		//Solve L * Y = rightHand
		let kk = 0;
		for (let ii = 0; ii < rightHand.height; ii++) {
			let sum = solution.GetValue(LU.swaps[ii], 0);
			solution.SetValue(LU.swaps[ii], 0, solution.GetValue(ii, 0));
			if (kk != 0) {
				for (let jj = kk - 1; jj < ii; jj++) {
					sum -= LU.matrix.GetValue(ii, jj) * solution.GetValue(jj, 0);
				}
			}
			else if (sum != 0) {
				kk = ii + 1;
			}
			solution.SetValue(ii, 0, sum);
		}
		//Solve U * X = Y
		for (let ii = rightHand.height - 1; ii >= 0; ii--) {
			let sum = solution.GetValue(ii, 0);
			for (let jj = ii + 1; jj < rightHand.height; jj++) {
				sum -= LU.matrix.GetValue(ii, jj) * solution.GetValue(jj, 0);
			}
			solution.SetValue(ii, 0, sum / LU.matrix.GetValue(ii, ii));
		}
		return solution;
	}

	Log(): void {
		console.log('Matrix ' + this.height + ' x ' + this.width + ' : ');
		for (let ii = 0; ii < this.height; ii++) {
			let line = '| ';
			for (let jj = 0; jj < this.width; jj++) {
				line += this.GetValue(ii, jj) + ((jj + 1 < this.width) ? '; ' : '');
			}
			line += ' |';
			console.log(line);
		}
	}
}

//Extends N-D vector space with a (N+1)th "homegeneous" coordinate, for matrix multiplications
class Homogeneous extends Matrix {
	constructor(v: Vector, uniformcoord: number) {
		super(1, v.Dimension() + 1, new Float32Array(v.Flatten().concat(uniformcoord)));
	}

	static ToVector(m: Matrix): Vector {
		if (m.width != 1) {
			throw 'Matrix (' + m.width + 'x' + m.height + ') cannot be interpreted as a unifrom vector';
		}
		let s = m.height - 1;
		let c = new Array<number>(s);
		let f = m.GetValue(s, 0) || 1;
		for (let index = 0; index < s; index++) {
			c[index] = m.GetValue(index, 0) / f;
		}
		return new Vector(c);
	}
}

class HomogeneousVector extends Homogeneous {
	constructor(v: Vector) {
		super(v, 0.0);
	}
}

class HomogeneousPoint extends Homogeneous {
	constructor(v: Vector) {
		super(v, 1.0);
	}
}