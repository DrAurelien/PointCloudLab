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
    return ScalarField;
}());
//# sourceMappingURL=scalarfield.js.map