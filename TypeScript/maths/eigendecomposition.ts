class EigenElement {
    constructor(public eigenValue: number, public eigenVector: Vector) {
    }
}

class EigenDecomposition {
    constructor(matrix:Matrix) {
        if (matrix.width != matrix.height) {
            throw 'Cannot compute eigen decomposition for non square matrix';
        }

        let workMatrix: Matrix = matrix.Clone();
        let eigenVectors : Matrix = Matrix.Identity(matrix.width);
        for (let index : number = 0; index <= 200; index++) {
            let QR: QRDecomposition = new QRDecomposition(workMatrix);
            workMatrix = QR.R.Multiply(QR.Q);
            eigenVectors = eigenVectors.Multiply(QR.Q);

            if (workMatrix.IsDiagonnal(1.0e-8)) {
                break;
            }
        }
	
        //Return the best result we got, anyway (might not have converged in the main loop)
        let result: EigenElement[] = [];
        for (let ii : number = 0; ii < workMatrix.width; ii++) {
            result.push(new EigenElement(workMatrix.GetValue(ii, ii), eigenVectors.GetColumnVector(ii)));
        }

        function Compare(a: EigenElement, b: EigenElement) {
            return (a.eigenValue < b.eigenValue) ? -1 : ((a.eigenValue > b.eigenValue) ? 1 : 0);
        }
        result = result.sort(Compare);

        return result;
    }
}