var MeshFace = /** @class */ (function () {
    function MeshFace(indices, points) {
        this.indices = indices;
        this.points = points;
    }
    MeshFace.prototype.LineFaceIntersection = function (line) {
        //Compute line / face intersection
        //solve line.from + t * line.dir
        var dd = this.Normal.Dot(this.points[0]);
        var nn = line.dir.Dot(this.Normal);
        if (Math.abs(nn) < 1e-6) {
            return null;
        }
        var tt = (dd - line.from.Dot(this.Normal)) / nn;
        var point = line.from.Plus(line.dir.Times(tt));
        //Check the point is inside the triangle
        for (var ii = 0; ii < 3; ii++) {
            var test = point.Minus(this.points[ii]).Cross(this.points[(ii + 1) % 3].Minus(this.points[ii]));
            if (test.Dot(this.Normal) > 0) {
                return null;
            }
        }
        return tt;
    };
    Object.defineProperty(MeshFace.prototype, "Normal", {
        get: function () {
            if (!this.normal) {
                this.normal = this.points[1].Minus(this.points[0]).Cross(this.points[2].Minus(this.points[0])).Normalized();
            }
            return this.normal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MeshFace.prototype, "BoundingBox", {
        get: function () {
            if (!this.boundingbox) {
                this.boundingbox = new BoundingBox();
                for (var index = 0; index < this.points.length; index++) {
                    this.boundingbox.Add(this.points[index]);
                }
            }
            return this.boundingbox;
        },
        enumerable: true,
        configurable: true
    });
    MeshFace.prototype.IntersectBox = function (box) {
        //Separated axis theorem : search for a separation axis
        if (!this.BoundingBox.Intersect(box)) {
            return false;
        }
        //Todo : Normal cross edges ?
        return !box.TestAxisSeparation(this.points[0], this.Normal);
    };
    return MeshFace;
}());
