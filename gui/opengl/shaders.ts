class Shaders
{
    shaders : WebGLShader;

    constructor(private gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string)
    {
        this.shaders = this.gl.createProgram();
		this.gl.attachShader(this.shaders, this.GetShader(vertexShader));
		this.gl.attachShader(this.shaders, this.GetShader(fragmentShader));
		this.gl.linkProgram(this.shaders);
		if (!this.gl.getProgramParameter(this.shaders, this.gl.LINK_STATUS)) {
			throw 'Unable to initialize the shader program';
		}
		this.Use();
    }

	Use()
	{
		this.gl.useProgram(this.shaders);
	}

	Attribute(name: string) : number
	{
		return this.gl.getAttribLocation(this.shaders, name);
	}

	Uniform(name: string) : WebGLUniformLocation
	{
		return this.gl.getUniformLocation(this.shaders, name);
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