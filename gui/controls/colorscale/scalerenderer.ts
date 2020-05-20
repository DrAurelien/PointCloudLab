/// <reference path="../../opengl/drawingcontext.ts" />
/// <reference path="../control.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />


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