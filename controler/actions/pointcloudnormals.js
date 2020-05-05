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
var ComputeNormalsAction = /** @class */ (function (_super) {
    __extends(ComputeNormalsAction, _super);
    function ComputeNormalsAction(cloud, onDone) {
        var _this = _super.call(this, 'Compute normals', 'Compute the vectors normal to the surface sampled by this point cloud') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ComputeNormalsAction.prototype.Enabled = function () {
        return !this.cloud.HasNormals();
    };
    ComputeNormalsAction.prototype.Run = function () {
        this.cloud.ComputeNormals(0, this.onDone);
    };
    return ComputeNormalsAction;
}(Action));
var ClearNormalsAction = /** @class */ (function (_super) {
    __extends(ClearNormalsAction, _super);
    function ClearNormalsAction(cloud, onDone) {
        var _this = _super.call(this, 'Clear normals', 'Clear previously computed normals') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ClearNormalsAction.prototype.Enabled = function () {
        return this.cloud.HasNormals();
    };
    ClearNormalsAction.prototype.Run = function () {
        this.cloud.ClearNormals();
        if (this.onDone)
            this.onDone();
    };
    return ClearNormalsAction;
}(Action));
var GaussianSphereAction = /** @class */ (function (_super) {
    __extends(GaussianSphereAction, _super);
    function GaussianSphereAction(cloud, onDone) {
        var _this = _super.call(this, 'Compute gaussian sphere', 'Builds en new point cloud made of the point cloud normals. The resulting point cloud will sample the unit sphere (since normals are unit vectors) - hence the name.') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    GaussianSphereAction.prototype.Enabled = function () {
        return this.cloud.HasNormals();
    };
    GaussianSphereAction.prototype.Run = function () {
        var gsphere = this.cloud.GaussianSphere();
        if (this.onDone)
            this.onDone(gsphere);
    };
    return GaussianSphereAction;
}(Action));
//# sourceMappingURL=pointcloudnormals.js.map