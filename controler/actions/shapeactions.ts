/// <reference path="action.ts" />
/// <reference path="delegate.ts" />
/// <reference path="../../gui/controls/dialog.ts" />
/// <reference path="../../gui/objects/pclmesh.ts" />
/// <reference path="../../gui/objects/pclshape.ts" />
/// <reference path="../../model/shapes/shape.ts" />


class CreateShapeMeshAction extends Action {
	constructor(private shape: PCLShape, private sampling: number) {
		super('Create shape mesh', 'Builds the mesh sampling this shape');
	}

	Enabled(): boolean {
		return true;
	}

	Run() {
		let self = this;
		let dialog = new Dialog(
			//Ok has been clicked
			(properties) => {
				return self.CreateMesh(properties);
			},
			//Cancel has been clicked
			() => true
		);

		dialog.InsertValue('Sampling', this.sampling);
	}

	CreateMesh(properties: Dialog): boolean {
		let sampling = parseInt(properties.GetValue('Sampling'));
		let result: PCLMesh;
		let mesh = this.shape.GetShape().ComputeMesh(sampling, () => {
			if (result) result.InvalidateDrawing();
		});
		result = new PCLMesh(mesh);
		let self = this;
		mesh.ComputeOctree(() => {
			self.shape.NotifyChange(result, ChangeType.NewItem);
		});
		return true;
	}
}