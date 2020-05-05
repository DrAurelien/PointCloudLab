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
var ResetDetectionAction = /** @class */ (function (_super) {
    __extends(ResetDetectionAction, _super);
    function ResetDetectionAction(cloud, onDone) {
        var _this = _super.call(this, 'Reset detection') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ResetDetectionAction.prototype.Enabled = function () {
        return !!this.cloud.ransac;
    };
    ResetDetectionAction.prototype.Run = function () {
        this.cloud.ransac = null;
        if (this.onDone)
            this.onDone();
    };
    return ResetDetectionAction;
}(Action));
var RansacDetectionAction = /** @class */ (function (_super) {
    __extends(RansacDetectionAction, _super);
    function RansacDetectionAction(cloud, onDone) {
        var _this = _super.call(this, 'Detect ' + (cloud.ransac ? 'another' : 'a') + ' shape') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    RansacDetectionAction.prototype.Enabled = function () {
        return this.cloud.HasNormals();
    };
    RansacDetectionAction.prototype.Run = function () {
        if (!this.cloud.ransac) {
            var self_1 = this;
            this.cloud.ransac = new Ransac(this.cloud);
            var dialog = new Dialog(function (d) { return self_1.InitializeAndLauchRansac(d); }, function () {
                self_1.cloud.ransac = null;
                return true;
            });
            dialog.InsertValue('Failures', this.cloud.ransac.nbFailure);
            dialog.InsertValue('Noise', this.cloud.ransac.noise);
            dialog.InsertTitle('Shapes to detect');
            dialog.InsertCheckBox('Planes', true);
            dialog.InsertCheckBox('Spheres', true);
            dialog.InsertCheckBox('Cylinders', true);
        }
        else {
            this.cloud.ransac.FindBestFittingShape(this.onDone);
        }
    };
    RansacDetectionAction.prototype.InitializeAndLauchRansac = function (properties) {
        try {
            this.cloud.ransac.nbFailure = parseInt(properties.GetValue('Failures'));
            this.cloud.ransac.noise = parseFloat(properties.GetValue('Noise'));
        }
        catch (exc) {
            return false;
        }
        var generators = [];
        if (properties.GetValue('Planes'))
            generators.push(Ransac.RansacPlane);
        if (properties.GetValue('Spheres'))
            generators.push(Ransac.RansacSphere);
        if (properties.GetValue('Cylinders'))
            generators.push(Ransac.RansacCylinder);
        this.cloud.ransac.SetGenerators(generators);
        this.cloud.ransac.FindBestFittingShape(this.onDone);
        return true;
    };
    return RansacDetectionAction;
}(Action));
var ConnectedComponentsAction = /** @class */ (function (_super) {
    __extends(ConnectedComponentsAction, _super);
    function ConnectedComponentsAction(cloud, onDone) {
        var _this = _super.call(this, 'Compute connected components', 'Split the point cloud into connected subsets') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ConnectedComponentsAction.prototype.Enabled = function () {
        return true;
    };
    ConnectedComponentsAction.prototype.Run = function () {
        this.cloud.ComputeConnectedComponents(30, this.onDone);
    };
    return ConnectedComponentsAction;
}(Action));
//# sourceMappingURL=pointclouddetection.js.map