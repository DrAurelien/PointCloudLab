var ScalarField = /** @class */ (function () {
    function ScalarField(name) {
        this.name = name;
        this.values = [];
        this.nbvalues = 0;
    }
    ScalarField.prototype.Reserve = function (capacity) {
        var values = new Array(capacity);
        for (var index = 0; index < this.nbvalues; index++) {
            values[index] = this.values[index];
        }
        this.values = values;
    };
    ScalarField.prototype.GetValue = function (index) {
        return this.values[index];
    };
    ScalarField.prototype.SetValue = function (index, value) {
        this.values[index] = value;
    };
    ScalarField.prototype.PushValue = function (value) {
        this.values[this.nbvalues] = value;
        this.nbvalues++;
    };
    ScalarField.prototype.Size = function () {
        return this.values.length;
    };
    ScalarField.prototype.Min = function () {
        if (this.nbvalues) {
            var min = this.values[0];
            for (var index = 1; index < this.nbvalues; index++) {
                if (this.values[index] < min)
                    min = this.values[index];
            }
            return min;
        }
        return null;
    };
    ScalarField.prototype.Max = function () {
        if (this.nbvalues) {
            var max = this.values[0];
            for (var index = 1; index < this.nbvalues; index++) {
                if (this.values[index] > max)
                    max = this.values[index];
            }
            return max;
        }
        return 0;
    };
    ScalarField.prototype.PrepareRendering = function (drawingContext) {
        if (!ScalarField.glScalarsBuffer) {
            ScalarField.glScalarsBuffer = drawingContext.gl.createBuffer();
        }
        if (ScalarField.glBufferedScalarField != this) {
            drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, ScalarField.glScalarsBuffer);
            drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.values), drawingContext.gl.STATIC_DRAW);
            drawingContext.gl.uniform1f(drawingContext.minscalarvalue, this.Min());
            drawingContext.gl.uniform1f(drawingContext.maxscalarvalue, this.Max());
            ScalarField.glBufferedScalarField = this;
        }
        drawingContext.gl.uniform1i(drawingContext.usescalars, 1);
        drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, ScalarField.glScalarsBuffer);
        drawingContext.gl.enableVertexAttribArray(drawingContext.scalarvalue);
        drawingContext.gl.vertexAttribPointer(drawingContext.scalarvalue, 1, drawingContext.gl.FLOAT, false, 0, 0);
    };
    ScalarField.ClearRendering = function (drawingContext) {
        drawingContext.gl.uniform1i(drawingContext.usescalars, 0);
        drawingContext.gl.disableVertexAttribArray(drawingContext.scalarvalue);
    };
    ScalarField.InvalidateBufferedField = function () {
        ScalarField.glBufferedScalarField = null;
    };
    ScalarField.glScalarsBuffer = null;
    ScalarField.glBufferedScalarField = null;
    return ScalarField;
}());
//# sourceMappingURL=scalarfield.js.map