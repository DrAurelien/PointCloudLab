/// <reference path="framebuffer.ts" />
/// <reference path="../objects/scene.ts" />

class GlowFilter implements IRenderingFilter
{
	sceneFBO : FrameBuffer;
	selectionFBO : FrameBuffer;
	shaders : Shaders;

	private targetcolor : WebGLUniformLocation;
	private targetdepth : WebGLUniformLocation;
	private selectiondepth : WebGLUniformLocation;
	private width : WebGLUniformLocation;
	private height : WebGLUniformLocation;
	private points : FloatArrayBuffer;
	private textCoords : FloatArrayBuffer;
	private indices : ElementArrayBuffer;
	private vertices : number;
	private uv : number;


	constructor(private context: DrawingContext)
	{
		this.Resize(new ScreenDimensions(this.context.renderingArea.width,this.context.renderingArea.height));
		this.shaders = new Shaders(this.context.gl, "RawVertexShader", "GlowFragmentShader");
		this.shaders.Use();
		this.targetcolor = this.shaders.Uniform("targetColorTexture");
		this.targetdepth = this.shaders.Uniform("targetDepthTexture");
		this.selectiondepth = this.shaders.Uniform("selectionDepthTexture");
		this.width = this.shaders.Uniform("ScreenWidth");
		this.height = this.shaders.Uniform("ScreenHeight");

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

	Resize(size: ScreenDimensions)
	{
		if(this.sceneFBO)
			this.sceneFBO.Delete();
		this.sceneFBO = new FrameBuffer(this.context.gl, size.width, size.height);
		this.sceneFBO.ColorTexture();
		this.sceneFBO.DepthTexture();
		if(this.selectionFBO)
			this.selectionFBO.Delete();
		this.selectionFBO = new FrameBuffer(this.context.gl, size.width, size.height);
		this.selectionFBO.ColorTexture();
		this.selectionFBO.DepthTexture();
	}

	Clone() : IRenderingFilter
	{
		return new GlowFilter(this.context);
	}

	Dispose()
	{
		this.sceneFBO.Activate(false);
		this.sceneFBO.Delete();
		this.sceneFBO = null;
		this.selectionFBO.Activate(false);
		this.selectionFBO.Delete();
		this.selectionFBO = null;
	}

	CollectRendering(scene : Scene)
	{
		let gl = this.context.gl;
		
		this.selectionFBO.Activate();
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		this.context.showselectiononly = true;
		scene.Draw(this.context);
		this.context.showselectiononly = false;
		this.selectionFBO.Activate(false);

		this.sceneFBO.Activate();
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		scene.Draw(this.context);
	}

	Render(camera: Camera, scene: Scene)
	{
		let gl = this.context.gl;
		gl.flush();

		this.shaders.Use();
		this.sceneFBO.Activate(false);
		this.selectionFBO.Activate(false);
		
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.disable(gl.DEPTH_TEST);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.ColorTexture());
		gl.uniform1i(this.targetcolor, 0);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.DepthTexture());
		gl.uniform1i(this.targetdepth, 1);
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, this.selectionFBO.DepthTexture());
		gl.uniform1i(this.selectiondepth, 2);
		
		let width = this.context.renderingArea.width;
		let height = this.context.renderingArea.height;

		gl.uniform1f(this.width, width);
		gl.uniform1f(this.height, height);
		
		gl.viewport(0, 0, width, height);

		this.context.gl.enableVertexAttribArray(this.vertices);
		this.context.gl.enableVertexAttribArray(this.uv);
		this.textCoords.BindAttribute(this.uv);
		this.points.BindAttribute(this.vertices);
		this.indices.Bind();
		gl.drawElements(gl.TRIANGLES, 6, this.context.GetIntType(true), 0);
		gl.flush();
	}
}