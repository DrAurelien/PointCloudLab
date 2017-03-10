class Material {
	constructor(public baseColor: number[], public diffuse: number = 1.0, public ambiant: number = 1.0, public specular: number = 1.0, public glossy: number = 8.0) {
	}

	InitializeLightingModel(drawingContext: DrawingContext): void {
		drawingContext.gl.uniform3fv(drawingContext.color, new Float32Array(this.baseColor));
		drawingContext.gl.uniform1f(drawingContext.diffuse, this.diffuse);
		drawingContext.gl.uniform1f(drawingContext.ambiant, this.ambiant);
		drawingContext.gl.uniform1f(drawingContext.specular, this.specular);
		drawingContext.gl.uniform1f(drawingContext.glossy, this.glossy);
	}

	GetProperties(): Properties {
		let self = this;

		let properties = new Properties;
		properties.Push(new ColorProperty('Color', self.baseColor, (value) => self.baseColor = value));
		properties.Push(new NumberInRangeProperty('Ambiant', self.ambiant, 0, 10, (value) => self.ambiant = value));
		properties.Push(new NumberInRangeProperty('Diffuse', self.diffuse, 0, 10, (value) => self.diffuse = value));
		properties.Push(new NumberInRangeProperty('Specular', self.specular, 0, 10, (value) => self.specular = value));
		properties.Push(new NumberInRangeProperty('Glossy', self.glossy, 0, 10, (value) => self.glossy = value));

		return properties;
	}
}