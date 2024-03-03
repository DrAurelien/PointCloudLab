/// <reference path="framebuffer.ts" />
/// <reference path="../objects/scene.ts" />

class EDLFilter implements IRenderingFilter
{
	fbo : FrameBuffer;
	shaders : Shaders;

	color : WebGLUniformLocation;
	depth : WebGLUniformLocation;
	pixScale : WebGLUniformLocation;
	nbhPos : WebGLUniformLocation;
	expScale : WebGLUniformLocation;
	zMin : WebGLUniformLocation;
	zMax : WebGLUniformLocation;
	width : WebGLUniformLocation;
	height : WebGLUniformLocation;
	distNbh : WebGLUniformLocation;
	perspectiveMode : WebGLUniformLocation;
	nbhPositions : Float32Array;
	points : FloatArrayBuffer;
	textCoords : FloatArrayBuffer;
	indices : ElementArrayBuffer;

	constructor(private context: DrawingContext)
	{
		this.Resize(this.context);
		this.shaders = new Shaders(this.context.gl, "RawVertexShader", "EDLFragmentShader");
		this.color = this.shaders.Uniform("colorTexture");
		this.depth = this.shaders.Uniform("depthTexture");
		this.pixScale = this.shaders.Uniform("Pix_scale");
		this.nbhPos = this.shaders.Uniform("Neigh_pos_2D");
		this.expScale = this.shaders.Uniform("Exp_scale");
		this.zMin = this.shaders.Uniform("Zm");
		this.zMax = this.shaders.Uniform("ZM");
		this.width = this.shaders.Uniform("Sx");
		this.height = this.shaders.Uniform("Sy");
		this.distNbh = this.shaders.Uniform("Dist_to_neighbor_pix");
		this.perspectiveMode = this.shaders.Uniform("PerspectiveMode");	

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
			1.0, -1.0, 0.0,
			-1.0, -1.0, 0.0,
			-1.0, 1.0, 0.0,
			1.0, 1.0, 0.0
		]), this.context, 3);
		this.textCoords = new FloatArrayBuffer(new Float32Array([
			0., 0.,
			1., 0.,
			1., 1.,
			0., 1.
		]), this.context, 2);
		this.indices = new ElementArrayBuffer([
			0, 1, 2,
			2, 3, 0
		], this.context, true);

		this.points.BindAttribute(this.shaders.Attribute("VertexPosition"));
		this.textCoords.BindAttribute(this.shaders.Attribute("TextureCoordinate"));
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
	}

	Render(camera: Camera, scene: Scene)
	{
		let depthRange = camera.GetDepthRange(scene);
		this.fbo.Activate(false);
		this.shaders.Use();

		let gl = this.context.gl;
		gl.disable(gl.DEPTH_TEST);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.fbo.ColorTexture());
		gl.uniform1i(this.color, 0);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.fbo.DepthTexture());
		gl.uniform1i(this.depth, 1);

		this.fbo.Check();
		
		gl.uniform1f(this.pixScale, 1.);
		gl.uniform2fv(this.nbhPos, this.nbhPositions);
		gl.uniform1f(this.expScale, 1.);
		gl.uniform1f(this.zMin, depthRange.min);
		gl.uniform1f(this.zMax, depthRange.max);
		gl.uniform1f(this.width, this.context.renderingArea.width);
		gl.uniform1f(this.height, this.context.renderingArea.height);
		gl.uniform1f(this.distNbh, 1.);
		gl.uniform1i(this.perspectiveMode, 1);

		this.indices.Bind();
		gl.drawElements(gl.TRIANGLES, 2, this.context.GetIntType(true), 0);
	}
}