class CameraModeAction extends Action {
	constructor(private view: Interface) {
		super('Camera mode', 'The mouse can be used to control the position of the camera');
	}

	Run() {
		this.view.UseCameraControler();
	}

	Enabled(): boolean {
		return !(this.view.currentControler instanceof CameraControler);
	}
}

class TransformModeAction extends Action {
	constructor(private view: Interface) {
		super('Transformation mode', 'The mouse can be used to control the geometry of the selected item');
	}

	Run() {
		this.view.UseTransformationControler();
	}

	Enabled(): boolean {
		return !(this.view.currentControler instanceof TransformControler);
	}
}

class LightModeAction extends Action {
	constructor(private view: Interface) {
		super('Light mode', 'The mouse can be used to control the position of the selected light');
	}

	Run() {
		this.view.UseLightControler();
	}

	Enabled(): boolean {
		let item = this.view.dataHandler.currentItem;
		if (!(item && (item instanceof Light))) {
			return false;
		}
		return !(this.view.currentControler instanceof LightControler);
	}
}
