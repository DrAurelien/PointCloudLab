/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
class CameraControler extends MouseControler {
	constructor(view: Interface, private scene: Scene) {
		super(view);
	}

	protected HandleMouseMove(displacement: MouseDisplacement): boolean {
		if (displacement.IsNull()) {
			return true;
		}

		let renderer = this.view.sceneRenderer;

		switch (displacement.button) {
			case 1: //Left mouse
				let x = this.mousetracker.x - displacement.dx;
				let y  = this.mousetracker.y - displacement.dy;
				renderer.camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
				this.view.coordinatesSystem.Refresh();
				this.Cursor = Cursor.Rotate;
				break;
			case 2: //Middle mouse
				renderer.camera.Zoom(-displacement.dy / 10);
				this.Cursor = Cursor.Scale;
				break;
			case 3: //Right mouse
				renderer.camera.Pan(displacement.dx, displacement.dy);
				this.Cursor = Cursor.Translate;
				break;
			default:
				return true;
		}
		renderer.Draw(this.scene);

		return true;
	}

	protected HandleClick(tracker: MouseTracker): boolean {
		let renderer = this.view.sceneRenderer;

		switch (tracker.button) {
			case 1: //Left mouse
				let selected = renderer.PickObject(tracker.x, tracker.y, this.scene);
				this.scene.Select(selected);
				this.view.UpdateSelectedElement(selected);
				break;
			case 2: //Middle mouse
				let center = new CenterCameraAction(this.scene, this.view);
				center.Run();
				break;
			default:
				return true;
		}
		return true;
	}

	protected HandleWheel(delta: number): boolean {
		let renderer = this.view.sceneRenderer;

		renderer.camera.Zoom(delta / 100);
		renderer.Draw(this.scene);
		return true;
	}

	protected HandleKey(key: number): boolean {
		let renderer = this.view.sceneRenderer;

		switch (key) {
			case 'p'.charCodeAt(0):
				renderer.drawingcontext.rendering.Point(!renderer.drawingcontext.rendering.Point());
				break;
			case 'w'.charCodeAt(0):
				renderer.drawingcontext.rendering.Wire(!renderer.drawingcontext.rendering.Wire());
				break;
			case 's'.charCodeAt(0):
				renderer.drawingcontext.rendering.Surface(!renderer.drawingcontext.rendering.Surface());
				break;
			default:
				return true;
		}
		renderer.Draw(this.scene);
		return true;
    }
}