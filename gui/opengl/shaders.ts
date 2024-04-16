class Shaders
{
    program : WebGLShader;
	shaders : Map<number, WebGLShader>;

    constructor(private gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string)
    {
		this.shaders = new Map<number, WebGLShader>();
        this.program = this.gl.createProgram();
		this.gl.attachShader(this.program, this.GetShader(vertexShader));
		this.gl.attachShader(this.program, this.GetShader(fragmentShader));
		this.gl.linkProgram(this.program);
		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			throw 'Unable to initialize the shader program';
		}
		this.Use();
    }

	Use()
	{
		this.gl.useProgram(this.program);
	}

	Attribute(name: string) : number
	{
		return this.gl.getAttribLocation(this.program, name);
	}

	Uniform(name: string) : WebGLUniformLocation
	{
		return this.gl.getUniformLocation(this.program, name);
	}

	private GetShader(identifier: string): WebGLShader {
		let shaderScript: HTMLScriptElement;
		let shaderSource: string;
		let shader: WebGLShader;

		shaderScript = <HTMLScriptElement>document.getElementById(identifier);
		if (!shaderScript) {
			throw 'Cannot find shader script "' + identifier + '"';
		}
		shaderSource = shaderScript.innerHTML;

		let shaderType = null;
		if (shaderScript.type.toLowerCase() == "x-shader/x-fragment") {
			shaderType = this.gl.FRAGMENT_SHADER
		} else if (shaderScript.type.toLowerCase() == "x-shader/x-vertex") {
			shaderType = this.gl.VERTEX_SHADER;
		}
		else {
			throw 'Unknown shadert type ' + shaderScript.type;
		}
		shader = this.gl.createShader(shaderType);
		this.shaders[shaderType] = shader;
		this.gl.shaderSource(shader, shaderSource);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			throw 'An error occurred while compiling the shader "' + identifier + '": ' + this.gl.getShaderInfoLog(shader) + '\nCource code :\n' + shaderSource;
		}
		return shader;
	}
}