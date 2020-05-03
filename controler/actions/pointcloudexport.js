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
var ExportPointCloudFileAction = /** @class */ (function (_super) {
    __extends(ExportPointCloudFileAction, _super);
    function ExportPointCloudFileAction(cloud, onDone) {
        var _this = _super.call(this, 'Export file') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ExportPointCloudFileAction.prototype.Enabled = function () {
        return true;
    };
    ExportPointCloudFileAction.prototype.Run = function () {
        FileExporter.ExportFile(this.cloud.name + '.csv', this.cloud.GetCSVData(), 'text/csv');
    };
    return ExportPointCloudFileAction;
}(Action));
