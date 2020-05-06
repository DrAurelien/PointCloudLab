var IterativeRootFinder = /** @class */ (function () {
    function IterativeRootFinder(derivatives) {
        this.derivatives = derivatives;
        this.Run = function (initialGuess, step) {
            var current = initialGuess;
            for (var index = 0; index < this.maxIterations; index++) {
                var values = [];
                for (var order = 0; order < this.derivatives.length; order++) {
                    values.push(this.derivatives[order](current));
                }
                if (Math.abs(values[0]) <= this.resultTolerance)
                    return current;
                var delta = step(current, values);
                if (delta == null || Math.abs(delta) <= this.minStepMagnitude)
                    return null;
                current += delta;
            }
            return null;
        };
        this.maxIterations = 100;
        this.resultTolerance = 1.0e-7;
        this.minStepMagnitude = 1.0e-8;
    }
    IterativeRootFinder.NewtonRaphsonStep = function (x, derivativesValues) {
        if (Math.abs(derivativesValues[1]) < 1.0e-12) {
            return null;
        }
        return -derivativesValues[0] / derivativesValues[1];
    };
    IterativeRootFinder.HalleyStep = function (x, derivativesValues) {
        var delta = (2.0 * derivativesValues[1] * derivativesValues[1]) - (derivativesValues[0] * derivativesValues[2]);
        if (Math.abs(delta) < 1.0e-12) {
            return null;
        }
        return -2.0 * derivativesValues[0] * derivativesValues[1] / delta;
    };
    return IterativeRootFinder;
}());
//# sourceMappingURL=rootsfinding.js.map