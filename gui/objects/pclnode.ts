﻿/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/stringproperty.ts" />
/// <reference path="../controls/properties/booleanproperty.ts" />
/// <reference path="../../controler/actions/delegate.ts" />


interface PCLContainer {
	Add(PCLNode);
	Remove(PCLNode);
}

abstract class PCLNode implements Pickable {
	owner: PCLContainer;
	visible: boolean;
	selected: boolean;
	deletable: boolean;

	constructor(public name: string, owner: PCLContainer = null) {
		this.visible = true;
		this.selected = false;
		this.deletable = true;
		this.owner = null;
		if (owner) {
			owner.Add(this);
		}
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
		let properties = new Properties();
		properties.Push(new StringProperty('Name', this.name, (newName) => self.name = newName));
		properties.Push(new BooleanProperty('Visible', this.visible, (newVilibility) => self.visible = newVilibility));
		return properties;
	}

	GetActions(delegate: ActionDelegate, onDone: PCLNodeHandler): Action[] {
		let self = this;
		let result: Action[] = [];
		if (this.deletable) {
			result.push(new SimpleAction('Remove', () => {
				if (confirm('Are you sure you want to delete "' + self.name + '" ?')) {
					self.owner.Remove(self);
					return onDone(null);
				}
			}));
		}
		if (this.visible) {
			result.push(new SimpleAction('Hide', () => { self.visible = false; return onDone(null); }));
		}
		else {
			result.push(new SimpleAction('Show', () => { self.visible = true; return onDone(null); }));
		}
		return result;
	}

	GetChildren(): PCLNode[] {
		return [];
	}

	Apply(proc: PCLNodeHandler): boolean {
		return proc(this);
	}
}

interface PCLNodeHandler {
	(primitive: PCLNode): boolean;
}

class BoundingBoxDrawing {
	static glIndexBuffer: IndicesBuffer;
	static glPointsBuffer: FloatBuffer;
	static drawnElements: GLBufferElement[];

	static Initialize(ctx: DrawingContext) {
		if (!BoundingBoxDrawing.glIndexBuffer) {
			let points = [
				-0.5, -0.5, -0.5,
				-0.5, 0.5, -0.5,
				0.5, 0.5, -0.5,
				0.5, -0.5, -0.5,
				-0.5, -0.5, 0.5,
				-0.5, 0.5, 0.5,
				0.5, 0.5, 0.5,
				0.5, -0.5, 0.5];

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

			BoundingBoxDrawing.glPointsBuffer = new FloatBuffer(points, ctx, 3);
			BoundingBoxDrawing.glIndexBuffer = new IndicesBuffer(indices, ctx);
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

			BoundingBoxDrawing.glPointsBuffer.Bind(ctx.vertices);
			BoundingBoxDrawing.glIndexBuffer.Bind();
			let sizeOfUnisgnedShort = 2;

			for (var index = 0; index < BoundingBoxDrawing.drawnElements.length; index++) {
				let element = BoundingBoxDrawing.drawnElements[index];
				let type = BoundingBoxDrawing.glIndexBuffer.dataType;
				ctx.gl.drawElements(element.type, element.count, type, ctx.GetSize(type) * element.from);
			}
		}
	}
}

class GLBufferElement {
	constructor(public from: number, public count: number, public type: number) { }
}