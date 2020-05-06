class ScalarField {
	public values: number[];
	private nbvalues: number;
	static glScalarsBuffer: WebGLBuffer = null;
	static glBufferedScalarField: ScalarField = null;

	constructor(public name: string) {
		this.values = [];
		this.nbvalues = 0;
	}

	Reserve(capacity: number) {
		let values = new Array(capacity);
		for (let index = 0; index < this.nbvalues; index++) {
			values[index] = this.values[index];
		}
		this.values = values;
	}

	GetValue(index: number): number {
		return this.values[index];
	}

	SetValue(index: number, value: number) {
		this.values[index] = value;
	}

	PushValue(value: number) {
		this.values[this.nbvalues] = value;
		this.nbvalues++;
	}

	Size(): number {
		return this.values.length;
	}

	Min(): number {
		if (this.nbvalues) {
			let min = this.values[0];
			for (let index = 1; index < this.nbvalues; index++) {
				if (this.values[index] < min)
					min = this.values[index];
			}
			return min;
		}
		return null;
	}

	Max(): number {
		if (this.nbvalues) {
			let max = this.values[0];
			for (let index = 1; index < this.nbvalues; index++) {
				if (this.values[index] > max)
					max = this.values[index];
			}
			return max;
		}
		return 0;
	}

	PrepareRendering(drawingContext: DrawingContext) {
		if (!ScalarField.glScalarsBuffer) {
			ScalarField.glScalarsBuffer = drawingContext.gl.createBuffer();
		}
		if (ScalarField.glBufferedScalarField != this) {
			drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, ScalarField.glScalarsBuffer);
			drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.values), drawingContext.gl.STATIC_DRAW);

			drawingContext.gl.uniform1f(drawingContext.minscalarvalue, this.Min());
			drawingContext.gl.uniform1f(drawingContext.maxscalarvalue, this.Max());
			ScalarField.glBufferedScalarField = this;
		}

		drawingContext.gl.uniform1i(drawingContext.usescalars, 1);
		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, ScalarField.glScalarsBuffer);
		drawingContext.gl.enableVertexAttribArray(drawingContext.scalarvalue);
		drawingContext.gl.vertexAttribPointer(drawingContext.scalarvalue, 1, drawingContext.gl.FLOAT, false, 0, 0);

	}

	static ClearRendering(drawingContext: DrawingContext) {
		drawingContext.gl.uniform1i(drawingContext.usescalars, 0);
		drawingContext.gl.disableVertexAttribArray(drawingContext.scalarvalue);
	}

	static InvalidateBufferedField() {
		ScalarField.glBufferedScalarField = null;
	}
}

interface ColorsMapping {
	(s: number): Vector;
}