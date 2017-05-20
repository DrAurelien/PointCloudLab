class ComputeNormalsAction extends Action {
	constructor(cloud: PointCloud, onDone: Function) {
		super('Compute normals');

		this.callback = function () {
			cloud.ComputeNormals(0, onDone);
		};
	}
}

class ClearNormalsAction extends Action {
	constructor(cloud: PointCloud, onDone: Function) {
		super('Clear normals');

		this.callback = function clearNormalCallback() {
			cloud.ClearNormals();
			if (onDone)
				onDone();
		};
	}
}

class GaussianSphereAction extends Action {
	constructor(cloud: PointCloud, onDone: Function) {
		super('Compute gaussian sphere');

		if (cloud.HasNormals()) {
			this.callback = function () {
				var gsphere = cloud.GaussianSphere();
				if (onDone)
					onDone(gsphere);
			};
		}
	}
}
