class ComputeNormalsAction extends Action {
	constructor(private cloud: PointCloud, private onDone: Function) {
		super('Compute normals', 'Compute the vectors normal to the surface sampled by this point cloud');
	}

	Enabled(): boolean {
		return !this.cloud.HasNormals();
	}

	Run() {
		this.cloud.ComputeNormals(0, this.onDone);
	}
}

class ClearNormalsAction extends Action {
	constructor(private cloud: PointCloud, private onDone: Function) {
		super('Clear normals', 'Clear previously computed normals');
	}

	Enabled(): boolean {
		return this.cloud.HasNormals();
	}

	Run() {
		this.cloud.ClearNormals();
		if (this.onDone)
			this.onDone();
	}
}

class GaussianSphereAction extends Action {
	constructor(private cloud: PointCloud, private onDone: Function) {
		super('Compute gaussian sphere', 'Builds en new point cloud made of the point cloud normals. The resulting point cloud will sample the unit sphere (since normals are unit vectors) - hence the name.');
	}

	Enabled(): boolean{
		return this.cloud.HasNormals();
	}

	Run() {
		let gsphere = this.cloud.GaussianSphere();
		if (this.onDone)
			this.onDone(gsphere);
	}
}