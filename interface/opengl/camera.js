var ScreenDimensions = (function () {
    function ScreenDimensions(width, height) {
        this.width = width;
        this.height = height;
    }
    return ScreenDimensions;
}());
var Base = (function () {
    function Base(right, up, lookAt, distance) {
        this.right = right;
        this.up = up;
        this.lookAt = lookAt;
        this.distance = distance;
    }
    return Base;
}());
var Camera = (function () {
    function Camera(context) {
        this.at = new Vector([10.0, 10.0, 10.0]);
        this.to = new Vector([.0, .0, .0]);
        this.up = new Vector([.0, 1.0, .0]);
        this.near = 0.001;
        this.far = 10000.0;
        this.fov = Math.PI / 4;
        this.InititalizeDrawingContext(context);
    }
    Camera.prototype.InititalizeDrawingContext = function (context) {
        //Screen size
        this.screen = new ScreenDimensions(context.renderingArea.width, context.renderingArea.height);
        //ModelView
        var modelview = this.GetModelViewMatrix();
        context.gl.uniformMatrix4fv(context.modelview, false, new Float32Array(modelview.values));
        //Projection
        var projection = this.GetProjectionMatrix();
        context.gl.uniformMatrix4fv(context.projection, false, new Float32Array(projection.values));
        //Lighting
        context.gl.uniform3fv(context.eyeposition, new Float32Array(this.at.Flatten()));
        context.gl.viewport(0, 0, this.screen.width, this.screen.height);
        context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT);
    };
    Camera.prototype.GetInnerBase = function () {
        var lookAt = this.to.Minus(this.at);
        var d = lookAt.Norm();
        lookAt = lookAt.Times(1. / d);
        var right = lookAt.Cross(this.up).Normalized();
        var up = right.Cross(lookAt).Normalized();
        return { right: right, up: up, lookAt: lookAt, distance: d };
    };
    Camera.prototype.GetModelViewMatrix = function () {
        var innerBase = this.GetInnerBase();
        var basechange = Matrix.Identity(4);
        var translation = Matrix.Identity(4);
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, innerBase.right.Get(index));
            basechange.SetValue(1, index, innerBase.up.Get(index));
            basechange.SetValue(2, index, -innerBase.lookAt.Get(index));
            translation.SetValue(index, 3, -this.at.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Camera.prototype.GetProjectionMatrix = function () {
        var aspectRatio = this.screen.width / this.screen.height;
        var projection = Matrix.Null(4, 4);
        var f = 1. / Math.tan(this.fov / 2.);
        projection.SetValue(0, 0, f / aspectRatio);
        projection.SetValue(1, 1, f);
        projection.SetValue(2, 2, -(this.near + this.far) / (this.far - this.near));
        projection.SetValue(2, 3, -(2.0 * this.near * this.far) / (this.far - this.near));
        projection.SetValue(3, 2, -1.0);
        return projection;
    };
    Camera.prototype.GetTranslationVector = function (dx, dy) {
        var f = Math.tan(this.fov / 2.0);
        var innerBase = this.GetInnerBase();
        var objectSpaceHeight = f * innerBase.distance;
        var objectSpaceWidth = objectSpaceHeight * this.screen.width / this.screen.height;
        var deltax = innerBase.right.Times(objectSpaceWidth * -dx / this.screen.width);
        var deltay = innerBase.up.Times(-(objectSpaceHeight * -dy / this.screen.height));
        return deltax.Plus(deltay);
    };
    Camera.prototype.Pan = function (dx, dy) {
        var delta = this.GetTranslationVector(dx, dy);
        this.at = this.at.Plus(delta);
        this.to = this.to.Plus(delta);
    };
    Camera.prototype.TrackBallProjection = function (x, y) {
        //Transform creen coordinates to inner trackball coordinates
        var point = new Vector([(x / this.screen.width) - 0.5, -((y / this.screen.height) - 0.5), 0]);
        var sqrnorm = point.SqrNorm();
        point.Set(2, (sqrnorm < 0.5) ? (1.0 - sqrnorm) : (0.5 / Math.sqrt(sqrnorm)));
        //compute scene coordinates instead of inner coordinates
        var innerBase = this.GetInnerBase();
        var result = innerBase.right.Times(point.Get(0));
        result = result.Plus(innerBase.up.Times(point.Get(1)));
        result = result.Plus(innerBase.lookAt.Times(-point.Get(2)));
        return result;
    };
    Camera.prototype.GetRotationMatrix = function (fromx, fromy, tox, toy) {
        var from = this.TrackBallProjection(fromx, fromy).Normalized();
        var to = this.TrackBallProjection(tox, toy).Normalized();
        var angle = Math.acos(from.Dot(to));
        var axis = to.Cross(from).Normalized();
        return Matrix.Rotation(axis, angle);
    };
    Camera.prototype.Rotate = function (fromx, fromy, tox, toy) {
        var rotation = this.GetRotationMatrix(fromx, fromy, tox, toy);
        var p = this.at.Minus(this.to);
        p = Matrix.ToVector(rotation.Multiply(Matrix.FromPoint(p)));
        this.at = this.to.Plus(p);
        this.up = Matrix.ToVector(rotation.Multiply(Matrix.FromVector(this.up)));
    };
    Camera.prototype.Zoom = function (d) {
        this.Distance *= Math.pow(0.9, d);
    };
    Camera.prototype.ComputeProjection = function (v, applyViewPort) {
        var u;
        if (v.Dimension() == 3)
            u = new Matrix(1, 4, v.Flatten().concat([1.0]));
        else
            u = new Matrix(1, 4, v.Flatten());
        var projection = this.GetProjectionMatrix();
        var modelview = this.GetModelViewMatrix();
        var render = projection.Multiply(modelview);
        var w = new Vector(render.Multiply(u).values);
        w = w.Times(1. / w.Get(3));
        if (applyViewPort) {
            w.Set(0, (w.Get(0) + 1.0) * this.screen.width / 2.0);
            w.Set(1, (w.Get(1) + 1.0) * this.screen.height / 2.0);
        }
        return w;
    };
    Camera.prototype.ComputeInvertedProjection = function (p) {
        var u;
        if (p.Dimension() == 3)
            u = new Matrix(1, 4, p.Flatten().concat([1.0]));
        else
            u = new Matrix(1, 4, p.Flatten());
        //First : screen to normalized screen coordinates
        u.SetValue(0, 0, 2.0 * u.GetValue(0, 0) / this.screen.width - 1.0);
        u.SetValue(1, 0, 1.0 - 2.0 * u.GetValue(1, 0) / this.screen.height);
        //Then : normalized screen to world coordinates
        var projection = this.GetProjectionMatrix();
        var modelview = this.GetModelViewMatrix();
        var render = projection.Multiply(modelview);
        var v = render.LUSolve(u);
        var w = new Vector([0, 0, 0]);
        for (var index = 0; index < 3; index++) {
            w.Set(index, v.GetValue(index, 0) / v.GetValue(3, 0));
        }
        return w;
    };
    Camera.prototype.CenterOnBox = function (box) {
        if (box && box.IsValid()) {
            var radius = box.GetSize().Norm() / 2.0;
            this.to = box.GetCenter();
            if (radius) {
                this.Distance = radius / Math.tan(this.fov / 2.);
            }
            return true;
        }
        return false;
    };
    Camera.prototype.GetDirection = function () {
        return this.to.Minus(this.at).Normalized();
    };
    Camera.prototype.SetDirection = function (dir, upv) {
        this.at = this.to.Minus(dir.Normalized().Times(this.Distance));
        this.up = upv;
    };
    Object.defineProperty(Camera.prototype, "Distance", {
        get: function () {
            return this.to.Minus(this.at).Norm();
        },
        set: function (d) {
            this.at = this.to.Minus(this.GetDirection().Times(d));
        },
        enumerable: true,
        configurable: true
    });
    return Camera;
}());
//# sourceMappingURL=camera.js.map