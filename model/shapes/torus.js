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
var Torus = /** @class */ (function (_super) {
    __extends(Torus, _super);
    function Torus(center, axis, greatRadius, smallRadius, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Torus'), owner) || this;
        _this.center = center;
        _this.axis = axis;
        _this.greatRadius = greatRadius;
        _this.smallRadius = smallRadius;
        return _this;
    }
    Torus.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', this.center, false, this.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', this.axis, true, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Great Radius', this.greatRadius, this.GeometryChangeHandler(function (value) { return self.greatRadius = value; })));
        geometry.Push(new NumberProperty('Small Radius', this.smallRadius, this.GeometryChangeHandler(function (value) { return self.smallRadius = value; })));
        return geometry;
    };
    Torus.prototype.ComputeMesh = function (sampling) {
        var points = new PointCloud();
        points.Reserve(sampling * sampling);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        for (var ii = 0; ii < sampling; ii++) {
            var phi = 2.0 * ii * Math.PI / sampling;
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var radiusVect = xx.Times(c).Plus(yy.Times(s));
            var faceCenter = this.center.Plus(radiusVect.Times(this.greatRadius));
            for (var jj = 0; jj < sampling; jj++) {
                var theta = 2.0 * jj * Math.PI / sampling;
                var ct = Math.cos(theta);
                var st = Math.sin(theta);
                points.PushPoint(faceCenter.Plus(radiusVect.Times(this.smallRadius * ct)).Plus(this.axis.Times(this.smallRadius * st)));
            }
        }
        var mesh = new Mesh(points);
        mesh.Reserve(2 * sampling * sampling);
        for (var ii = 0; ii < sampling; ii++) {
            var ia = ii * sampling;
            var ib = ((ii + 1) % sampling) * sampling;
            for (var jj = 0; jj < sampling; jj++) {
                var ja = jj;
                var jb = ((jj + 1) % sampling);
                //            [ia]        [ib]
                //   [ja] ---- aa -------- ba
                //             |           |
                //   [jb] ---- ab -------- bb
                var aa = ia + ja;
                var ab = ia + jb;
                var bb = ib + jb;
                var ba = ib + ja;
                mesh.PushFace([ab, aa, ba]);
                mesh.PushFace([ab, ba, bb]);
            }
        }
        var self = this;
        mesh.ComputeNormals();
        return mesh;
    };
    Torus.prototype.ComputeBoundingBox = function () {
        var proj = new Vector([this.axis.Get(0), this.axis.Get(1)]);
        var size = new Vector([
            Math.sqrt(1 - (this.axis.Get(0) * this.axis.Get(0))) * this.greatRadius + this.smallRadius,
            Math.sqrt(1 - (this.axis.Get(1) * this.axis.Get(1))) * this.greatRadius + this.smallRadius,
            proj.Norm() * this.greatRadius + this.smallRadius
        ]);
        var bb = new BoundingBox();
        bb.Set(this.center, size.Times(2.0));
        return bb;
    };
    Torus.prototype.GetWorldToInnerBaseMatrix = function () {
        var translation = Matrix.Identity(4);
        var basechange = Matrix.Identity(4);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.axis.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Torus.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFromMatrix = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
        var innerDirMatrix = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
        var innerDir = new Vector([innerDirMatrix.GetValue(0, 0), innerDirMatrix.GetValue(1, 0), innerDirMatrix.GetValue(2, 0)]);
        var innerFrom = new Vector([innerFromMatrix.GetValue(0, 0), innerFromMatrix.GetValue(1, 0), innerFromMatrix.GetValue(2, 0)]);
        var grr = this.greatRadius * this.greatRadius;
        var srr = this.smallRadius * this.smallRadius;
        var alpha = innerDir.Dot(innerDir);
        var beta = 2.0 * innerDir.Dot(innerFrom);
        var gamma = innerFrom.Dot(innerFrom) + grr - srr;
        innerDir.Set(2, 0);
        innerFrom.Set(2, 0);
        var eta = innerDir.Dot(innerDir);
        var mu = 2.0 * innerDir.Dot(innerFrom);
        var nu = innerFrom.Dot(innerFrom);
        //Quartic defining the equation of the torus
        var quartic = new Polynomial([
            (gamma * gamma) - (4.0 * grr * nu),
            (2.0 * beta * gamma) - (4.0 * grr * mu),
            (beta * beta) + (2.0 * alpha * gamma) - (4.0 * grr * eta),
            2.0 * alpha * beta,
            alpha * alpha
        ]);
        var roots = quartic.FindRealRoots(this.center.Minus(ray.from).Dot(ray.dir));
        var result = new Picking(this);
        for (var index = 0; index < roots.length; index++) {
            result.Add(roots[index]);
        }
        return result;
    };
    Torus.prototype.Distance = function (point) {
        //TODO
        return 0;
    };
    Torus.prototype.Rotate = function (rotation) {
        var a = rotation.Multiply(Matrix.FromVector(this.axis));
        this.axis = Matrix.ToVector(a);
        this.Invalidate();
    };
    Torus.prototype.Translate = function (translation) {
        this.center = this.center.Plus(translation);
        this.Invalidate();
    };
    Torus.prototype.Scale = function (scale) {
        this.greatRadius *= scale;
        this.smallRadius *= scale;
        this.Invalidate();
    };
    return Torus;
}(Shape));
//# sourceMappingURL=torus.js.map