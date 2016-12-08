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
		let properties = new Properties();
		let color = new Properties();
		color.Push('Red', this.baseColor[0]);
		color.Push('Green', this.baseColor[1]);
		color.Push('Blue', this.baseColor[2]);
		properties.PushProperties('Color', color);
		properties.Push('Ambiant', this.ambiant);
		properties.Push('Diffuse', this.diffuse);
		properties.Push('Specular', this.specular);
		properties.Push('Glossy', this.glossy);
		return properties;
	}

	SetProperties(properties: Properties): boolean {
		let color = properties.GetAsProperties('Color');
		this.baseColor = [
			color.GetAsFloat('Red'),
			color.GetAsFloat('Green'),
			color.GetAsFloat('Blue')
		];
		this.ambiant = properties.GetAsFloat('Ambiant');
		this.diffuse = properties.GetAsFloat('Diffuse');
		this.specular = properties.GetAsFloat('Specular');
		this.glossy = properties.GetAsFloat('Glossy');
		return true;
	}
}