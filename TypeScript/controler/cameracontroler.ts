class CameraControler extends MouseControler {
	constructor(private view: Interface, private scene: Scene, targetElement: HTMLElement) {
		super(targetElement);
	}

	protected HandleMouseMove(displacement: MouseDisplacement): boolean {
		let renderer = this.view.sceneRenderer;

		switch (displacement.button) {
			case 1: //Left mouse
				renderer.camera.Rotate(displacement.dx, -displacement.dy);
				break;
			case 2: //Middle mouse
				renderer.camera.Zoom(-displacement.dy / 10);
				break;
			case 3: //Right mouse
				renderer.camera.Pan(displacement.dx, -displacement.dy);
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
				this.view.UpdateSelectedElement(selected, this.scene);
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