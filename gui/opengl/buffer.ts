/// <reference path="drawingcontext.ts" />

class FloatBuffer {
	glBuffer: WebGLBuffer;

	constructor(data: number[], private ctx: DrawingContext, private dataSize: number) {
		this.glBuffer = ctx.gl.createBuffer();
		ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, this.glBuffer);
		ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, new Float32Array(data), ctx.gl.STATIC_DRAW);
	}

	Bind(attribute: number) {
		let gl = this.ctx.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
		gl.vertexAttribPointer(attribute, this.dataSize, gl.FLOAT, false, 0, 0);
	}
}

class IndicesBuffer {
	private glBuffer: WebGLBuffer;
	public dataType: number;

	constructor(data: number[], private ctx: DrawingContext, short: boolean = false) {
		this.dataType = ctx.GetIntType(short);
		this.glBuffer = ctx.gl.createBuffer();
		ctx.gl.bindBuffer(ctx.gl.ELEMENT_ARRAY_BUFFER, this.glBuffer);
		ctx.gl.bufferData(ctx.gl.ELEMENT_ARRAY_BUFFER, ctx.GetIntArray(data, short), ctx.gl.STATIC_DRAW);
	}

	Bind() {
		let gl = this.ctx.gl;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glBuffer);
	}
}