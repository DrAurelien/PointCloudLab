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
var Plane = /** @class */ (function (_super) {
    __extends(Plane, _super);
    function Plane(center, normal, patchRadius, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Plane'), owner) || this;
        _this.center = center;
        _this.normal = normal;
        _this.patchRadius = patchRadius;
        return _this;
    }
    Plane.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', this.center, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Normal', this.normal, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Patch Radius', this.patchRadius, self.GeometryChangeHandler(function (value) { return self.patchRadius = value; })));
        return geometry;
    };
    Plane.prototype.ComputeMesh = function (sampling) {
        var points = new PointCloud();
        points.Reserve(sampling + 1);
        var xx = this.normal.GetOrthogonnal();
        var yy = this.normal.Cross(xx).Normalized();
        for (var ii = 0; ii < sampling; ii++) {
            var phi = 2.0 * ii * Math.PI / sampling;
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var radiusVect = xx.Times(c).Plus(yy.Times(s));
            points.PushPoint(this.center.Plus(radiusVect.Times(this.patchRadius)));
        }
        points.PushPoint(this.center);
        var mesh = new Mesh(points);
        mesh.Reserve(sampling);
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii, sampling, (ii + 1) % sampling]);
        }
        var self = this;
        mesh.ComputeNormals();
        return mesh;
    };
    Plane.prototype.Distance = function (point) {
        return Math.abs(point.Minus(this.center).Dot(this.normal));
    };
    Plane.prototype.Rotate = function (rotation) {
        var a = rotation.Multiply(Matrix.FromVector(this.normal));
        this.normal = Matrix.ToVector(a);
        this.Invalidate();
    };
    Plane.prototype.Translate = function (translation) {
        this.center = this.center.Plus(translation);
        this.Invalidate();
    };
    Plane.prototype.Scale = function (scale) {
        this.patchRadius *= scale;
        this.Invalidate();
    };
    Plane.prototype.ComputeBoundingBox = function () {
        var size = new Vector([
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(0)))),
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(1)))),
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(2))))
        ]);
        var bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    };
    Plane.prototype.GetWorldToInnerBaseMatrix = function () {
        var translation = Matrix.Identity(4);
        var basechange = Matrix.Identity(4);
        var xx = this.normal.GetOrthogonnal();
        var yy = this.normal.Cross(xx).Normalized();
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.normal.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Plane.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
        var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
        //solve [t] : p[t].z = 0
        var result = new Picking(this);
        var tt = -innerFrom.GetValue(2, 0) / innerDir.GetValue(2, 0);
        var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(tt));
        if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (this.patchRadius * this.patchRadius)) {
            result.Add(tt);
        }
        return result;
    };
    Plane.prototype.ComputeBounds = function (points, cloud) {
        this.center = new Vector([0, 0, 0]);
        for (var ii = 0; ii < points.length; ii++) {
            this.center = this.center.Plus(cloud.GetPoint(points[ii]));
        }
        this.center = this.center.Times(1.0 / points.length);
        this.patchRadius = 0;
        for (var ii = 0; ii < points.length; ii++) {
            var d = cloud.GetPoint(points[ii]).Minus(this.center).SqrNorm();
            if (d > this.patchRadius) {
                this.patchRadius = d;
            }
        }
        this.patchRadius = Math.sqrt(this.patchRadius);
    };
    return Plane;
}(Shape));
