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

		let color = new PropertyGroup('Color');
		properties.Push(color);
		color.Add(new NumberProperty('Red', self.baseColor[0], (red) => self.baseColor[0] = red));
		color.Add(new NumberProperty('Green', self.baseColor[1], (green) => self.baseColor[1] = green));
		color.Add(new NumberProperty('Blue', self.baseColor[2], (blue) => self.baseColor[2] = blue));
		
		properties.Push(new NumberProperty('Ambiant', self.ambiant, (value) => self.ambiant = value));
		properties.Push(new NumberProperty('Diffuse', self.diffuse, (value) => self.diffuse = value));
		properties.Push(new NumberProperty('Specular', self.specular, (value) => self.specular = value));
		properties.Push(new NumberProperty('Glossy', self.glossy, (value) => self.glossy = value));

		return properties;
	}
}