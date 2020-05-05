var Polynomial = /** @class */ (function () {
    //Coefs are given from lowest degree to higher degree
    function Polynomial(coefficients) {
        this.coefficients = coefficients;
    }
    Polynomial.prototype.Degree = function () {
        return this.coefficients.length - 1;
    };
    Polynomial.prototype.Evaluate = function (x) {
        var index = this.coefficients.length - 1;
        var result = index >= 0 ? this.coefficients[index] : 0.0;
        while (index > 0) {
            index--;
            result = result * x + this.coefficients[index];
        }
        return result;
    };
    Polynomial.prototype.Derivate = function () {
        var coefs = [];
        for (var index = 1; index < this.coefficients.length; index++) {
            coefs.push(index * this.coefficients[index]);
        }
        return new Polynomial(coefs);
    };
    //Devide current polynomial by (x - a)
    Polynomial.prototype.Deflate = function (a) {
        var index = this.coefficients.length - 1;
        var coef = [];
        var remainder = 0.0;
        if (index > 0) {
            coef = new Array(index);
            remainder = this.coefficients[index];
            do {
                index--;
                coef[index] = remainder;
                remainder = this.coefficients[index] + remainder * a;
            } while (index > 0);
        }
        return new Polynomial(coef);
    };
    Polynomial.prototype.FindRealRoots = function (initialGuess) {
        var result = [];
        var degree = this.Degree();
        var root = initialGuess;
        var polynomial = this;
        while (root != null && result.length < degree) {
            var firstOrderDerivative = polynomial.Derivate();
            var secondOrderDerivative = firstOrderDerivative.Derivate();
            var solver = new IterativeRootFinder([
                function (x) { return polynomial.Evaluate(x); },
                function (x) { return firstOrderDerivative.Evaluate(x); },
                function (x) { return secondOrderDerivative.Evaluate(x); }
            ]);
            root = solver.Run(root, IterativeRootFinder.HalleyStep);
            if (root !== null) {
                result.push(root);
                polynomial = polynomial.Deflate(root);
            }
        }
        return result;
    };
    return Polynomial;
}());
//# sourceMappingURL=polynomials.js.map