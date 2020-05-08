﻿class ScanFromCurrentViewPointAction extends Action {
	static hSamplingTitle = 'Horizontal Sampling';
	static vSamplingTitle = 'Vertical Sampling';

	constructor(private group: PCLGroup, private dataHandler: DataHandler, private onDone: CADNodeHandler) {
		super('Scan from current viewpoint', 'Create an new point cloud by simulating a LIDAR scanning of the group contents, from the current view point');
	}

	Enabled(): boolean {
		return this.group.IsScannable();
	}

	Run() {
		let self = this;
		let dialog = new Dialog(
			//Ok has been clicked
			(properties: Dialog) => {
				return self.LaunchScan(properties);
			},
			//Cancel has been clicked
			() => true
		);

		dialog.InsertValue(ScanFromCurrentViewPointAction.hSamplingTitle, 1084);
		dialog.InsertValue(ScanFromCurrentViewPointAction.vSamplingTitle, 768);
	}

	LaunchScan(properties: Dialog) {
		let hsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.hSamplingTitle));
		let vsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.vSamplingTitle));
		if (isNaN(hsampling) || isNaN(vsampling) || hsampling < 0 || vsampling < 0) {
			return false;
		}

		let self = this;
		this.dataHandler.GetSceneRenderer().ScanFromCurrentViewPoint(this.group, hsampling, vsampling,
			(cloud) => {
				self.group.Add(cloud);
				if (self.onDone) {
					self.onDone(cloud);
				}
			}
		);
		return true;
	}
}