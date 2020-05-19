/// <reference path="opengl/drawingcontext.ts" />
/// <reference path="controls/control.ts" />
/// <reference path="controls/histogramviewer.ts" />
/// <reference path="controls/pannel.ts" />
/// <reference path="objects/pclscalarfield.ts" />
/// <reference path="../tools/stringutils.ts" />


class ColorScale extends Pannel {
	renderer: ColorScaleRenderer;
	bounds: ColorScaleBoundsContainer;
	histo: HistogramViewer;

	private static instance: ColorScale;
	private static showHisto: boolean = true;

	constructor(private field: PCLScalarField) {
		super('ColorScale');

		this.renderer = new ColorScaleRenderer();
		this.bounds = new ColorScaleBoundsContainer(this.field);
		this.histo = new HistogramViewer(this.field, (v) => self.GetColor(v));
		this.AddControl(this.bounds);
		this.AddControl(this.renderer);
		this.AddControl(this.histo);

		let self = this;
		this.renderer.GetElement().onclick = () => {
			self.histo.IsCollapsed() ? self.histo.Expand() : self.histo.Collapse();
		}
		this.histo.GetElement().onclick = () => {
			self.histo.Collapse();
		}
	}

	GetColor(value: number): string {
		let ratio = (value - this.field.Min()) / (this.field.Max() - this.field.Min());
		return this.renderer.GetColor(ratio);
	}

	static Show(field: PCLScalarField): ColorScale {
		if (this.instance && this.instance.field !== field) {
			this.Hide();
		}
		if (!this.instance) {
			this.instance = new ColorScale(field);
			if (!ColorScale.showHisto) {
				this.instance.histo.Collapse();
			}
			document.body.appendChild(this.instance.GetElement());
		}
		return this.instance;
	}

	static Hide() {
		if (this.instance) {
			ColorScale.showHisto = this.instance.histo && !this.instance.histo.IsCollapsed();
			document.body.removeChild(this.instance.GetElement());
			delete this.instance;
		}
	}

	Refresh() {
		this.renderer.Refresh(this.field);
		this.bounds.Refresh(this.field);
		this.histo.Refresh();
	}
}

class ColorScaleBoundsContainer implements Control {
	container: HTMLDivElement;
	min: ColorScaleBound;
	max: ColorScaleBound;

	constructor(field: PCLScalarField) {
		this.container = document.createElement('div');
		this.container.className = 'ColorScaleBoundsContainer';

		this.min = new ColorScaleBound('Min', (c) => field.SetColorMin(c));
		this.max = new ColorScaleBound('Max', (c) => field.SetColorMax(c));

		this.container.appendChild(this.min.GetElement());
		this.container.appendChild(this.max.GetElement());
	}

	GetElement() {
		return this.container;
	}

	Refresh(field: PCLScalarField) {
		this.min.Value = field.GetDisplayMin();
		this.min.Color = field.colormin;
		this.max.Value = field.GetDisplayMax();
		this.max.Color = field.colormax;
	}
}

interface ColorChangeHanlder {
	(c: number[]);
}

class ColorScaleBound implements Control {
	container: HTMLDivElement;
	value: Text;
	color: HTMLInputElement;

	constructor(classname: string, onColorChange: ColorChangeHanlder) {
		this.container = document.createElement('div');
		this.container.className = 'ColorScaleBound';
		this.container.classList.add(classname);
		this.value = document.createTextNode('');
		this.container.appendChild(this.value);

		this.color = document.createElement('input');
		this.color.type = 'color';
		this.color.style.display = 'None';
		this.container.appendChild(this.color);

		let self = this;
		this.color.onchange = () => {
			self.UpdateColor();
			onColorChange(StringUtils.StrToRGBf(self.color.value));
		}
		this.container.onclick = () => self.color.click();
	}

	GetElement() {
		return this.container;
	}

	set Value(v: number) {
		this.value.data = Number(v).toFixed(2);
	}

	set Color(color: number[]) {
		let colorStr = StringUtils.RGBfToStr(color);
		this.color.value = colorStr;
		this.UpdateColor();
	}

	private UpdateColor() {
		this.container.style.color = this.color.value;
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

	Refresh(field: PCLScalarField) {
		this.drawingcontext.gl.viewport(0, 0, this.scaleRenderingArea.width, this.scaleRenderingArea.height);
		this.drawingcontext.gl.clear(this.drawingcontext.gl.COLOR_BUFFER_BIT | this.drawingcontext.gl.DEPTH_BUFFER_BIT);

		let min = field.GetDisplayMin();
		let max = field.GetDisplayMax();

		this.drawingcontext.gl.uniform1f(this.drawingcontext.minscalarvalue, min);
		this.drawingcontext.gl.uniform1f(this.drawingcontext.maxscalarvalue, max);
		this.drawingcontext.gl.uniform3fv(this.drawingcontext.minscalarcolor, field.colormin);
		this.drawingcontext.gl.uniform3fv(this.drawingcontext.maxscalarcolor, field.colormax);

		min = field.Min();
		max = field.Max();
		let scalars = new FloatArrayBuffer(new Float32Array([min, min, max, max]), this.drawingcontext, 1);
		this.points.BindAttribute(this.drawingcontext.vertices);
		scalars.BindAttribute(this.drawingcontext.scalarvalue);
		this.indices.Bind();

		this.drawingcontext.gl.drawElements(this.drawingcontext.gl.TRIANGLES, 6, this.drawingcontext.GetIntType(true), 0);
	}

	GetElement() {
		return this.scaleRenderingArea;
	}

	GetColor(v: number): string {
		let gl = this.drawingcontext.gl;
		let pixel = new Uint8Array(4);
		gl.readPixels(0, Math.round(v * gl.drawingBufferHeight), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
		return StringUtils.RGBiToStr(pixel);
	}
}