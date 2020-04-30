var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ComputeNormalsAction = (function (_super) {
    __extends(ComputeNormalsAction, _super);
    function ComputeNormalsAction(cloud, onDone) {
        _super.call(this, 'Compute normals');
        this.callback = function () {
            cloud.ComputeNormals(0, onDone);
        };
    }
    return ComputeNormalsAction;
}(Action));
var ClearNormalsAction = (function (_super) {
    __extends(ClearNormalsAction, _super);
    function ClearNormalsAction(cloud, onDone) {
        _super.call(this, 'Clear normals');
        this.callback = function clearNormalCallback() {
            cloud.ClearNormals();
            if (onDone)
                onDone();
        };
    }
    return ClearNormalsAction;
}(Action));
var GaussianSphereAction = (function (_super) {
    __extends(GaussianSphereAction, _super);
    function GaussianSphereAction(cloud, onDone) {
        _super.call(this, 'Compute gaussian sphere');
        if (cloud.HasNormals()) {
            this.callback = function () {
                var gsphere = cloud.GaussianSphere();
                if (onDone)
                    onDone(gsphere);
            };
        }
    }
    return GaussianSphereAction;
}(Action));
//# sourceMappingURL=pointcloudnormals.js.map