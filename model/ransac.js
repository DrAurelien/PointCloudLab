var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Ransac = /** @class */ (function () {
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
        var step = new RansacStepProcessor(this);
        step.SetNext(function (s) { return onDone(s.best.shape); });
        step.Start();
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
var PickedPoints = /** @class */ (function () {
    function PickedPoints(index, point, normal) {
        this.index = index;
        this.point = point;
        this.normal = normal;
    }
    return PickedPoints;
}());
var Candidate = /** @class */ (function () {
    function Candidate(score, points, shape) {
        this.score = score;
        this.points = points;
        this.shape = shape;
    }
    return Candidate;
}());
var RansacStepProcessor = /** @class */ (function (_super) {
    __extends(RansacStepProcessor, _super);
    function RansacStepProcessor(ransac) {
        var _this = _super.call(this, 'Searching for a shape') || this;
        _this.ransac = ransac;
        return _this;
    }
    Object.defineProperty(RansacStepProcessor.prototype, "Done", {
        get: function () {
            return this.nbTrials >= this.ransac.nbFailure;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RansacStepProcessor.prototype, "Current", {
        get: function () {
            return this.progress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RansacStepProcessor.prototype, "Target", {
        get: function () {
            return this.ransac.nbFailure;
        },
        enumerable: true,
        configurable: true
    });
    RansacStepProcessor.prototype.Step = function () {
        var points = this.ransac.PickPoints();
        var candidate = this.ransac.GenerateCandidate(points);
        this.nbTrials++;
        if (this.nbTrials > this.progress) {
            this.progress = this.nbTrials;
        }
        if (candidate != null) {
            if (this.best == null || this.best.score > candidate.score) {
                this.best = candidate;
                this.nbTrials = 0;
            }
        }
    };
    RansacStepProcessor.prototype.Finalize = function () {
        this.best.shape.ComputeBounds(this.best.points, this.ransac.cloud);
        for (var index = 0; index < this.best.points.length; index++) {
            this.ransac.ignore[this.best.points[index]] = true;
        }
    };
    return RansacStepProcessor;
}(LongProcess));
//# sourceMappingURL=ransac.js.map