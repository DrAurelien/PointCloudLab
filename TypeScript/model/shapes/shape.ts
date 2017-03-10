abstract class Shape extends CADPrimitive{
    visible: boolean;
	mesh: Mesh;

	constructor(name: string, owner: CADGroup) {
		super(name, owner);
		this.mesh = null;
	}

    abstract GetGeometry(): Properties;

    abstract ComputeMesh(sampling: number, onDone: CADPrimitiveHandler): Mesh;
	abstract ComputeBoundingBox(): BoundingBox;

	abstract Distance(point: Vector): number;

	GetBoundingBox(): BoundingBox{
		if (!this.boundingbox) {
			this.boundingbox = this.ComputeBoundingBox();
		}
		return this.boundingbox;
	}

	ComputeBounds(points: number[], cloud: PointCloud): void {
	}

	PrepareForDrawing(drawingContext: DrawingContext, onDone: CADPrimitiveHandler = null) {
		if (!this.mesh) {
			this.mesh = this.ComputeMesh(drawingContext.sampling, onDone);
		}
	}

	Draw(drawingContext: DrawingContext) {
		if (this.visible) {
			this.PrepareForDrawing(drawingContext);

			this.mesh.material = this.material;
			this.mesh.Draw(drawingContext);

			if (this.selected) {
				var box = this.GetBoundingBox();
				box.Draw(drawingContext);
			}
		}
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();
		properties.Push(new PropertyGroup('Geometry', this.GetGeometry()));
		return properties;
	}

	GetActions(dataHandler: DataHandler, onDone: CADPrimitiveHandler): Action[] {
		let result = super.GetActions(dataHandler, onDone);

		result.push(null);
		result.push(new CreateShapeMeshAction(this, dataHandler, onDone));
		return result;
	}

	protected Invalidate()
	{
		this.mesh = null;
		this.boundingbox = null;
	}

	protected GeometryChangeHandler(update?: PropertyChangeHandler): PropertyChangeHandler{
		let self = this;
		return function (value) {
			if (update) {
				update(value);
			}
			self.Invalidate();
		};
	}
}

interface ShapeCreator {
	(): Shape;
}

class CreateShapeMeshAction extends Action {
	constructor(shape : Shape, dataHandler : DataHandler, onDone : CADPrimitiveHandler) {
		super('Create shape mesh');

		this.callback = function () {
			let dialog = new Dialog(
				//Ok has been clicked
				(properties) => {
					let sampling = parseInt(properties.GetValue('Sampling'));
					let mesh = shape.ComputeMesh(sampling, (shape) => {
						if (onDone) {
							return onDone(mesh);
						}
						return true;
					});
					return true;
				},
				//Cancel has been clicked
				() => true
			);

			dialog.InsertValue('Sampling', dataHandler.GetSceneRenderer().drawingcontext.sampling);
		}
	}
}