class FrameBuffer
{
    textures : Map<number, WebGLTexture>;
	fbo : WebGLFramebuffer;

	constructor(private gl : WebGL2RenderingContext, private width: number, private height: number)
	{
        this.textures = new Map<number, WebGLTexture>();
		this.fbo = gl.createFramebuffer();
        this.ColorTexture();
	}

	Delete()
	{
		this.gl.deleteFramebuffer(this.fbo);
		this.fbo = null;
	}

	Activate(b: boolean = true)
	{
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, b ? this.fbo : null);
	}

    ColorTexture() : WebGLTexture
    {
        return this.AttachTexture(this.gl.COLOR_ATTACHMENT0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE);
    }

    DepthTexture() : WebGLTexture
    {
        return this.AttachTexture(this.gl.DEPTH_ATTACHMENT, this.gl.DEPTH_COMPONENT32F, this.gl.DEPTH_COMPONENT, this.gl.FLOAT);
    }

	Check()
	{
		this.Activate();
		let status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
		if(status != this.gl.FRAMEBUFFER_COMPLETE)
			throw "Unexpected frame buffer status: " + status;

	}

	private AttachTexture(attachment: number, internalFormat: number, format: number, storage: number) : WebGLTexture
	{
        if(attachment in this.textures)
            return this.textures[attachment];

        let previousFBO = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);

		let texture = this.gl.createTexture();
		let level = 0;
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

		this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, this.width, this.height, 0, format, storage, null);
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, texture, level);
		
        if(previousFBO != this.fbo)
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, previousFBO);
        
        this.textures[attachment] = texture;
		return texture;
	}
}