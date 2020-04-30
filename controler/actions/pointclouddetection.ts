class ResetDetectionAction extends Action {
	constructor(cloud: PointCloud, onDone: Function) {
		super('Reset detection');

		this.callback = function () {
			cloud.ransac = null;
			if (onDone)
				onDone();
		};
	}
}

class RansacDetectionAction extends Action {
	constructor(cloud: PointCloud, onDone: Function) {
		super('Detect ' + (cloud.ransac ? 'another' : 'a') + ' shape');

		if (cloud.HasNormals()) {
			this.callback = function () {
				if (!cloud.ransac) {
					cloud.ransac = new Ransac(cloud);
					var dialog = new Dialog(
						function (properties) {
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
						},
						function () {
							cloud.ransac = null;
							return true;
						}
					);
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
			}
		}
	}
}