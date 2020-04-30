class ScanFromCurrentViewPointAction extends Action {
	constructor(group: CADPrimitivesContainer, dataHandler: DataHandler, onDone: CADNodeHandler) {
		super('Scan from current viewpoint', null, 'Create an new point cloud by simulating a LIDAR scanning of the group contents, from the current view point');

		let hSamplingTitle = 'Horizontal Sampling';
		let vSamplingTitle = 'Vertical Sampling';

		if (group.IsScannable()) {
			this.callback = function () {
				let dialog = new Dialog(
					//Ok has been clicked
					(properties) => {
						let hsampling = parseInt(properties.GetValue(hSamplingTitle));
						let vsampling = parseInt(properties.GetValue(vSamplingTitle));
						if (isNaN(hsampling) || isNaN(vsampling) || hsampling < 0 || vsampling < 0) {
							return false;
						}

						dataHandler.GetSceneRenderer().ScanFromCurrentViewPoint(group, hsampling, vsampling,
							(cloud) => {
								group.Add(cloud);
								if (onDone) {
									onDone(cloud);
								}
							}
						);
						return true;
					},
					//Cancel has been clicked
					() => true
				);

				dialog.InsertValue(hSamplingTitle, 1084);
				dialog.InsertValue(vSamplingTitle, 768);
			}
		}
	}
}