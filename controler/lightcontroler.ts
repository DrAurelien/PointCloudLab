/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
class LightControler extends MouseControler {
	public light : Light;

	constructor(view: PCLApp) {
		super(view);

		let item = this.view.dataHandler.currentItem;
		if (item && item instanceof Light) {
			this.light = <Light>item;

			this.view.sceneRenderer.camera.at = this.light.center;
			this.view.RefreshRendering();
		}
	}

	protected HandleMouseMove(displacement: MouseDisplacement): boolean {
		if (displacement.IsNull()) {
			return true;
		}

		let renderer = this.view.sceneRenderer;

		switch (displacement.button) {
			case 1: //Left mouse
				let x = this.mousetracker.x - displacement.dx;
				let y = this.mousetracker.y - displacement.dy;
				renderer.camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
				break;
			case 2: //Middle mouse
				renderer.camera.Zoom(-displacement.dy / 10);
				break;
			case 3: //Right mouse
				renderer.camera.Pan(displacement.dx, displacement.dy);
				break;
			default:
				return true;
		}
		this.light.center = renderer.camera.at;
		this.Cursor = Cursor.Light;
		this.view.RefreshRendering();

		return true;
	}

	protected HandleClick(tracker: MouseTracker): boolean {
		return true;
	}

	protected HandleWheel(delta: number): boolean {
		return true;
	}

	protected HandleKey(key: number): boolean {
		return true;
    }

	protected EndMouseEvent() {
		this.view.Refresh();
	}
}