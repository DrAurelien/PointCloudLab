abstract class Shape extends CADPrimitive {
    visible: boolean;
	mesh: Mesh;

	constructor(name: string, owner: CADPrimitivesContainer) {
		super(name, owner);
		this.mesh = null;
	}

    abstract GetGeometry(): Properties;

    abstract ComputeMesh(sampling: number): Mesh;
	abstract ComputeBoundingBox(): BoundingBox;

	abstract Distance(point: Vector): number;

	abstract Rotate(rotation: Matrix);
	abstract Translate(translation: Vector);
	abstract Scale(scale: number);

	GetBoundingBox(): BoundingBox{
		if (!this.boundingbox) {
			this.boundingbox = this.ComputeBoundingBox();
		}
		return this.boundingbox;
	}

	ComputeBounds(points: number[], cloud: PointCloud): void {
	}

	PrepareForDrawing(drawingContext: DrawingContext) {
		if (!this.mesh) {
			this.mesh = this.ComputeMesh(drawingContext.sampling);
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

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let result = super.GetActions(dataHandler, onDone);

		result.push(null);
		result.push(new CreateShapeMeshAction(this, dataHandler, onDone));
		return result;
	}

	Invalidate()
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
	constructor(shape : Shape, dataHandler : DataHandler, onDone : CADNodeHandler) {
		super('Create shape mesh');

		this.callback = function () {
			let dialog = new Dialog(
				//Ok has been clicked
				(properties) => {
					let sampling = parseInt(properties.GetValue('Sampling'));
					let mesh = shape.ComputeMesh(sampling);
					mesh.ComputeOctree(() => { if (onDone) { onDone(mesh); } });
					return true;
				},
				//Cancel has been clicked
				() => true
			);

			dialog.InsertValue('Sampling', dataHandler.GetSceneRenderer().drawingcontext.sampling);
		}
	}
}