class ExportPointCloudFileAction extends Action {
	constructor(private cloud: PointCloud, private onDone: Function) {
		super('Export file');
	}

	Enabled(): boolean {
		return true;
	}

	Run() {
		FileExporter.ExportFile(this.cloud.name + '.csv', this.cloud.GetCSVData(), 'text/csv');
	}
}
