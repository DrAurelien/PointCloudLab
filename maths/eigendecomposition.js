var EigenElement = /** @class */ (function () {
    function EigenElement(eigenValue, eigenVector) {
        this.eigenValue = eigenValue;
        this.eigenVector = eigenVector;
    }
    return EigenElement;
}());
var EigenDecomposition = /** @class */ (function () {
    function EigenDecomposition(matrix) {
        if (matrix.width != matrix.height) {
            throw 'Cannot compute eigen decomposition for non square matrix';
        }
        var workMatrix = matrix.Clone();
        var eigenVectors = Matrix.Identity(matrix.width);
        for (var index = 0; index <= 200; index++) {
            var QR = new QRDecomposition(workMatrix);
            workMatrix = QR.R.Multiply(QR.Q);
            eigenVectors = eigenVectors.Multiply(QR.Q);
            if (workMatrix.IsDiagonnal(1.0e-8)) {
                break;
            }
        }
        //Return the best result we got, anyway (might not have converged in the main loop)
        var result = [];
        for (var ii = 0; ii < workMatrix.width; ii++) {
            result.push(new EigenElement(workMatrix.GetValue(ii, ii), eigenVectors.GetColumnVector(ii)));
        }
        function Compare(a, b) {
            return (a.eigenValue < b.eigenValue) ? -1 : ((a.eigenValue > b.eigenValue) ? 1 : 0);
        }
        result = result.sort(Compare);
        return result;
    }
    return EigenDecomposition;
}());
//# sourceMappingURL=eigendecomposition.js.map