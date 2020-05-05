var QRDecomposition = /** @class */ (function () {
    function QRDecomposition(matrix) {
        //Naive method :
        //https://en.wikipedia.org/wiki/QR_decomposition
        if (matrix.width != matrix.height) {
            throw 'Cannot compute QR decomposition for non square matrix';
        }
        this.Q = Matrix.Null(matrix.width, matrix.width);
        this.R = Matrix.Null(matrix.width, matrix.width);
        var vects = [];
        var normalized = [];
        for (var ii = 0; ii < matrix.width; ii++) {
            var vec = matrix.GetColumnVector(ii);
            var current = vec;
            if (ii > 0) {
                //Compute vec - sum[jj<ii](proj(vects[jj], vec))
                for (var jj_1 = 0; jj_1 < ii; jj_1++) {
                    var proj = vects[jj_1].Times(vects[jj_1].Dot(vec) / vects[jj_1].Dot(vects[jj_1]));
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
    return QRDecomposition;
}());
//# sourceMappingURL=qrdecomposition.js.map