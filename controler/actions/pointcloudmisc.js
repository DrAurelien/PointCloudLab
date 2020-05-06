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
var ComputeDensityAction = /** @class */ (function (_super) {
    __extends(ComputeDensityAction, _super);
    function ComputeDensityAction(cloud, onDone) {
        var _this = _super.call(this, 'Compute density', 'Estimate the points density at each point of the cloud, and assign the corresponding scalar field') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ComputeDensityAction.prototype.Enabled = function () {
        return !this.cloud.GetScalarField(PointCloud.DensityFieldName);
    };
    ComputeDensityAction.prototype.Run = function () {
        this.cloud.ComputeDensity(30, this.onDone);
    };
    return ComputeDensityAction;
}(Action));
//# sourceMappingURL=pointcloudmisc.js.map