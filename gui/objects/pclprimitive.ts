/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/materials.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />


abstract class PCLPrimitive extends PCLNode {
	private material: Material;
	protected lighting: boolean;

	constructor(public name: string) {
		super(name);
		this.material = new Material([0.0, 1.0, 0.0]);
		this.lighting = true;
	}

	SetBaseColor(color: number[]) {
		this.material.baseColor = color;
	}

	CompleteProperties(properties: Properties) {
		let self = this;
		properties.Push(new BooleanProperty('Lighting', () => self.lighting, (l: boolean) => { self.lighting = l; }));
		properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
	}

	abstract DrawPrimitive(drawingContext: DrawingContext);

	DrawNode(drawingContext: DrawingContext) {
		this.material.InitializeLightingModel(drawingContext);
		this.DrawPrimitive(drawingContext);
	}

	GetDisplayIcon(): string {
		return 'fa-cube';
	}
}