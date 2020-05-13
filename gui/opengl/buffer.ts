/// <reference path="drawingcontext.ts" />


class GLBuffer {
	glBuffer: WebGLBuffer;

	constructor(data: ArrayBuffer, protected ctx: DrawingContext, protected type: number) {
		this.glBuffer = ctx.gl.createBuffer();
		ctx.gl.bindBuffer(type, this.glBuffer);
		ctx.gl.bufferData(type, data, ctx.gl.STATIC_DRAW);
	}

	Bind() {
		this.ctx.gl.bindBuffer(this.type, this.glBuffer);
	}

	Clear() {
		this.ctx.gl.deleteBuffer(this.glBuffer);
	}
}

class FloatArrayBuffer extends GLBuffer {
	constructor(data: Float32Array, ctx: DrawingContext, private dataSize: number) {
		super(data, ctx, ctx.gl.ARRAY_BUFFER);
	}

	BindAttribute(attribute: number) {
		this.Bind();
		this.ctx.gl.vertexAttribPointer(attribute, this.dataSize, this.ctx.gl.FLOAT, false, 0, 0);
	}
}

class ElementArrayBuffer extends GLBuffer {
	public inttype: number;

	constructor(data: number[], ctx: DrawingContext, short: boolean = false) {
		super(ctx.GetIntArray(data, short), ctx, ctx.gl.ELEMENT_ARRAY_BUFFER);
		this.inttype = ctx.GetIntType(short);
	}
}