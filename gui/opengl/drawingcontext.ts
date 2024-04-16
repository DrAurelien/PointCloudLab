/// <reference path="renderingtype.ts" />
/// <reference path="shaders.ts" />

class DrawingContext {
	static NbMaxLights = 8;
	sampling: number = 30;
	gl: WebGL2RenderingContext;
	shaders: Shaders;
	projection: WebGLUniformLocation;
	modelview: WebGLUniformLocation;
	shapetransform: WebGLUniformLocation;
	vertices: number;
	normals: number;
	usenormals: WebGLUniformLocation;
	eyeposition: WebGLUniformLocation;
	lightpositions: WebGLUniformLocation[];
	lightcolors: WebGLUniformLocation[];
	nblights: WebGLUniformLocation;
	//Lighting
	color: WebGLUniformLocation;
	diffuse: WebGLUniformLocation;
	ambiant: WebGLUniformLocation;
	specular: WebGLUniformLocation;
	glossy: WebGLUniformLocation;
	rendering: RenderingType;
	//Scalar fields
	scalarvalue: number;
	usescalars: WebGLUniformLocation;
	minscalarvalue: WebGLUniformLocation;
	maxscalarvalue: WebGLUniformLocation;
	minscalarcolor: WebGLUniformLocation;
	maxscalarcolor: WebGLUniformLocation;
	//Extensions
	useuint: boolean;
	//
	bboxcolor: number[];

	constructor(public renderingArea: HTMLCanvasElement) {
		this.rendering = new RenderingType();

		this.gl = <WebGL2RenderingContext>(this.renderingArea.getContext("webgl2", { preserveDrawingBuffer: true }) ||
			this.renderingArea.getContext("experimental-webgl", { preserveDrawingBuffer: true }));
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.disable(this.gl.CULL_FACE);
		this.gl.depthFunc(this.gl.LEQUAL);

		this.useuint = this.gl.getExtension('OES_element_index_uint') ||
			this.gl.getExtension('MOZ_OES_element_index_uint') ||
			this.gl.getExtension('WEBKIT_OES_element_index_uint');

		this.shaders = new Shaders(this.gl, "VertexShader", "FragmentShader");

		this.vertices = this.shaders.Attribute("VertexPosition");
		this.gl.enableVertexAttribArray(this.vertices);

		this.normals = this.shaders.Attribute("NormalVector");
		this.EnableNormals(true);

		this.scalarvalue = this.shaders.Attribute("ScalarValue");
		this.usescalars = this.shaders.Uniform("UseScalars");
		this.minscalarvalue = this.shaders.Uniform("MinScalarValue");
		this.maxscalarvalue = this.shaders.Uniform("MaxScalarValue");
		this.minscalarcolor = this.shaders.Uniform("MinScalarColor");
		this.maxscalarcolor = this.shaders.Uniform("MaxScalarColor");

		this.projection = this.shaders.Uniform("Projection");
		this.modelview = this.shaders.Uniform("ModelView");
		this.shapetransform = this.shaders.Uniform("ShapeTransform");

		this.color = this.shaders.Uniform("Color");
		this.eyeposition = this.shaders.Uniform("EyePosition");

		this.lightpositions = [];
		this.lightcolors = [];
		this.nblights = this.shaders.Uniform("NbLights");
		for (var index = 0; index < DrawingContext.NbMaxLights; index++) {
			this.lightpositions.push(this.shaders.Uniform("LightPositions[" + index + "]"));
			this.lightcolors.push(this.shaders.Uniform("LightColors[" + index + "]"));
		}
		this.diffuse = this.shaders.Uniform("DiffuseCoef");
		this.ambiant = this.shaders.Uniform("AmbiantCoef");
		this.specular = this.shaders.Uniform("SpecularCoef");
		this.glossy = this.shaders.Uniform("GlossyPow");
		this.usenormals = this.shaders.Uniform("UseNormals");

		this.bboxcolor = [1, 1, 1];
	}

	EnableNormals(b): boolean {
		let isEnabled = this.gl.getVertexAttrib(this.normals, this.gl.VERTEX_ATTRIB_ARRAY_ENABLED);
		if (b) {
			this.gl.uniform1i(this.usenormals, 1);
			this.gl.enableVertexAttribArray(this.normals);
		}
		else {
			this.gl.uniform1i(this.usenormals, 0);
			this.gl.disableVertexAttribArray(this.normals);
		}
		return isEnabled;
	}

	EnableScalars(b): void {
		if (b) {
			this.gl.uniform1i(this.usescalars, 1);
			this.gl.enableVertexAttribArray(this.scalarvalue);
		}
		else {
			this.gl.uniform1i(this.usescalars, 0);
			this.gl.disableVertexAttribArray(this.scalarvalue);
		}
	}

	GetIntType(forceshort: boolean=false): number {
		if (this.useuint && !forceshort) {
			return this.gl.UNSIGNED_INT;
		}
		return this.gl.UNSIGNED_SHORT;
	}

	GetIntArray(content: number[], forceshort: boolean = false): ArrayBuffer {
		if (this.useuint && !forceshort) {
			return new Uint32Array(content);
		}
		return new Uint16Array(content);
	}

	GetSize(type: number): number {
		switch (type) {
			case this.gl.UNSIGNED_SHORT:
			case this.gl.SHORT:
				return 2;
			case this.gl.UNSIGNED_INT:
			case this.gl.INT:
			case this.gl.FLOAT:
				return 4;
			default:
				throw 'Cannot handle type ' + type;
		}
	}

	GetShader(identifier: string): WebGLShader {
		let shaderScript: HTMLScriptElement;
		let shaderSource: string;
		let shader: WebGLShader;

		shaderScript = <HTMLScriptElement>document.getElementById(identifier);
		if (!shaderScript) {
			throw 'Cannot find shader script "' + identifier + '"';
		}
		shaderSource = shaderScript.innerHTML;

		if (shaderScript.type.toLowerCase() == "x-shader/x-fragment") {
			shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		} else if (shaderScript.type.toLowerCase() == "x-shader/x-vertex") {
			shader = this.gl.createShader(this.gl.VERTEX_SHADER);
		}
		else {
			throw 'Unknown shadert type ' + shaderScript.type;
		}
		this.gl.shaderSource(shader, shaderSource);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			throw 'An error occurred while compiling the shader "' + identifier + '": ' + this.gl.getShaderInfoLog(shader) + '\nCource code :\n' + shaderSource;
		}
		return shader;
	}
}