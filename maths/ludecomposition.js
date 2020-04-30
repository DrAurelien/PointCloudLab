var LUDecomposition = (function () {
    function LUDecomposition(matrix) {
        if (matrix.width != matrix.height) {
            throw 'Cannot compute LU decomposition for non square matrix';
        }
        this.matrix = Matrix.Null(matrix.width, matrix.height);
        var factor = 1.0;
        this.swaps = new Array(matrix.width);
        for (var ii = 0; ii < matrix.height; ii++) {
            for (var jj = 0; jj < matrix.width; jj++) {
                this.matrix.SetValue(ii, jj, matrix.GetValue(ii, jj));
            }
        }
        //Search for the greatest element of each line
        var scale = new Array(this.matrix.width);
        for (var ii = 0; ii < this.matrix.height; ii++) {
            var maxval = 0;
            for (var jj = 0; jj < this.matrix.width; jj++) {
                var val = Math.abs(this.matrix.GetValue(ii, jj));
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
        for (var kk = 0; kk < this.matrix.width; kk++) {
            //Search for the largest pivot
            var maxval_1 = 0.0;
            var maxindex = kk;
            for (var ii = kk; ii < this.matrix.height; ii++) {
                var val = scale[ii] * Math.abs(this.matrix.GetValue(ii, kk));
                if (val > maxval_1) {
                    maxindex = ii;
                    maxval_1 = val;
                }
            }
            //Swap row so that current row has the best pivot
            if (kk != maxindex) {
                for (var jj = 0; jj < matrix.width; jj++) {
                    var tmp_1 = this.matrix.GetValue(maxindex, jj);
                    this.matrix.SetValue(maxindex, jj, this.matrix.GetValue(kk, jj));
                    this.matrix.SetValue(kk, jj, tmp_1);
                }
                var tmp = scale[maxindex];
                scale[maxindex] = scale[kk];
                scale[kk] = tmp;
                //Swap changes parity of the scale factore
                factor = -factor;
            }
            this.swaps[kk] = maxindex;
            for (var ii = kk + 1; ii < matrix.height; ii++) {
                var val = this.matrix.GetValue(ii, kk) / this.matrix.GetValue(kk, kk);
                this.matrix.SetValue(ii, kk, val);
                for (var jj = kk + 1; jj < matrix.width; jj++) {
                    this.matrix.SetValue(ii, jj, this.matrix.GetValue(ii, jj) - val * this.matrix.GetValue(kk, jj));
                }
            }
        }
    }
    LUDecomposition.prototype.GetValue = function (row, col) {
        return this.matrix.GetValue(row, col);
    };
    LUDecomposition.prototype.GetL = function () {
        var result = Matrix.Null(this.matrix.width, this.matrix.height);
        for (var ii = 0; ii < this.matrix.height; ii++) {
            result.SetValue(ii, ii, 1.0);
            for (var jj = 0; jj < ii; jj++) {
                result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
            }
        }
        return result;
    };
    LUDecomposition.prototype.GetU = function () {
        var result = Matrix.Null(this.matrix.width, this.matrix.height);
        for (var ii = 0; ii < this.matrix.height; ii++) {
            for (var jj = ii; jj <= this.matrix.width; jj++) {
                result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
            }
        }
        return result;
    };
    return LUDecomposition;
}());
//# sourceMappingURL=ludecomposition.js.map