var Vector = /** @class */ (function () {
    function Vector(coords) {
        this.Log = function () {
            var message = '| ';
            for (var index = 0; index < this.coordinates.length; index++) {
                message += this.coordinates[index] + ((index + 1 < this.coordinates.length) ? '; ' : '');
            }
            message += ' |';
            console.log(message);
        };
        this.coordinates = new Array(coords.length);
        for (var index = 0; index < coords.length; index++) {
            this.coordinates[index] = coords[index];
        }
    }
    Vector.prototype.Flatten = function () {
        return this.coordinates;
    };
    Vector.prototype.Dimension = function () {
        return this.coordinates.length;
    };
    Vector.prototype.Get = function (index) {
        return this.coordinates[index];
    };
    Vector.prototype.isNaN = function () {
        for (var index = 0; index < this.coordinates.length; index++) {
            if (isNaN(this.coordinates[index])) {
                return true;
            }
        }
        return false;
    };
    Vector.prototype.Set = function (index, value) {
        this.coordinates[index] = value;
    };
    //Sum of two vectors
    Vector.prototype.Plus = function (v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot add vectors with different dimensions';
        }
        var result = new Array(this.coordinates.length);
        for (var index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] + v.coordinates[index];
        }
        return new Vector(result);
    };
    //Difference between two vectors
    Vector.prototype.Minus = function (v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot compute difference between vectors with different dimensions';
        }
        var result = new Array(this.coordinates.length);
        for (var index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] - v.coordinates[index];
        }
        return new Vector(result);
    };
    //Multiply a vector by a scalar
    Vector.prototype.Times = function (s) {
        var result = new Array(this.coordinates.length);
        for (var index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] * s;
        }
        return new Vector(result);
    };
    //Dot product
    Vector.prototype.Dot = function (v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot compute difference between vectors with different dimensions';
        }
        var result = 0;
        for (var index = 0; index < this.coordinates.length; index++) {
            result += this.coordinates[index] * v.coordinates[index];
        }
        return result;
    };
    //Cross product (only for 3D vectors)
    Vector.prototype.Cross = function (v) {
        if (this.coordinates.length != 3) {
            throw 'Cross product only hold for 3D vectors';
        }
        return new Vector([
            this.coordinates[1] * v.coordinates[2] - this.coordinates[2] * v.coordinates[1],
            this.coordinates[2] * v.coordinates[0] - this.coordinates[0] * v.coordinates[2],
            this.coordinates[0] * v.coordinates[1] - this.coordinates[1] * v.coordinates[0]
        ]);
    };
    //Returns a vector orthogonnal to this one
    Vector.prototype.GetOrthogonnal = function () {
        var mindir = 0;
        var coords = [];
        for (var index = 0; index < this.coordinates.length; index++) {
            if (Math.abs(this.coordinates[index]) < Math.abs(this.coordinates[mindir])) {
                mindir = index;
            }
            coords.push(0.0);
        }
        var tmp = new Vector(coords);
        tmp.Set(mindir, 1.0);
        return this.Cross(tmp).Normalized();
    };
    //Comptute squared norm
    Vector.prototype.SqrNorm = function () {
        return this.Dot(this);
    };
    //Compute norm
    Vector.prototype.Norm = function () {
        return Math.sqrt(this.SqrNorm());
    };
    //Normalize current vector
    Vector.prototype.Normalized = function () {
        return this.Times(1 / this.Norm());
    };
    Vector.prototype.Normalize = function () {
        var norm = this.Norm();
        for (var index = 0; index < this.coordinates.length; index++) {
            this.coordinates[index] /= norm;
        }
    };
    return Vector;
}());
