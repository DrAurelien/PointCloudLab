class Matrix {
    values: number[];

    constructor(public width: number, public height: number, values: number[]) {
        this.values = new Array(values.length);
        for (var index = 0; index < values.length; index++) {
            this.values[index] = values[index];
        }
    }

    //Common matrix Builders
    static Null(width: number, height: number): Matrix {
        var values = new Array(width * height);
        for (var index = 0; index < values.length; index++) {
            values[index] = 0.0;
        }
        return new Matrix(width, height, values);
    }

    static Identity(dimension: number): Matrix {
        var result = Matrix.Null(dimension, dimension);
        for (var index = 0; index < dimension; index++) {
            result.SetValue(index, index, 1.0);
        }
        return result;
    }

    static Translation(v: Vector): Matrix {
        var result = Matrix.Identity(4);
        for (var index = 0; index < 3; index++) {
            result.SetValue(index, 3, v.Get(index));
        }
        return result;
    }

    static Rotation(axis: Vector, angle: number): Matrix {
        var result = Matrix.Identity(4);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var x = axis.Get(0);
        var y = axis.Get(1);
        var z = axis.Get(2);

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

	static FromVector(v: Vector): Matrix {
		return new Matrix(1, v.Dimension()+1, v.Flatten().concat(0));
	}

	static FromPoint(p: Vector): Matrix {
		return new Matrix(1, p.Dimension() + 1, p.Flatten().concat(1));
	}

	static ToVector(m: Matrix): Vector {
		let s = m.height - 1;
		let c = new Array(s);
		for (let index = 0; index < s; index++) {
			c[index] = m.GetValue(index, 0);
		}
		return new Vector(c);
	}

    private FlatIndex(row: number, col: number): number {
        //Column-Major flat storage
        return row + col * this.width;
    }

    SetValue(row: number, col: number, value: number): void {
        this.values[this.FlatIndex(row, col)] = value;
    }

    GetValue(row: number, col: number): number {
        return this.values[this.FlatIndex(row, col)];
    }

    Clone(): Matrix {
        return new Matrix(this.width, this.height, this.values);
    }

    Times(s: number): Matrix {
        var result = new Array(this.width * this.height);
        for (var index = 0; index < this.values.length; index++) {
            result[index] = this.values[index] * s;
        }
        return new Matrix(this.width, this.height, result);
    }

    Multiply(m: Matrix): Matrix {
        if (this.width != m.height) {
            throw 'Cannot multiply matrices whose dimension do not match';
        }
        var result = Matrix.Null(m.width, this.height);
        for (var ii = 0; ii < this.height; ii++) {
            for (var jj = 0; jj < m.width; jj++) {
                var value = 0;
                for (var kk = 0; kk < this.width; kk++) {
                    value += this.GetValue(ii, kk) * m.GetValue(kk, jj);
                }
                result.SetValue(ii, jj, value);
            }
        }
        return result;
    }
	
    Transposed(): Matrix {
        var transposed = Matrix.Null(this.height, this.width);
        for (var ii = 0; ii < this.height; ii++) {
            for (var jj = 0; jj < this.width; jj++) {
                transposed.SetValue(jj, ii, this.GetValue(ii, jj));
            }
        }
        return transposed;
    }

    GetColumnVector(col: number): Vector {
        var values = new Array(this.height);
        for (var index = 0; index < this.height; index++) {
            values[index] = this.GetValue(index, col);
        }
        return new Vector(values);
    }

    GetRowVector(row: number): Vector {
        var values = new Array(this.width);
        for (var index = 0; index < this.width; index++) {
            values[index] = this.GetValue(row, index);
        }
        return new Vector(values);
    }

    IsDiagonnal(error: number): boolean {
        for (var ii = 0; ii < this.height; ii++) {
            for (var jj = 0; jj < this.width; jj++) {
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

        var solution = Matrix.Null(rightHand.width, rightHand.height);
        for (var ii = 0; ii < rightHand.height; ii++) {
            solution.SetValue(ii, 0, rightHand.GetValue(ii, 0));
        }

        var LU = new LUDecomposition(this);
	
        //Solve L * Y = rightHand
        var kk = 0;
        for (var ii = 0; ii < rightHand.height; ii++) {
            var sum = solution.GetValue(LU.swaps[ii], 0);
            solution.SetValue(LU.swaps[ii], 0, solution.GetValue(ii, 0));
            if (kk != 0) {
                for (var jj = kk - 1; jj < ii; jj++) {
                    sum -= LU.matrix.GetValue(ii, jj) * solution.GetValue(jj, 0);
                }
            }
            else if (sum != 0) {
                kk = ii + 1;
            }
            solution.SetValue(ii, 0, sum);
        }
        //Solve U * X = Y
        for (var ii = rightHand.height - 1; ii >= 0; ii--) {
            var sum = solution.GetValue(ii, 0);
            for (var jj = ii + 1; jj < rightHand.height; jj++) {
                sum -= LU.matrix.GetValue(ii, jj) * solution.GetValue(jj, 0);
            }
            solution.SetValue(ii, 0, sum / LU.matrix.GetValue(ii, ii));
        }
        return solution;
    }

    Log(): void {
        console.log('Matrix ' + this.height + ' x ' + this.width + ' : ');
        for (var ii = 0; ii < this.height; ii++) {
            var line = '| ';
            for (var jj = 0; jj < this.width; jj++) {
                line += this.GetValue(ii, jj) + ((jj + 1 < this.width) ? '; ' : '');
            }
            line += ' |';
            console.log(line);
        }
    }
}