class ExportPointCloudFileAction extends Action {
	constructor(cloud: PointCloud, onDone: Function) {
		super('Export file');

		this.callback = function () {
			FileExporter.ExportFile(cloud.name + '.csv', cloud.GetCSVData(), 'text/csv');
		}
	}
}
