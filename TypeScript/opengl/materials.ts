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

	GetProperties(): Object {
		return {
			'Color': {
				'Red': this.baseColor[0],
				'Green': this.baseColor[1],
				'Blue': this.baseColor[2]
			},
			'Ambiant': this.ambiant,
			'Diffuse': this.diffuse,
			'Specular': this.specular,
			'Glossy': this.glossy
		};
	}

	SetProperties(properties: Object): boolean {
		try {
			if ('Color' in properties) {
				this.baseColor = [
					parseFloat(properties['Color']['Red']),
					parseFloat(properties['Color']['Green']),
					parseFloat(properties['Color']['Blue'])
				];
				for (let index = 0; index < 3; index++) {
					if (isNaN(this.baseColor[index])) {
						return false;
					}
				}
			}

			if ('Ambiant' in properties) {
				this.ambiant = parseFloat(properties['Ambiant']);
				if (isNaN(this.ambiant)) {
					return false;
				}
			}

			if ('Diffuse' in properties) {
				this.diffuse = parseFloat(properties['Diffuse']);
				if (isNaN(this.diffuse)) {
					return false;
				}
			}

			if ('Specular' in properties) {
				this.specular = parseFloat(properties['Specular']);
				if (isNaN(this.specular)) {
					return false;
				}
			}

			if ('Glossy' in properties) {
				this.glossy = parseFloat(properties['Glossy']);
				if (isNaN(this.glossy)) {
					return false;
				}
			}
		}
		catch (exception) {
			return false;
		}
		return true;
	}
}