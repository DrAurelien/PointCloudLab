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
var Sphere = /** @class */ (function (_super) {
    __extends(Sphere, _super);
    function Sphere(center, radius, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Sphere'), owner) || this;
        _this.center = center;
        _this.radius = radius;
        return _this;
    }
    Sphere.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', this.center, false, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Radius', this.radius, this.GeometryChangeHandler(function (value) { return self.radius = value; })));
        return geometry;
    };
    ;
    Sphere.prototype.ComputeBoundingBox = function () {
        var size = new Vector([1, 1, 1]).Times(2 * this.radius);
        var bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    };
    Sphere.prototype.GetWorldToInnerBaseMatrix = function () {
        var matrix = Matrix.Identity(4);
        for (var index = 0; index < 3; index++) {
            matrix.SetValue(index, 3, -this.center.Get(index));
        }
        return matrix;
    };
    Sphere.prototype.GetInnerBaseToWorldMatrix = function () {
        var matrix = Matrix.Identity(4);
        for (var index = 0; index < 3; index++) {
            matrix.SetValue(index, 3, this.center.Get(index));
        }
        return matrix;
    };
    Sphere.prototype.ComputeMesh = function (sampling) {
        var halfSampling = Math.ceil(sampling / 2);
        var points = new PointCloud();
        points.Reserve(sampling * halfSampling + 2);
        points.PushPoint(this.center.Plus(new Vector([0, 0, this.radius])));
        points.PushPoint(this.center.Plus(new Vector([0, 0, -this.radius])));
        //Spherical coordinates
        for (var jj = 0; jj < halfSampling; jj++) {
            for (var ii = 0; ii < sampling; ii++) {
                var phi = ((jj + 1) * Math.PI) / (halfSampling + 1);
                var theta = 2.0 * ii * Math.PI / sampling;
                var radial = new Vector([
                    Math.cos(theta) * Math.sin(phi),
                    Math.sin(theta) * Math.sin(phi),
                    Math.cos(phi)
                ]);
                points.PushPoint(this.center.Plus(radial.Times(this.radius)));
            }
        }
        var mesh = new Mesh(points);
        mesh.Reserve(2 * sampling + (halfSampling - 1) * sampling);
        //North pole
        var northShift = 2;
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([0, ii + northShift, ((ii + 1) % sampling) + northShift]);
        }
        //South pole
        var southShift = (halfSampling - 1) * sampling + northShift;
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii + southShift, 1, ((ii + 1) % sampling) + southShift]);
        }
        //Strips
        for (var jj = 0; (jj + 1) < halfSampling; jj++) {
            var ja = jj * sampling;
            var jb = (jj + 1) * sampling;
            for (var ii = 0; ii < sampling; ii++) {
                var ia = ii;
                var ib = (ii + 1) % sampling;
                //            [ia]        [ib]
                //   [ja] ---- aa -------- ba
                //             |           |
                //   [jb] ---- ab -------- bb
                var aa = ia + ja + northShift;
                var ab = ia + jb + northShift;
                var bb = ib + jb + northShift;
                var ba = ib + ja + northShift;
                mesh.PushFace([aa, ab, ba]);
                mesh.PushFace([ba, ab, bb]);
            }
        }
        var self = this;
        mesh.ComputeNormals();
        return mesh;
    };
    Sphere.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
        var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
        //Solve [t] : sqrnorm(innerFrom[i]+t*innerDir[i])=radius
        var aa = 0;
        var bb = 0;
        var cc = 0;
        for (var index = 0; index < 3; index++) {
            aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
            bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
            cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
        }
        //Solve [t] : aa.t^2 + bb.t + cc = radius
        cc -= this.radius * this.radius;
        var dd = bb * bb - 4.0 * aa * cc;
        var result = new Picking(this);
        if (Math.abs(dd) < 0.0000001) {
            result.Add(-bb / 2.0 * aa);
        }
        else if (dd > 0.) {
            result.Add((-bb + Math.sqrt(dd)) / (2.0 * aa));
            result.Add((-bb - Math.sqrt(dd)) / (2.0 * aa));
        }
        return result;
    };
    Sphere.prototype.Distance = function (point) {
        return Math.abs(point.Minus(this.center).Norm() - this.radius);
    };
    Sphere.prototype.Rotate = function (rotation) {
    };
    Sphere.prototype.Translate = function (translation) {
        this.center = this.center.Plus(translation);
        this.Invalidate();
    };
    Sphere.prototype.Scale = function (scale) {
        this.radius *= scale;
        this.Invalidate();
    };
    return Sphere;
}(Shape));
//# sourceMappingURL=sphere.js.map