var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ExportPointCloudFileAction = (function (_super) {
    __extends(ExportPointCloudFileAction, _super);
    function ExportPointCloudFileAction(cloud, onDone) {
        _super.call(this, 'Export file');
        this.callback = function () {
            FileExporter.ExportFile(cloud.name + '.csv', cloud.GetCSVData(), 'text/csv');
        };
    }
    return ExportPointCloudFileAction;
}(Action));
//# sourceMappingURL=pointcloudexport.js.map