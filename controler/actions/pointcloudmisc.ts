class ConnectedComponentsAction extends Action {
	constructor(private cloud: PointCloud, private onDone: CADNodeHandler) {
		super('Compute connected components', 'Split the point cloud into connected subsets');
	}

	Enabled(): boolean {
		return true;
	}

	Run() {
		this.cloud.ComputeConnectedComponents(30, this.onDone);
	}
}

class ComputeDensityAction extends Action {
	constructor(private cloud: PointCloud, private onDone: CADNodeHandler) {
		super('Compute density', 'Estimate the points density at each point of the cloud, and assign the corresponding scalar field');
	}

	Enabled(): boolean {
		return !this.cloud.GetScalarField(PointCloud.DensityFieldName);
	}

	Run() {
		this.cloud.ComputeDensity(30, this.onDone);
	}
}