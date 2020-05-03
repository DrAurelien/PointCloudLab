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
var ScanFromCurrentViewPointAction = /** @class */ (function (_super) {
    __extends(ScanFromCurrentViewPointAction, _super);
    function ScanFromCurrentViewPointAction(group, dataHandler, onDone) {
        var _this = _super.call(this, 'Scan from current viewpoint', 'Create an new point cloud by simulating a LIDAR scanning of the group contents, from the current view point') || this;
        _this.group = group;
        _this.dataHandler = dataHandler;
        _this.onDone = onDone;
        return _this;
    }
    ScanFromCurrentViewPointAction.prototype.Enabled = function () {
        return this.group.IsScannable();
    };
    ScanFromCurrentViewPointAction.prototype.Run = function () {
        var self = this;
        var dialog = new Dialog(
        //Ok has been clicked
        function (properties) {
            return self.LaunchScan(properties);
        }, 
        //Cancel has been clicked
        function () { return true; });
        dialog.InsertValue(ScanFromCurrentViewPointAction.hSamplingTitle, 1084);
        dialog.InsertValue(ScanFromCurrentViewPointAction.vSamplingTitle, 768);
    };
    ScanFromCurrentViewPointAction.prototype.LaunchScan = function (properties) {
        var hsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.hSamplingTitle));
        var vsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.vSamplingTitle));
        if (isNaN(hsampling) || isNaN(vsampling) || hsampling < 0 || vsampling < 0) {
            return false;
        }
        var self = this;
        this.dataHandler.GetSceneRenderer().ScanFromCurrentViewPoint(this.group, hsampling, vsampling, function (cloud) {
            self.group.Add(cloud);
            if (self.onDone) {
                self.onDone(cloud);
            }
        });
        return true;
    };
    ScanFromCurrentViewPointAction.hSamplingTitle = 'Horizontal Sampling';
    ScanFromCurrentViewPointAction.vSamplingTitle = 'Vertical Sampling';
    return ScanFromCurrentViewPointAction;
}(Action));
