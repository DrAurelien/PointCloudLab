class ResetDetectionAction extends Action {
	constructor(private cloud: PointCloud, private onDone: Function) {
		super('Reset detection');
	}

	Enabled(): boolean {
		return !!this.cloud.ransac;
	}

	Run() {
		this.cloud.ransac = null;
		if (this.onDone)
			this.onDone();
	}
}

class RansacDetectionAction extends Action {
	constructor(private cloud: PointCloud, private onDone: Function) {
		super('Detect ' + (cloud.ransac ? 'another' : 'a') + ' shape');
	}

	Enabled() {
		return this.cloud.HasNormals();
	}

	Run() {
		if (!this.cloud.ransac) {
			let self = this;
			this.cloud.ransac = new Ransac(this.cloud);
			var dialog = new Dialog(
				(d: Dialog) => { return self.InitializeAndLauchRansac(d); },
				function () {
					self.cloud.ransac = null;
					return true;
				}
			);
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
	}

	InitializeAndLauchRansac(properties: Dialog): boolean {
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
	}
}