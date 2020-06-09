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
/// <reference path="../../tools/transform.ts" />


abstract class PCLShape extends PCLPrimitive implements Pickable {
	visible: boolean;
	drawing: MeshDrawing;
	private meshsampling: number;
	private pendingmesh: boolean;

	constructor(name: string, shape: Shape) {
		super(name);
		this.drawing = new MeshDrawing();
		this.meshsampling = 0;
		this.pendingmesh = false;

		let self = this;
	}

	abstract GetGeometry(): Properties;

	abstract GetShape(): Shape;

	TransformPrivitive(transform: Transform) {
		this.GetShape().ApplyTransform(transform);
		this.Invalidate();
	}

	GetPrimitiveBoundingBox(): BoundingBox {
		return this.GetShape().GetBoundingBox();
	}

	RayIntersection(ray: Ray): Picking {
		return this.GetShape().RayIntersection(ray, this);
	}

	GetDistance(p: Vector): number {
		return this.GetShape().Distance(p);
	}

	PrepareForDrawing(drawingContext: DrawingContext): boolean {
		//Avoid concurrent mesh computation requests
		if (this.pendingmesh) {
			return false;
		}

		if (this.meshsampling !== drawingContext.sampling) {
			this.pendingmesh = true;
			//Asynchroneous computation of the mesh to be rendered
			let self = this;
			this.GetShape().ComputeMesh(drawingContext.sampling, (mesh: Mesh) => {
				if (self.meshsampling = drawingContext.sampling) {
					self.meshsampling = drawingContext.sampling;
					self.drawing.FillBuffers(mesh, drawingContext);
					self.pendingmesh = false;
					self.NotifyChange(self, ChangeType.Display);
				}
			});
			//Not ready yet. Wait for NotifyChange to be handled 
			return false;
		}
		return true;
	}

	DrawPrimitive(drawingContext: DrawingContext) {
		if (this.PrepareForDrawing(drawingContext)) {
			this.drawing.Draw(this.lighting, drawingContext);
		}
	}

	FillProperties() {
		super.FillProperties();
		if (this.properties) {
			this.properties.Push(new PropertyGroup('Geometry', this.GetGeometry()));
		}
	}

	GetActions(delegate: ActionDelegate): Action[] {
		let result = super.GetActions(delegate);

		result.push(null);
		result.push(new CreateShapeMeshAction(this, delegate.GetShapesSampling()));
		return result;
	}

	Invalidate() {
		this.meshsampling = 0;
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