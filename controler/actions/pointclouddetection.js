var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ResetDetectionAction = (function (_super) {
    __extends(ResetDetectionAction, _super);
    function ResetDetectionAction(cloud, onDone) {
        _super.call(this, 'Reset detection');
        this.callback = function () {
            cloud.ransac = null;
            if (onDone)
                onDone();
        };
    }
    return ResetDetectionAction;
}(Action));
var RansacDetectionAction = (function (_super) {
    __extends(RansacDetectionAction, _super);
    function RansacDetectionAction(cloud, onDone) {
        _super.call(this, 'Detect ' + (cloud.ransac ? 'another' : 'a') + ' shape');
        if (cloud.HasNormals()) {
            this.callback = function () {
                if (!cloud.ransac) {
                    cloud.ransac = new Ransac(cloud);
                    var dialog = new Dialog(function (properties) {
                        try {
                            cloud.ransac.nbFailure = parseInt(properties.GetValue('Failures'));
                            cloud.ransac.noise = parseFloat(properties.GetValue('Noise'));
                        }
                        catch (exc) {
                            return false;
                        }
                        var generators = [];
                        if (properties.GetValue('Planes')) {
                            generators.push(Ransac.RansacPlane);
                        }
                        if (properties.GetValue('Spheres')) {
                            generators.push(Ransac.RansacSphere);
                        }
                        if (properties.GetValue('Cylinders')) {
                            generators.push(Ransac.RansacCylinder);
                        }
                        cloud.ransac.SetGenerators(generators);
                        cloud.ransac.FindBestFittingShape(onDone);
                        return true;
                    }, function () {
                        cloud.ransac = null;
                        return true;
                    });
                    dialog.InsertValue('Failures', cloud.ransac.nbFailure);
                    dialog.InsertValue('Noise', cloud.ransac.noise);
                    dialog.InsertTitle('Shapes to detect');
                    dialog.InsertCheckBox('Planes', true);
                    dialog.InsertCheckBox('Spheres', true);
                    dialog.InsertCheckBox('Cylinders', true);
                }
                else {
                    cloud.ransac.FindBestFittingShape(onDone);
                }
            };
        }
    }
    return RansacDetectionAction;
}(Action));
//# sourceMappingURL=pointclouddetection.js.map