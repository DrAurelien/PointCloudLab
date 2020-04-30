var Ransac = (function () {
    function Ransac(cloud, generators) {
        if (generators === void 0) { generators = null; }
        this.cloud = cloud;
        this.generators = generators;
        this.ComputeShapeScore = function (shape) {
            var score = {
                score: 0,
                points: []
            };
            for (var ii = 0; ii < this.cloud.Size(); ii++) {
                if (!this.ignore[ii]) {
                    var dist = shape.Distance(this.cloud.GetPoint(ii));
                    if (dist > this.noise) {
                        dist = this.noise;
                    }
                    else {
                        score.points.push(ii);
                    }
                    score.score += dist * dist;
                }
            }
            return score;
        };
        this.nbPoints = 3;
        this.nbFailure = 100;
        this.noise = 0.1;
        this.ignore = new Array(this.cloud.Size());
        for (var ii = 0; ii < this.cloud.Size(); ii++) {
            this.ignore[ii] = false;
        }
    }
    Ransac.prototype.SetGenerators = function (generators) {
        this.generators = generators;
    };
    Ransac.prototype.IsDone = function () {
        for (var ii = 0; ii < this.ignore.length; ii++) {
            if (!this.ignore[ii]) {
                return false;
            }
        }
        return true;
    };
    Ransac.prototype.FindBestFittingShape = function (onDone) {
        var progress = 0;
        var nbTrials = 0;
        var best = null;
        var ransac = this;
        function RansacStep() {
            if (nbTrials >= ransac.nbFailure) {
                return null;
            }
            var points = ransac.PickPoints();
            var candidate = ransac.GenerateCandidate(points);
            nbTrials++;
            if (nbTrials > progress) {
                progress = nbTrials;
            }
            if (candidate != null) {
                if (best == null || best.score > candidate.score) {
                    best = candidate;
                    nbTrials = 0;
                }
            }
            return { current: progress, total: ransac.nbFailure };
        }
        function FinalizeResult() {
            best.shape.ComputeBounds(best.points, ransac.cloud);
            for (var ii = 0; ii < best.points.length; ii++) {
                ransac.ignore[best.points[ii]] = true;
            }
            onDone(best.shape);
        }
        LongProcess.Run('Searching for a shape', RansacStep, FinalizeResult);
    };
    Ransac.prototype.PickPoints = function () {
        var points = [];
        while (points.length < this.nbPoints) {
            var index = Math.floor(Math.random() * this.cloud.Size());
            if (!this.ignore[index]) {
                for (var ii = 0; ii < points.length; ii++) {
                    if (index === points[ii].index)
                        index = null;
                }
                if (index != null && index < this.cloud.Size()) {
                    points.push(new PickedPoints(index, this.cloud.GetPoint(index), this.cloud.GetNormal(index)));
                }
            }
        }
        return points;
    };
    Ransac.prototype.GenerateCandidate = function (points) {
        //Generate a candidate shape
        var candidates = [];
        for (var ii = 0; ii < this.generators.length; ii++) {
            var shape = this.generators[ii](points);
            if (shape != null) {
                candidates.push(shape);
            }
        }
        //Compute scores and keep the best candidate
        var candidate = null;
        for (var ii = 0; ii < candidates.length; ii++) {
            var score = this.ComputeShapeScore(candidates[ii]);
            if (candidate == null || candidate.score > score.score) {
                candidate = {
                    score: score.score,
                    points: score.points,
                    shape: candidates[ii]
                };
            }
        }
        return candidate;
    };
    Ransac.RansacPlane = function (points) {
        var result = new Plane(points[0].point, points[0].normal, 0);
        return result;
    };
    Ransac.RansacSphere = function (points) {
        var r1 = new Ray(points[0].point, points[0].normal);
        var r2 = new Ray(points[1].point, points[1].normal);
        var center = Geometry.LinesIntersection(r1, r2);
        var radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());
        var result = new Sphere(center, radius);
        return result;
    };
    Ransac.RansacCylinder = function (points) {
        var r1 = new Ray(points[0].point, points[0].normal);
        var r2 = new Ray(points[1].point, points[1].normal);
        var center = Geometry.LinesIntersection(r1, r2);
        var axis = r1.dir.Cross(r2.dir);
        var radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());
        var result = new Cylinder(center, axis, radius, 1.0);
        return result;
    };
    return Ransac;
}());
var PickedPoints = (function () {
    function PickedPoints(index, point, normal) {
        this.index = index;
        this.point = point;
        this.normal = normal;
    }
    return PickedPoints;
}());
var Candidate = (function () {
    function Candidate(score, points, shape) {
        this.score = score;
        this.points = points;
        this.shape = shape;
    }
    return Candidate;
}());
//# sourceMappingURL=ransac.js.map