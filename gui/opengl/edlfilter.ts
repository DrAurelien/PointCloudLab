/// <reference path="framebuffer.ts" />
/// <reference path="../objects/scene.ts" />

class EDLFilter implements IRenderingFilter
{
	fbo : FrameBuffer;
	shaders : Shaders;

	private color : WebGLUniformLocation;
	private depth : WebGLUniformLocation;
	private nbhDist : WebGLUniformLocation;
	private expScale : WebGLUniformLocation;
	private zMin : WebGLUniformLocation;
	private zMax : WebGLUniformLocation;
	private width : WebGLUniformLocation;
	private height : WebGLUniformLocation;
	private useColors : WebGLUniformLocation;;
	private nbhPositions : Float32Array;
	private points : FloatArrayBuffer;
	private textCoords : FloatArrayBuffer;
	private indices : ElementArrayBuffer;
	private vertices : number;
	private uv : number;


	constructor(private context: DrawingContext, public withColors:boolean, public expFactor:number=4.0, public neighborDist:number=0.25)
	{
		this.Resize(new ScreenDimensions(this.context.renderingArea.width,this.context.renderingArea.height));
		this.shaders = new Shaders(this.context.gl, "RawVertexShader", "EDLFragmentShader");
		this.shaders.Use();
		this.color = this.shaders.Uniform("colorTexture");
		this.depth = this.shaders.Uniform("depthTexture");
		this.nbhDist = this.shaders.Uniform("NeighborsDist");
		this.expScale = this.shaders.Uniform("ExpFactor");
		this.zMin = this.shaders.Uniform("DepthMin");
		this.zMax = this.shaders.Uniform("DepthMax");
		this.width = this.shaders.Uniform("ScreenWidth");
		this.height = this.shaders.Uniform("ScreenHeight");
		this.useColors = this.shaders.Uniform("UseColors");

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
		if(this.fbo)
			this.fbo.Delete();
		this.fbo = new FrameBuffer(this.context.gl, size.width, size.height);
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
	}

	Render(camera: Camera, scene: Scene)
	{
		let gl = this.context.gl;
		gl.flush();

		this.shaders.Use();
		this.fbo.Activate(false);
		
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.disable(gl.DEPTH_TEST);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.fbo.ColorTexture());
		gl.uniform1i(this.color, 0);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.fbo.DepthTexture());
		gl.uniform1i(this.depth, 1);
		
		let width = this.context.renderingArea.width;
		let height = this.context.renderingArea.height;

		gl.uniform1f(this.nbhDist, this.neighborDist);
		gl.uniform1f(this.expScale, this.expFactor);
		gl.uniform1f(this.zMin, camera.depthRange.min);
		gl.uniform1f(this.zMax, camera.depthRange.max);
		gl.uniform1f(this.width, width);
		gl.uniform1f(this.height, height);
		gl.uniform1i(this.useColors, this.withColors ? 1 : 0);
		
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