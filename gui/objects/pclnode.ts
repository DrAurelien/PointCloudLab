
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/stringproperty.ts" />
/// <reference path="../controls/properties/booleanproperty.ts" />
/// <reference path="../../controler/actions/delegate.ts" />


enum ChangeType {
	Selection	= 0x000001,
	Creation	= 0x000002,
	Properties	= 0x000004,
	Display		= 0x000008,
	Folding		= 0x000010,
	Children	= 0x000020,
	ColorScale	= 0x000040
}

interface Notifiable {
	NotifyChange(source: PCLNode, type: ChangeType);
}

interface ChangeHandler {
	(source: PCLNode, type: ChangeType): void;
}

interface PCLContainer {
	Add(child: PCLNode);
	Remove(child: PCLNode);
	NotifyChange(source: PCLNode, type: ChangeType);
}

abstract class PCLNode implements Pickable, Notifiable {
	owner: PCLContainer;
	visible: boolean;
	selected: boolean;
	deletable: boolean;
	private changeListeners: ChangeHandler[];
	protected properties: Properties;

	constructor(public name: string) {
		this.visible = true;
		this.selected = false;
		this.deletable = true;
		this.owner = null;
		this.changeListeners = [];
	}

	Draw(drawingContext: DrawingContext): void {
		if (this.visible) {
			this.DrawNode(drawingContext);

			if (this.selected) {
				BoundingBoxDrawing.Draw(this.GetBoundingBox(), drawingContext);
			}
		}
	}

	abstract DrawNode(drawingContext: DrawingContext): void;
	abstract RayIntersection(ray: Ray): Picking;
	abstract GetBoundingBox(): BoundingBox;

	// https://fontawesome.com/cheatsheet
	abstract GetDisplayIcon(): string;

	GetProperties(): Properties {
		let self = this;
		if (!this.properties) {
			this.properties = new Properties();
			this.properties.Push(new StringProperty('Name', () => self.name, (newName) => self.name = newName));
			this.properties.Push(new BooleanProperty('Visible', () => self.visible, (newVilibility) => self.visible = newVilibility));
			this.FillProperties();

			this.properties.onChange = () => self.NotifyChange(self, ChangeType.Properties | ChangeType.Display);
		}
		return this.properties;
	}
	protected abstract FillProperties();
	Select(b: boolean) {
		let change = (b !== this.selected);
		this.selected = b;
		if (change) {
			this.NotifyChange(this, ChangeType.Selection);
		}
	}

	ToggleVisibility() {
		this.visible = !this.visible;
		this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
	}

	GetActions(delegate: ActionDelegate): Action[] {
		let self = this;
		let result: Action[] = [];
		if (this.deletable) {
			result.push(new SimpleAction('Remove', () => {
				if (confirm('Are you sure you want to delete "' + self.name + '" ?')) {
					self.owner.Remove(self);
				}
			}));
		}
		if (this.visible) {
			result.push(new SimpleAction('Hide', () => { self.visible = false; self.NotifyChange(self, ChangeType.Display | ChangeType.Properties); }));
		}
		else {
			result.push(new SimpleAction('Show', () => { self.visible = true; self.NotifyChange(self, ChangeType.Display | ChangeType.Properties); }));
		}
		return result;
	}

	GetChildren(): PCLNode[] {
		return [];
	}

	Apply(proc: PCLNodeHandler): boolean {
		return proc(this);
	}

	NotifyChange(source: PCLNode, type: ChangeType) {
		for (let index = 0; index < this.changeListeners.length; index++) {
			this.changeListeners[index](source, type);
		}
	}

	AddChangeListener(onchange: ChangeHandler) {
		this.changeListeners.push(onchange);
	}

	ClearProperties() {
		if (this.properties) {
			delete this.properties;
		}
	}
}

interface PCLNodeHandler {
	(primitive: PCLNode): boolean;
}

class BoundingBoxDrawing {
	static glIndexBuffer: ElementArrayBuffer;
	static glPointsBuffer: FloatArrayBuffer;
	static drawnElements: GLBufferElement[];

	static Initialize(ctx: DrawingContext) {
		if (!BoundingBoxDrawing.glIndexBuffer) {
			let points = new Float32Array([
				-0.5, -0.5, -0.5,
				-0.5, 0.5, -0.5,
				0.5, 0.5, -0.5,
				0.5, -0.5, -0.5,
				-0.5, -0.5, 0.5,
				-0.5, 0.5, 0.5,
				0.5, 0.5, 0.5,
				0.5, -0.5, 0.5]);

			let indices = [
				0, 1, 2, 3,
				4, 5, 6, 7,
				0, 4,
				1, 5,
				2, 6,
				3, 7
			];

			BoundingBoxDrawing.drawnElements = [
				new GLBufferElement(0, 4, ctx.gl.LINE_LOOP),
				new GLBufferElement(4, 4, ctx.gl.LINE_LOOP),
				new GLBufferElement(8, 2, ctx.gl.LINES),
				new GLBufferElement(10, 2, ctx.gl.LINES),
				new GLBufferElement(12, 2, ctx.gl.LINES),
				new GLBufferElement(14, 2, ctx.gl.LINES)
			];

			BoundingBoxDrawing.glPointsBuffer = new FloatArrayBuffer(points, ctx, 3);
			BoundingBoxDrawing.glIndexBuffer = new ElementArrayBuffer(indices, ctx);
		}
	}

	static Draw(box: BoundingBox, ctx: DrawingContext) {
		if (box && box.IsValid()) {
			ctx.EnableNormals(false);
			BoundingBoxDrawing.Initialize(ctx);

			ctx.gl.uniform3fv(ctx.color, new Float32Array([1.0, 1.0, 0.0]));

			let size = box.GetSize();
			let center = box.GetCenter();
			let shapetransform = Matrix.Identity(4);
			for (let index = 0; index < 3; index++) {
				shapetransform.SetValue(index, index, size.Get(index));
				shapetransform.SetValue(index, 3, center.Get(index));
			}

			ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, new Float32Array(shapetransform.values));

			BoundingBoxDrawing.glPointsBuffer.BindAttribute(ctx.vertices);
			BoundingBoxDrawing.glIndexBuffer.Bind();

			for (var index = 0; index < BoundingBoxDrawing.drawnElements.length; index++) {
				let element = BoundingBoxDrawing.drawnElements[index];
				let type = BoundingBoxDrawing.glIndexBuffer.inttype;
				ctx.gl.drawElements(element.type, element.count, type, ctx.GetSize(type) * element.from);
			}
		}
	}
}

class GLBufferElement {
	constructor(public from: number, public count: number, public type: number) { }
}