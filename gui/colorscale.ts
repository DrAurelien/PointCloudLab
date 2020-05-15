﻿/// <reference path="opengl/drawingcontext.ts" />
/// <reference path="controls/control.ts" />
/// <reference path="controls/histogramviewer.ts" />
/// <reference path="controls/pannel.ts" />
/// <reference path="../model/scalarfield.ts" />


class ColorScale extends Pannel {
	renderer: ColorScaleRenderer;
	caption: ColorScaleCaption;
	histo: HistogramViewer;

	private static instance: ColorScale;

	constructor(private field: ScalarField) {
		super('ColorScale');

		this.renderer = new ColorScaleRenderer();
		this.caption = new ColorScaleCaption(this.renderer);
		this.AddControl(this.caption);
		this.AddControl(this.renderer);

		let self = this;
		this.renderer.GetElement().onclick = () => {
			let histo = self.GetHistogram();
			histo.IsCollapsed() ? histo.Expand() : histo.Collapse()
		}
	}

	static Show(field: ScalarField): ColorScale {
		if (this.instance && this.instance.field !== field) {
			this.Hide();
		}
		if (!this.instance) {
			this.instance = new ColorScale(field);
			document.body.appendChild(this.instance.GetElement());
		}
		return this.instance;
	}

	static Hide() {
		if (this.instance) {
			document.body.removeChild(this.instance.GetElement());
			delete this.instance;
		}
	}

	Refresh() {
		let min = this.field.Min();
		let max = this.field.Max();

		this.renderer.Refresh(min, max);
		this.caption.Refresh(min, max);
		if (this.histo) {
			this.histo.Refresh(this.field.values);
		}
	}

	GetHistogram(): HistogramViewer {
		if (!this.histo) {
			this.histo = new HistogramViewer();
			this.histo.Collapse();
			this.AddControl(this.histo);
			let height = this.renderer.GetElement().clientHeight;
			this.histo.Resize(Math.round(height * 0.5), height);
			this.histo.Refresh(this.field.values);

			let self = this;
			this.histo.GetElement().onclick = () => {
				self.histo.Collapse();
			}
		}
		return this.histo;
	}
}

class ColorScaleCaption implements Control {
	container: HTMLDivElement;
	min: Text;
	max: Text;

	constructor(private boundScaleRenderer: ColorScaleRenderer) {
		this.container = document.createElement('div');
		this.container.className = 'ColorScaleCaption';

		let minContainer = document.createElement('div');
		minContainer.className = 'ColorScaleMin';
		this.min = document.createTextNode('');
		minContainer.appendChild(this.min);
		this.container.appendChild(minContainer);

		let maxContainer = document.createElement('div');
		maxContainer.className = 'ColorScaleMax';
		this.max = document.createTextNode('');
		maxContainer.appendChild(this.max);
		this.container.appendChild(maxContainer);
	}

	GetElement() {
		return this.container;
	}

	Refresh(min: number, max: number) {
		this.min.data = Number(min).toFixed(2);
		this.max.data = Number(max).toFixed(2);
		this.container.style.height = this.boundScaleRenderer.GetElement().clientHeight + 'px';
	}
}

class ColorScaleRenderer implements Control {
	scaleRenderingArea: HTMLCanvasElement;
	drawingcontext: DrawingContext;
	points: FloatArrayBuffer;
	scalars: FloatArrayBuffer;
	indices: ElementArrayBuffer;

	constructor() {
		this.scaleRenderingArea = document.createElement('canvas');
		this.scaleRenderingArea.className = 'ColorRenderer';
		this.drawingcontext = new DrawingContext(this.scaleRenderingArea);

		this.points = new FloatArrayBuffer(new Float32Array([
			1.0, -1.0, 0.0,
			-1.0, -1.0, 0.0,
			-1.0, 1.0, 0.0,
			1.0, 1.0, 0.0
		]), this.drawingcontext, 3);
		this.indices = new ElementArrayBuffer([
			0, 1, 2,
			2, 3, 0
		], this.drawingcontext, true);

		let indentity = Matrix.Identity(4);
		this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.modelview, false, indentity.values);
		this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.projection, false, indentity.values);
		this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.shapetransform, false, indentity.values);

		this.drawingcontext.EnableNormals(false);
		this.drawingcontext.EnableScalars(true);
	}

	Refresh(min: number, max: number) {
		this.drawingcontext.gl.viewport(0, 0, this.scaleRenderingArea.width, this.scaleRenderingArea.height);
		this.drawingcontext.gl.clear(this.drawingcontext.gl.COLOR_BUFFER_BIT | this.drawingcontext.gl.DEPTH_BUFFER_BIT);

		this.drawingcontext.gl.uniform1f(this.drawingcontext.minscalarvalue, min);
		this.drawingcontext.gl.uniform1f(this.drawingcontext.maxscalarvalue, max);

		let scalars = new FloatArrayBuffer(new Float32Array([min, min, max, max]), this.drawingcontext, 1);
		this.points.BindAttribute(this.drawingcontext.vertices);
		scalars.BindAttribute(this.drawingcontext.scalarvalue);
		this.indices.Bind();

		this.drawingcontext.gl.drawElements(this.drawingcontext.gl.TRIANGLES, 6, this.drawingcontext.GetIntType(true), 0);
	}

	GetElement() {
		return this.scaleRenderingArea;
	}
}