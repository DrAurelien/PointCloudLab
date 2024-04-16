/// <reference path="framebuffer.ts" />
/// <reference path="../objects/scene.ts" />

class EDLFilter implements IRenderingFilter
{
	fbo : FrameBuffer;
	shaders : Shaders;

	color : WebGLUniformLocation;
	depth : WebGLUniformLocation;
	nbhPos : WebGLUniformLocation;
	expScale : WebGLUniformLocation;
	zMin : WebGLUniformLocation;
	zMax : WebGLUniformLocation;
	width : WebGLUniformLocation;
	height : WebGLUniformLocation;
	nbhPositions : Float32Array;
	points : FloatArrayBuffer;
	textCoords : FloatArrayBuffer;
	indices : ElementArrayBuffer;
	vertices : number;
	uv : number;
	useNormals :boolean;

	constructor(private context: DrawingContext)
	{
		this.Resize(this.context);
		this.shaders = new Shaders(this.context.gl, "RawVertexShader", "EDLFragmentShader");
		this.shaders.Use();
		this.color = this.shaders.Uniform("colorTexture");
		this.depth = this.shaders.Uniform("depthTexture");
		this.nbhPos = this.shaders.Uniform("Neighbors");
		this.expScale = this.shaders.Uniform("ExpFactor");
		this.zMin = this.shaders.Uniform("DepthMin");
		this.zMax = this.shaders.Uniform("DepthMax");
		this.width = this.shaders.Uniform("ScreenWidth");
		this.height = this.shaders.Uniform("ScreenHeight");

		this.nbhPositions = new Float32Array([
			-1., -1.,
			-1., 0.,
			-1., 1.,
			0., 1.,
			1., 1.,
			0., 1.,
			-1., 1.,
			-1., 0
		]);

		this.points = new FloatArrayBuffer(new Float32Array([
			-1.0, -1.0, 0.0,
			1.0, -1.0, 0.0,
			1.0, 1.0, 0.0,
			-1.0, 1.0, 0.0,
		]), this.context, 3);
		this.textCoords = new FloatArrayBuffer(new Float32Array([
			0., 0.,
			1., 0.,
			1., 1.,
			0., 1.
		]), this.context, 2);
		this.indices = new ElementArrayBuffer([
			0, 1, 2,
			0, 2, 3
		], this.context, true);

		this.vertices = this.shaders.Attribute("VertexPosition");
		this.context.gl.enableVertexAttribArray(this.vertices);

		this.uv = this.shaders.Attribute("TextureCoordinate");
		this.context.gl.enableVertexAttribArray(this.uv);
	}

	Resize(context: DrawingContext)
	{
		if(this.fbo)
			this.fbo.Delete();
		let width = context.renderingArea.width;
		let height = context.renderingArea.height;
		this.fbo = new FrameBuffer(context.gl, width, height);
	}

	Dispose()
	{
		this.fbo.Activate(false);
		this.fbo.Delete();
		this.fbo = null;
	}

	CollectRendering()
	{
		this.fbo.Activate();
		let gl = this.context.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
	}

	Render(camera: Camera, scene: Scene)
	{
		let gl = this.context.gl;
		gl.flush();

		this.shaders.Use();
		this.fbo.Activate(false);
		
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.fbo.ColorTexture());
		gl.uniform1i(this.color, 0);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.fbo.DepthTexture());
		gl.uniform1i(this.depth, 1);
		
		let width = this.context.renderingArea.width;
		let height = this.context.renderingArea.height;

		gl.uniform2fv(this.nbhPos, this.nbhPositions);
		gl.uniform1f(this.expScale, 4.);
		gl.uniform1f(this.zMin, camera.depthRange.min);
		gl.uniform1f(this.zMax, camera.depthRange.max);
		gl.uniform1f(this.width, width);
		gl.uniform1f(this.height, height);
		
		gl.viewport(0, 0, width, height);

		this.textCoords.BindAttribute(this.uv);
		this.points.BindAttribute(this.vertices);
		this.indices.Bind();
		gl.drawElements(gl.TRIANGLES, 6, this.context.GetIntType(true), 0);
		gl.flush();
	}
}