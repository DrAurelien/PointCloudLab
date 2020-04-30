class CenterCameraAction extends Action {
	constructor(private scene: Scene, view: Interface) {
		super('Center camera on selection', function (onDone) {
			let selectionbb = scene.GetSelectionBoundingBox();
			if (selectionbb && view.sceneRenderer.camera.CenterOnBox(selectionbb)) {
				view.sceneRenderer.Draw(scene);
			}
		}, 'Change the camera viewing direction so that it points to the selected object(s)');
	}

	HasAction(): boolean {
		let selectionbb = this.scene.GetSelectionBoundingBox();
		return (selectionbb && selectionbb.IsValid());
	}
}