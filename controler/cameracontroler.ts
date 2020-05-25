/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="cursor.ts" />


/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
class CameraControler extends MouseControler {
	constructor(target: Controlable) {
		super(target);
	}

	protected HandleMouseMove(displacement: MouseDisplacement): boolean {
		if (displacement.IsNull()) {
			return true;
		}

		let camera = this.target.GetViewPoint();
		switch (displacement.button) {
			case 1: //Left mouse
				let x = this.mousetracker.x - displacement.dx;
				let y  = this.mousetracker.y - displacement.dy;
				camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
				this.target.NotifyViewPointChange(ViewPointChange.Rotation);
				this.Cursor = Cursor.Rotate;
				break;
			case 2: //Middle mouse
				camera.Zoom(-displacement.dy / 10);
				this.target.NotifyViewPointChange(ViewPointChange.Zoom);
				this.Cursor = Cursor.Scale;
				break;
			case 3: //Right mouse
				camera.Pan(displacement.dx, displacement.dy);
				this.target.NotifyViewPointChange(ViewPointChange.Panning);
				this.Cursor = Cursor.Translate;
				break;
			default:
				return true;
		}

		return true;
	}

	protected HandleClick(tracker: MouseTracker): boolean {
		switch (tracker.button) {
			case 1: //Left mouse
				this.target.PickItem(tracker.x, tracker.y, !tracker.ctrlKey);
				break;
			case 2: //Middle mouse
				this.target.FocusOnCurrentItem();
				break;
			default:
				return true;
		}
		return true;
	}

	protected HandleWheel(delta: number): boolean {
		let camera = this.target.GetViewPoint();
		camera.Zoom(-delta / 100);
		this.target.NotifyViewPointChange(ViewPointChange.Zoom);
		return true;
	}

	protected HandleKey(key: number): boolean {
		switch (key) {
			case 'p'.charCodeAt(0):
				this.target.ToggleRendering(RenderingMode.Point);
				break;
			case 'w'.charCodeAt(0):
				this.target.ToggleRendering(RenderingMode.Wire);
				break;
			case 's'.charCodeAt(0):
				this.target.ToggleRendering(RenderingMode.Surface);
				break;
			default:
				return true;
		}
		return true;
    }
}