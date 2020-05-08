class TransformControler extends MouseControler {
	constructor(view: PCLApp, private scene: Scene) {
		super(view);
	}

	protected HandleMouseMove(displacement: MouseDisplacement): boolean {
		if (displacement.IsNull()) {
			return true;
		}

		let datahandler = this.view.dataHandler;
		let renderer = this.view.sceneRenderer;

		if (!datahandler.currentItem || !(datahandler.currentItem instanceof Shape))
			return false;
		let item = <Shape>datahandler.currentItem;

		switch (displacement.button) {
			case 1: //Left mouse
				let x = this.mousetracker.x - displacement.dx;
				let y = this.mousetracker.y - displacement.dy;
				let rotation = renderer.camera.GetRotationMatrix(this.mousetracker.x, this.mousetracker.y, x, y);
				item.Rotate(rotation);
				this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Rotate]);
				break;
			case 2: //Middle mouse
				let scale = 1.0 - (displacement.dy / renderer.camera.screen.height);
				item.Scale(scale);
				this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Scale]);
				break;
			case 3: //Right mouse
				let translation = renderer.camera.GetTranslationVector(-displacement.dx, -displacement.dy);
				item.Translate(translation);
				this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Translate]);
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
		let datahandler = this.view.dataHandler;
		let renderer = this.view.sceneRenderer;

		if (!datahandler.currentItem || !(datahandler.currentItem instanceof Shape))
			return false;
		let item = <Shape>datahandler.currentItem;
		item.Scale(1.0 + (delta / 1000.0));
		renderer.Draw(this.scene);
		return true;
	}

	protected HandleKey(key: number): boolean {
		return true;
    }

	protected EndMouseEvent() {
		super.EndMouseEvent();
		this.view.dataHandler.RefreshContent();
	}
}