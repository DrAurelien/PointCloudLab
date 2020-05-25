/// <reference path="controler.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="cursor.ts" />


/**
 * The Transform Contorler handles mouse inputs in order to apply transformations the the currently selected element
 */
class TransformControler extends MouseControler {
	currentItem: Transformable;

	constructor(target: Controlable) {
		super(target);
	}

	protected HandleMouseMove(displacement: MouseDisplacement): boolean {
		if (displacement.IsNull()) {
			return true;
		}

		if (!this.currentItem) {
			return false;
		}

		let camera = this.target.GetViewPoint();
		switch (displacement.button) {
			case 1: //Left mouse
				let x = this.mousetracker.x - displacement.dx;
				let y = this.mousetracker.y - displacement.dy;
				let rotation = camera.GetRotationMatrix(this.mousetracker.x, this.mousetracker.y, x, y);
				this.currentItem.Rotate(rotation);
				this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Rotate]);
				break;
			case 2: //Middle mouse
				let scale = 1.0 - (displacement.dy / camera.GetScreenHeight());
				this.currentItem.Scale(scale);
				this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Scale]);
				break;
			case 3: //Right mouse
				let translation = camera.GetTranslationVector(-displacement.dx, -displacement.dy);
				this.currentItem.Translate(translation);
				this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Translate]);
				break;
			default:
				return true;
		}

		this.target.NotifyTransform();
		return true;
	}

	StartMouseEvent() {
		this.currentItem = this.target.GetCurrentTransformable();
		if (this.currentItem) {
			this.currentItem.InititalizeTransform();
		}
	}

	EndMouseEvent() {
		if (this.currentItem) {
			this.currentItem.ApplyTransform();
			this.currentItem = null;
		}
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
		let item = this.target.GetCurrentTransformable();
		item.Scale(1.0 - (delta / 1000.0));
		this.target.NotifyTransform();
		return true;
	}

	protected HandleKey(key: number): boolean {
		return true;
	}
}