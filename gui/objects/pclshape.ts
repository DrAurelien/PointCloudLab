/// <reference path="pclprimitive.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="pclmesh.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/mesh.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../../controler/actions/shapeactions.ts" />
/// <reference path="../../tools/picking.ts" />


abstract class PCLShape extends PCLPrimitive implements Pickable, Transformable {
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

	GetActions(delegate: ActionDelegate, onDone: PCLNodeHandler): Action[] {
		let result = super.GetActions(delegate, onDone);

		result.push(null);
		result.push(new CreateShapeMeshAction(this.GetShape(), delegate, onDone));
		return result;
	}

	Invalidate() {
		this.mesh = null;
		this.GetShape().boundingbox = null;
		this.drawing.Clear();
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
