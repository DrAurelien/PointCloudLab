/// <reference path="action.ts" />
/// <reference path="../controler.ts" />


class CenterCameraAction extends Action {
	constructor(private target: Controlable) {
		super('Center camera on selection', 'Change the camera viewing direction so that it points to the selected object(s)');
	}

	Run() {
		this.target.FocusOnCurrentSelection();
	}

	Enabled(): boolean {
		return this.target.CanFocus();
	}
}