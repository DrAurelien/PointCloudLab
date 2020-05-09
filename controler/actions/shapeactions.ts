/// <reference path="action.ts" />
/// <reference path="delegate.ts" />
/// <reference path="../../gui/controls/dialog.ts" />
/// <reference path="../../gui/objects/pclmesh.ts" />
/// <reference path="../../model/shapes/shape.ts" />


class CreateShapeMeshAction extends Action {
	constructor(private shape: Shape, private delegate: ActionDelegate, private onDone: PCLNodeHandler) {
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

		dialog.InsertValue('Sampling', this.delegate.GetShapesSampling());
	}

	CreateMesh(properties: Dialog): boolean {
		let sampling = parseInt(properties.GetValue('Sampling'));
		let mesh = this.shape.ComputeMesh(sampling);
		let result = new PCLMesh(mesh);
		let self = this;
		let ondone = () => {
			if (self.onDone) {
				self.onDone(result);
			}
		}
		mesh.ComputeOctree(ondone);
		return true;
	}
}