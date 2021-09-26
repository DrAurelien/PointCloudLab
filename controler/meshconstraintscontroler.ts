/// <reference path="controler.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="cursor.ts" />


/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
class MeshConstraintsControler extends MouseControler {
	public mesh: PCLMesh;

	constructor(target: Controlable) {
		super(target);
		this.mesh = this.target.GetCurrentTransformable() as PCLMesh;
	}

	protected HandleMouseMove(displacement: MouseDisplacement): boolean {
		if (displacement.IsNull()) {
			return true;
		}

		switch (displacement.button) {
			case 1: //Left mouse
			case 3: //Right mouse
				let face = this.GetFace();
				if (face) {
					face.Flag = displacement.button == 1 ? 1 : 0;
					this.mesh.InvalidateDrawing();
					this.mesh.NotifyChange(this.mesh, ChangeType.Display);
				}
				break;
			default:
				return true;
		}
		this.Cursor = Cursor.Brush;

		return true;
	}

	protected HandleClick(tracker: MouseTracker): boolean {
		return true;
	}

	protected HandleWheel(delta: number): boolean {
		return true;
	}

	private GetFace(): MeshFace
	{
		let camera = this.target.GetViewPoint();
		let ray = camera.GetRay(this.mousetracker.x, this.mousetracker.y);
		let picking = this.mesh.RayIntersection(ray);
		return picking.details as MeshFace;
	}
}