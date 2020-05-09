/// <reference path="action.ts" />
/// <reference path="../cameracontroler.ts" />
/// <reference path="../transformcontroler.ts" />
/// <reference path="../lightcontroler.ts" />
/// <reference path="../../gui/app.ts" />


class CameraModeAction extends Action {
	constructor(private app: PCLApp) {
		super('Camera mode', 'The mouse can be used to control the position of the camera');
	}

	Run() {
		this.app.SetCurrentControler(new CameraControler(this.app, this.app.dataHandler.scene));
	}

	Enabled(): boolean {
		return !(this.app.currentControler instanceof CameraControler);
	}
}

class TransformModeAction extends Action {
	constructor(private app: PCLApp) {
		super('Transformation mode', 'The mouse can be used to control the geometry of the selected item');
	}

	Run() {
		this.app.SetCurrentControler(new TransformControler(this.app, this.app.dataHandler.scene));
	}

	Enabled(): boolean {
		return !(this.app.currentControler instanceof TransformControler);
	}
}

class LightModeAction extends Action {
	constructor(private app: PCLApp) {
		super('Light mode', 'The mouse can be used to control the position of the selected light');
	}

	Run() {
		this.app.SetCurrentControler(new LightControler(this.app));
	}

	Enabled(): boolean {
		let item = this.app.dataHandler.currentItem;
		if (!(item && (item instanceof Light))) {
			return false;
		}
		return !(this.app.currentControler instanceof LightControler);
	}
}
