/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../controler/actions/shapeactions.ts" />


abstract class PCLShape extends PCLPrimitive implements Pickable {
	visible: boolean;
	mesh: Mesh;
	drawing: MeshDrawing;

	constructor(name: string, owner: PCLGroup) {
		super(name, owner);
		this.mesh = null;
		this.drawing = new MeshDrawing();
	}

	abstract GetGeometry(): Properties;

	abstract GetShape(): Shape;

	Rotate(rotation: Matrix) {
		this.GetShape().Rotate(rotation);
		this.Invalidate();
	}

	Translate(translation: Vector) {
		this.GetShape().Translate(translation);
		this.Invalidate();
	}

	Scale(scale: number) {
		this.GetShape().Scale(scale);
		this.Invalidate();
	}

	GetBoundingBox(): BoundingBox {
		return this.GetShape().GetBoundingBox();
	}

	RayIntersection(ray: Ray): Picking {
		return this.GetShape().RayIntersection(ray, this);
	}

	PrepareForDrawing(drawingContext: DrawingContext) {
		if (!this.mesh)
			this.mesh = this.GetShape().ComputeMesh(drawingContext.sampling);
	}

	DrawPrimitive(drawingContext: DrawingContext) {
		this.PrepareForDrawing(drawingContext);
		this.drawing.Prepare(this.mesh, drawingContext);
		this.drawing.Draw(this.mesh, drawingContext);
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();
		properties.Push(new PropertyGroup('Geometry', this.GetGeometry()));
		return properties;
	}

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let result = super.GetActions(dataHandler, onDone);

		result.push(null);
		result.push(new CreateShapeMeshAction(this.GetShape(), dataHandler, onDone));
		return result;
	}

	Invalidate() {
		this.mesh = null;
		this.GetShape().boundingbox = null;
	}

	protected GeometryChangeHandler(update?: PropertyChangeHandler): PropertyChangeHandler {
		let self = this;
		return function (value) {
			if (update) {
				update(value);
			}
			self.Invalidate();
		};
	}
}

interface PCLShapeCreator {
	(): PCLShape;
}
