/// <reference path="delegate.ts" />
/// <reference path="../../gui/objects/pclnode.ts" />
/// <reference path="../../gui/controls/dialog.ts" />


class ScanFromCurrentViewPointAction extends Action {
	static hSamplingTitle = 'Horizontal Sampling';
	static vSamplingTitle = 'Vertical Sampling';
	static Noise = 'Noise (% of time flight)';

	constructor(private group: PCLGroup, private deletgate: ActionDelegate) {
		super('Scan from current viewpoint', 'Create an new point cloud by simulating a LIDAR scanning of the group contents, from the current view point');
	}

	Enabled(): boolean {
		return this.group.IsScannable();
	}

	Trigger() {
		let self = this;
		let dialog = new Dialog(
			//Ok has been clicked
			(properties: Dialog) => {
				return self.LaunchScan(properties);
			},
			//Cancel has been clicked
			() => true
		);

		dialog.InsertValue(ScanFromCurrentViewPointAction.hSamplingTitle, 500);
		dialog.InsertValue(ScanFromCurrentViewPointAction.vSamplingTitle, 500);
		dialog.InsertValue(ScanFromCurrentViewPointAction.Noise, 0);
	}

	LaunchScan(properties: Dialog) {
		let hsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.hSamplingTitle));
		let vsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.vSamplingTitle));
		let noise = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.Noise));
		if (isNaN(hsampling) || isNaN(vsampling) ||isNaN(noise) || hsampling < 0 || vsampling < 0 || noise < 0 || noise > 100) {
			return false;
		}

		this.deletgate.ScanFromCurrentViewPoint(this.group, hsampling, vsampling, noise/100);
		return true;
	}
}