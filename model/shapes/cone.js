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
var Cone = /** @class */ (function (_super) {
    __extends(Cone, _super);
    function Cone(apex, axis, angle, height, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Cone'), owner) || this;
        _this.apex = apex;
        _this.axis = axis;
        _this.angle = angle;
        _this.height = height;
        return _this;
    }
    Cone.prototype.GetGeometry = function () {
        var _this = this;
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Apex', this.apex, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', this.axis, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Angle', Geometry.RadianToDegree(this.angle), self.GeometryChangeHandler(function (value) { return _this.angle = Geometry.DegreeToRadian(value); })));
        geometry.Push(new NumberProperty('Height', this.height, self.GeometryChangeHandler(function (value) { return _this.height = value; })));
        return geometry;
    };
    Cone.prototype.ComputeBoundingBox = function () {
        var radius = Math.tan(this.angle) * this.height;
        var size = new Vector([
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(0)))),
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(1)))),
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(2))))
        ]);
        var bb = new BoundingBox();
        bb.Set(this.apex.Plus(this.axis.Times(this.height)), size);
        bb.Add(this.apex);
        return bb;
    };
    Cone.prototype.Rotate = function (rotation) {
        var c = this.apex.Plus(this.axis.Times(this.height * 0.5));
        var a = rotation.Multiply(Matrix.FromVector(this.axis));
        this.axis = Matrix.ToVector(a);
        this.apex = c.Minus(this.axis.Times(this.height * 0.5));
        this.Invalidate();
    };
    Cone.prototype.Translate = function (translation) {
        this.apex = this.apex.Plus(translation);
        this.Invalidate();
    };
    Cone.prototype.Scale = function (scale) {
        this.height *= scale;
        this.Invalidate();
    };
    Cone.prototype.GetWorldToInnerBaseMatrix = function () {
        var translation = Matrix.Identity(4);
        var basechange = Matrix.Identity(4);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.axis.Get(index));
            translation.SetValue(index, 3, -this.apex.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Cone.prototype.ComputeMesh = function (sampling) {
        var points = new PointCloud();
        points.Reserve(1 + 3 * sampling);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        var radials = [];
        for (var ii = 0; ii < sampling; ii++) {
            var phi = 2.0 * ii * Math.PI / sampling;
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var radial = xx.Times(c).Plus(yy.Times(s));
            radials.push(radial.Times(this.angle));
        }
        var center = this.apex.Plus(this.axis.Times(this.height));
        points.PushPoint(center);
        //Face circle (double points for normals compuation)
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(center.Plus(radials[ii]));
        }
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(this.apex);
        }
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(center.Plus(radials[ii]));
        }
        var mesh = new Mesh(points);
        mesh.Reserve(2 * sampling);
        var shift = 1;
        //Face
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([0, ii + shift, ((ii + 1) % sampling) + shift]);
        }
        //Strips
        shift += sampling;
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii + shift + sampling, ii + shift, ((ii + 1) % sampling) + shift + sampling]);
            mesh.PushFace([ii + shift + sampling, ((ii + 1) % sampling) + shift, ((ii + 1) % sampling) + shift + sampling]);
        }
        var self = this;
        mesh.ComputeNormals();
        return mesh;
    };
    Cone.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = Matrix.ToVector(worldToBase.Multiply(Matrix.FromPoint(ray.from)));
        var innerDir = Matrix.ToVector(worldToBase.Multiply(Matrix.FromVector(ray.dir)));
        //having p[t] = (innerFrom[i]+t*innerDir[i])
        //Solve p[t].x^2+p[t].y^2-(p[t].z * tan(a))^2=0 for each i<3
        var aa = .0;
        var bb = .0;
        var cc = .0;
        var tana = Math.tan(this.angle);
        for (var index = 0; index < 3; index++) {
            var coef = (index == 2) ? (-tana * tana) : 1.0;
            aa += coef * innerDir.Get(index) * innerDir.Get(index);
            bb += coef * 2.0 * innerDir.Get(index) * innerFrom.Get(index);
            cc += coef * innerFrom.Get(index) * innerFrom.Get(index);
        }
        //Solve [t] aa.t^2 + bb.t + cc.t = 0
        var dd = bb * bb - 4.0 * aa * cc;
        var result = new Picking(this);
        var nbResults = 0;
        var height = this.height;
        function acceptValue(value) {
            var point = innerFrom.Plus(innerDir.Times(value));
            if (0 <= point.Get(2) && point.Get(2) <= height) {
                result.Add(value);
                nbResults++;
            }
        }
        if (Math.abs(dd) < 0.0000001) {
            acceptValue(-bb / 2.0 * aa);
        }
        else if (dd > 0.) {
            acceptValue((-bb + Math.sqrt(dd)) / (2.0 * aa));
            acceptValue((-bb - Math.sqrt(dd)) / (2.0 * aa));
        }
        if (nbResults < 2 && Math.abs(innerDir.Get(2)) > 0.000001) {
            var radius = tana * height;
            //test bounding disks
            //solve [t] : p[t].z = this.height
            var value = (this.height - innerFrom.Get(2)) / innerDir.Get(2);
            var point = innerFrom.Plus(innerDir.Times(value));
            if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (radius * radius)) {
                result.Add(value);
            }
        }
        return result;
    };
    Cone.prototype.Distance = function (point) {
        return 0.0;
    };
    Cone.prototype.ComputeBounds = function (points, cloud) {
        var min = 0;
        var max = 0;
        for (var ii = 0; ii < points.length; ii++) {
            var d = cloud.GetPoint(points[ii]).Minus(this.apex).Dot(this.axis);
            if (ii == 0 || d > max) {
                max = d;
            }
        }
        this.height = max;
    };
    return Cone;
}(Shape));
