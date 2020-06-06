/// <reference path="action.ts" />
/// <reference path="../cameracontroler.ts" />
/// <reference path="../transformcontroler.ts" />
/// <reference path="../lightcontroler.ts" />


class CameraModeAction extends Action {
	constructor(private target: Controlable) {
		super('Camera mode', 'The mouse can be used to control the position of the camera');
	}

	Trigger() {
		this.target.SetCurrentControler(new CameraControler(this.target));
	}

	Enabled(): boolean {
		return !(this.target.GetCurrentControler() instanceof CameraControler);
	}

	GetShortCut(): string {
		return 'C';
	}
}

class TransformModeAction extends Action {
	constructor(private target: Controlable) {
		super('Transformation mode', 'The mouse can be used to control the geometry of the selected item');
	}

	Trigger() {
		this.target.SetCurrentControler(new TransformControler(this.target));
	}

	Enabled(): boolean {
		if (!this.target.GetCurrentTransformable())
			return false;
		return !(this.target.GetCurrentControler() instanceof TransformControler);
	}

	GetShortCut(): string {
		return 'T';
	}
}

class LightModeAction extends Action {
	constructor(private target: Controlable) {
		super('Light mode', 'The mouse can be used to control the position of the selected light');
	}

	Trigger() {
		this.target.SetCurrentControler(new LightControler(this.target));
	}

	Enabled(): boolean {
		if (!this.target.GetLightPosition(false))
			return false;
		return !(this.target.GetCurrentControler() instanceof LightControler);
	}

	GetShortCut(): string {
		return 'L';
	}
}
