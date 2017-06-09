﻿class CameraModeAction extends Action {
	constructor(private view: Interface) {
		super('Switch to camera mode', function (onDone) {
			view.UseCameraControler();
		}, 'The mouse can be used to control the position of the camera');
	}

	HasAction(): boolean {
		return !(this.view.currentControler instanceof CameraControler);
	}
}

class TransformModeAction extends Action {
	constructor(private view: Interface) {
		super('Switch to transformation mode', function (onDone) {
			view.UseTransformationControler();
		}, 'The mouse can be used to control the geometry of the selected item');
	}

	HasAction(): boolean {
		return !(this.view.currentControler instanceof TransformControler);
	}
 }

class LightModeAction extends Action {
	constructor(private view: Interface) {
		super('Switch to light mode', function (onDone) {
			view.UseLightControler();
		}, 'The mouse can be used to control the position of the selected light');
	}

	HasAction(): boolean {
		let item = this.view.dataHandler.currentItem;
		if (!(item && (item instanceof Light))) {
			return false;
		}
		return !(this.view.currentControler instanceof TransformControler);
	}
}
