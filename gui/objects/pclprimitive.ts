/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/materials.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />
/// <reference path="../../tools/transform.ts" />


abstract class PCLPrimitive extends PCLNode implements Transformable {
	private material: Material;
	public lighting: boolean;
	private transform: Transform;

	private static defaultShapeTransform: Float32Array = Matrix.Identity(4).values;

	constructor(public name: string) {
		super(name);
		this.material = new Material([0.0, 1.0, 0.0]);
		this.lighting = true;
		this.transform = null;
	}

	SetBaseColor(color: number[]) {
		this.material.baseColor = color;
	}

	FillProperties() {
		if (this.properties) {
			let self = this;
			this.properties.Push(new BooleanProperty('Lighting', () => self.lighting, (l: boolean) => { self.lighting = l; }));
			this.properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
		}
	}

	abstract DrawPrimitive(drawingContext: DrawingContext);

	DrawNode(ctx: DrawingContext) {
		this.material.InitializeLightingModel(ctx);
		if (this.transform) {
			ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, this.transform.GetMatrix().values);
		}
		else {
			ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, PCLPrimitive.defaultShapeTransform);	
		}
		this.DrawPrimitive(ctx);
	}

	InititalizeTransform() {
		if (this.transform) {
			this.ApplyTransform();
		}
		this.transform = new Transform(this.GetBoundingBox().GetCenter());
	}

	Rotate(rotation: Matrix) {
		this.transform.Rotate(rotation);
	}

	Scale(scale: number) {
		this.transform.Scale(scale);
	}

	Translate(translation: Vector) {
		this.transform.Translate(translation);
	}

	ApplyTransform() {
		this.TransformPrivitive(this.transform);
		this.transform = null;
		this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
	}

	abstract TransformPrivitive(transform: Transform);

	GetBoundingBox(): BoundingBox {
		if (this.transform) {
			return null;
		}
		return this.GetPrimitiveBoundingBox();
	}
	abstract GetPrimitiveBoundingBox(): BoundingBox;

	GetTransform(): Transform {
		if (!this.transform) {
		}
		return this.transform;
	}

	GetDisplayIcon(): string {
		return 'fa-cube';
	}
}