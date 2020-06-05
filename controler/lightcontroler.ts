/// <reference path="controler.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="cursor.ts" />


/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
class LightControler extends MouseControler {
	public light: LightingPosition;

	constructor(target: Controlable) {
		super(target);

		this.light = this.target.GetLightPosition(true);
		target.GetViewPoint().SetPosition(this.light.GetPosition());
		target.NotifyViewPointChange(ViewPointChange.Position);
	}

	protected HandleMouseMove(displacement: MouseDisplacement): boolean {
		if (displacement.IsNull()) {
			return true;
		}

		let camera = this.target.GetViewPoint();
		switch (displacement.button) {
			case 1: //Left mouse
				let x = this.mousetracker.x - displacement.dx;
				let y = this.mousetracker.y - displacement.dy;
				camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
				this.target.NotifyViewPointChange(ViewPointChange.Rotation);
				break;
			case 2: //Middle mouse
				camera.Zoom(-displacement.dy / 10);
				this.target.NotifyViewPointChange(ViewPointChange.Zoom);
				break;
			case 3: //Right mouse
				camera.Pan(displacement.dx, displacement.dy);
				this.target.NotifyViewPointChange(ViewPointChange.Panning);
				break;
			default:
				return true;
		}
		this.light.SetPositon(camera.GetPosition());
		this.Cursor = Cursor.Light;

		return true;
	}

	protected HandleClick(tracker: MouseTracker): boolean {
		return true;
	}

	protected HandleWheel(delta: number): boolean {
		return true;
	}
}