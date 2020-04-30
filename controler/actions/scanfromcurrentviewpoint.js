var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ScanFromCurrentViewPointAction = (function (_super) {
    __extends(ScanFromCurrentViewPointAction, _super);
    function ScanFromCurrentViewPointAction(group, dataHandler, onDone) {
        _super.call(this, 'Scan from current viewpoint', null, 'Create an new point cloud by simulating a LIDAR scanning of the group contents, from the current view point');
        var hSamplingTitle = 'Horizontal Sampling';
        var vSamplingTitle = 'Vertical Sampling';
        if (group.IsScannable()) {
            this.callback = function () {
                var dialog = new Dialog(
                //Ok has been clicked
                //Ok has been clicked
                function (properties) {
                    var hsampling = parseInt(properties.GetValue(hSamplingTitle));
                    var vsampling = parseInt(properties.GetValue(vSamplingTitle));
                    if (isNaN(hsampling) || isNaN(vsampling) || hsampling < 0 || vsampling < 0) {
                        return false;
                    }
                    dataHandler.GetSceneRenderer().ScanFromCurrentViewPoint(group, hsampling, vsampling, function (cloud) {
                        group.Add(cloud);
                        if (onDone) {
                            onDone(cloud);
                        }
                    });
                    return true;
                }, 
                //Cancel has been clicked
                //Cancel has been clicked
                function () { return true; });
                dialog.InsertValue(hSamplingTitle, 1084);
                dialog.InsertValue(vSamplingTitle, 768);
            };
        }
    }
    return ScanFromCurrentViewPointAction;
}(Action));
//# sourceMappingURL=scanfromcurrentviewpoint.js.map