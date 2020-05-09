/// <reference path="action.ts" />
/// <reference path="../../gui/app.ts" />
/// <reference path="../../gui/objects/scene.ts" />


class CenterCameraAction extends Action {
	constructor(private scene: Scene, private view: PCLApp) {
		super('Center camera on selection', 'Change the camera viewing direction so that it points to the selected object(s)');
	}

	Run() {
		let selectionbb = this.scene.GetSelectionBoundingBox();
		if (selectionbb && this.view.sceneRenderer.camera.CenterOnBox(selectionbb)) {
			this.view.sceneRenderer.Draw(this.scene);
		}
	}

	Enabled(): boolean {
		let selectionbb = this.scene.GetSelectionBoundingBox();
		return (selectionbb && selectionbb.IsValid());
	}
}