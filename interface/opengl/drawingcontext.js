var DrawingContext = (function () {
    function DrawingContext(renderingArea) {
        this.renderingArea = renderingArea;
        this.sampling = 30;
        this.rendering = new RenderingType();
        console.log('Initializing gl context');
        this.gl = (this.renderingArea.getContext("webgl") || this.renderingArea.getContext("experimental-webgl"));
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.useuint = this.gl.getExtension('OES_element_index_uint') ||
            this.gl.getExtension('MOZ_OES_element_index_uint') ||
            this.gl.getExtension('WEBKIT_OES_element_index_uint');
        console.log('Inititalizing gl sharders');
        var fragmentShader = this.GetShader("FragmentShader");
        var vertexShader = this.GetShader("VertexShader");
        this.shaders = this.gl.createProgram();
        this.gl.attachShader(this.shaders, vertexShader);
        this.gl.attachShader(this.shaders, fragmentShader);
        this.gl.linkProgram(this.shaders);
        if (!this.gl.getProgramParameter(this.shaders, this.gl.LINK_STATUS)) {
            throw 'Unable to initialize the shader program';
        }
        this.gl.useProgram(this.shaders);
        console.log('   Inititalizing vertex positions attribute');
        this.vertices = this.gl.getAttribLocation(this.shaders, "VertexPosition");
        this.gl.enableVertexAttribArray(this.vertices);
        console.log('   Inititalizing normals attribute');
        this.normals = this.gl.getAttribLocation(this.shaders, "NormalVector");
        this.EnableNormals(true);
        console.log('   Inititalizing matrices');
        this.projection = this.gl.getUniformLocation(this.shaders, "Projection");
        this.modelview = this.gl.getUniformLocation(this.shaders, "ModelView");
        this.shapetransform = this.gl.getUniformLocation(this.shaders, "ShapeTransform");
        this.color = this.gl.getUniformLocation(this.shaders, "Color");
        this.eyeposition = this.gl.getUniformLocation(this.shaders, "EyePosition");
        this.lightpositions = [];
        this.lightcolors = [];
        this.nblights = this.gl.getUniformLocation(this.shaders, "NbLights");
        for (var index = 0; index < DrawingContext.NbMaxLights; index++) {
            this.lightpositions.push(this.gl.getUniformLocation(this.shaders, "LightPositions[" + index + "]"));
            this.lightcolors.push(this.gl.getUniformLocation(this.shaders, "LightColors[" + index + "]"));
        }
        this.diffuse = this.gl.getUniformLocation(this.shaders, "DiffuseCoef");
        this.ambiant = this.gl.getUniformLocation(this.shaders, "AmbiantCoef");
        this.specular = this.gl.getUniformLocation(this.shaders, "SpecularCoef");
        this.glossy = this.gl.getUniformLocation(this.shaders, "GlossyPow");
        this.usenormals = this.gl.getUniformLocation(this.shaders, "UseNormals");
    }
    DrawingContext.prototype.EnableNormals = function (b) {
        if (b) {
            this.gl.uniform1i(this.usenormals, 1);
            this.gl.enableVertexAttribArray(this.normals);
        }
        else {
            this.gl.uniform1i(this.usenormals, 0);
            this.gl.disableVertexAttribArray(this.normals);
        }
    };
    DrawingContext.prototype.GetIntType = function () {
        if (this.useuint) {
            return this.gl.UNSIGNED_INT;
        }
        return this.gl.UNSIGNED_SHORT;
    };
    DrawingContext.prototype.GetIntArray = function (content) {
        if (this.useuint) {
            return new Uint32Array(content);
        }
        return new Uint16Array(content);
    };
    DrawingContext.prototype.GetShader = function (identifier) {
        var shaderScript;
        var shaderSource;
        var shader;
        shaderScript = document.getElementById(identifier);
        if (!shaderScript) {
            throw 'Cannot find shader script "' + identifier + '"';
        }
        shaderSource = shaderScript.innerHTML;
        if (shaderScript.type.toLowerCase() == "x-shader/x-fragment") {
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        }
        else if (shaderScript.type.toLowerCase() == "x-shader/x-vertex") {
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
    };
    DrawingContext.NbMaxLights = 8;
    return DrawingContext;
}());
//# sourceMappingURL=drawingcontext.js.map