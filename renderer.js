var Renderer = 
{
	drawingContext : 
	{
		renderingArea : null,
		gl : null,
		shaders : null,
		projection : null,
		modelview : null,
		shapetransform : null,
		vertices : null,
		normals : null,
		
		//How to render elements (using points, wire, or surfaces, or combinations of these options)
		rendering :
		{
			value : 4,
			
			Point : function(activate)
			{
				return this.Set(activate, 1);
			},
			Wire : function(activate)
			{
				return this.Set(activate, 2);
			},
			Surface : function(activate)
			{
				return this.Set(activate, 4);
			},
			Set : function(activate, base)
			{
				if(activate===true) this.value = this.value | base;
				else if(activate===false) this.value = this.value ^ base;
				return ((this.value & base) != 0);
			}
		},
		
		Initialize : function()
		{
			console.log('Intitalizing rendering area');
			this.RefreshSize();
			this.renderingArea.focus();
			
			console.log('Initializing gl context');
			this.gl = this.renderingArea.getContext("webgl") || this.renderingArea.getContext("experimental-webgl");
			this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.depthFunc(this.gl.LEQUAL);
			
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
			this.gl.enableVertexAttribArray(this.normals);
			
			console.log('   Inititalizing matrices');
			this.projection = this.gl.getUniformLocation(this.shaders, "Projection");
			this.modelview = this.gl.getUniformLocation(this.shaders, "ModelView");
			this.shapetransform = this.gl.getUniformLocation(this.shaders, "ShapeTransform");
		},
		
		RefreshSize : function()
		{
			this.renderingArea = document.getElementById('RenderingArea');
			this.renderingArea.width = window.innerWidth;
			this.renderingArea.height = window.innerHeight;
		},
		
		GetShader : function(identifier)
		{
			var shaderScript, shaderSource, shader;

			shaderScript = document.getElementById(identifier);
			if (!shaderScript) {
				throw 'Cannot find shader script "'+identifier+'"';
			}
			shaderSource = shaderScript.innerHTML;
			
			if (shaderScript.type.toLowerCase() == "x-shader/x-fragment") {
				shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
			} else if (shaderScript.type.toLowerCase() == "x-shader/x-vertex") {
				shader = this.gl.createShader(this.gl.VERTEX_SHADER);
			}
			else
			{
				throw 'Unknown shadert type ' + shaderScript.type;
			}
			this.gl.shaderSource(shader, shaderSource);
			this.gl.compileShader(shader);
			if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {  
				throw 'An error occurred while compiling the shader "'+identifier+'": ' + this.gl.getShaderInfoLog(shader) +'\nCource code :\n' + shaderSource;  
			}
			return shader;
		}
	},
	
	camera :
	{
		//Camera location
		at : new Vector([.0, .0, -10.0]),
		//Camera aim point
		to : new Vector([.0, .0, .0]),
		//Camera vertical direction
		up : new Vector([.0, 1.0, .0]),
		//near clipping distince
		near : 0.001,
		//far clipping dtstance
		far : 10000.0,
		//Field of view
		fov : Math.PI/4,
		//Screen dimensions
		screen : null,
		
		InititalizeDrawingContext : function(context)
		{
			//Screen size
			this.screen = {
				width : context.renderingArea.width,
				height : context.renderingArea.height
			};
			
			//ModelView
			var modelview = this.GetModelViewMatrix();
			context.gl.uniformMatrix4fv(context.modelview, false, new Float32Array(modelview.values));
			
			//Projection
			var projection = this.GetProjectionMatrix();
			context.gl.uniformMatrix4fv(context.projection, false, new Float32Array(projection.values));
			
			context.gl.viewport(0,0,this.screen.width,this.screen.height);
			context.gl.clear(context.gl.COLOR_BUFFER_BIT|context.gl.DEPTH_BUFFER_BIT);
		},
		
		GetInnerBase : function()
		{
			var z = this.to.Minus(this.at);
			var d = z.Norm();
			z = z.Times(1./d);
			var x = this.up.Cross(z);
			var y = z.Cross(x);
			return {x:x, y:y, z:z, distance:d};
		},
		
		GetModelViewMatrix : function()
		{
			var innerBase = this.GetInnerBase();
			var basechange = IdentityMatrix(4);
			var translation = IdentityMatrix(4);
			for(var index=0; index<3; index++)
			{
				basechange.SetValue(0, index, -innerBase.x.coordinates[index]);
				basechange.SetValue(1, index, innerBase.y.coordinates[index]);
				basechange.SetValue(2, index, -innerBase.z.coordinates[index]);
				translation.SetValue(index, 3, -this.at.coordinates[index]);
			}
			return basechange.Multiply(translation);
		},
		
		GetProjectionMatrix : function()
		{
			var aspectRatio = this.screen.width / this.screen.height;
			var projection = NullMatrix(4, 4);
			var f = 1./Math.tan(this.fov/2.);
			projection.SetValue(0, 0, f/aspectRatio);
			projection.SetValue(1, 1, f);
			projection.SetValue(2, 2, -(this.near+this.far) / (this.far-this.near));
			projection.SetValue(2, 3, -(2.0*this.near*this.far) / (this.far-this.near));
			projection.SetValue(3, 2, -1.0);
			return projection;
		},
		
		Pan : function(dx, dy)
		{
			var f = Math.tan(this.fov/2.0);
			var innerBase = this.GetInnerBase();
			var objectSpaceHeight = f*innerBase.distance;
			var objectSpaceWidth = objectSpaceHeight*this.screen.width/this.screen.height;
			
			var deltax = innerBase.x.Times(objectSpaceWidth*dx/this.screen.width);
			var deltay = innerBase.y.Times(objectSpaceHeight*dy/this.screen.height);
			var delta = deltax.Plus(deltay);
			
			this.at = this.at.Plus(delta);
			this.to = this.to.Plus(delta);
		},
		
		Rotate : function(dx, dy)
		{
			var f = Math.tan(this.fov/2.0);
			var innerBase = this.GetInnerBase();
			var objectSpaceHeight = f*innerBase.distance;
			var objectSpaceWidth = objectSpaceHeight*this.screen.width/this.screen.height;
			
			var deltax = innerBase.x.Times(-objectSpaceWidth*dx/this.screen.width);
			var deltay = innerBase.y.Times(objectSpaceHeight*dy/this.screen.height);
			var delta = deltax.Plus(deltay);
			
			this.at = this.at.Plus(delta);
			var newInnerBase = this.GetInnerBase();
			this.at = this.to.Minus(newInnerBase.z.Times(innerBase.distance));
			this.up = newInnerBase.y;
		},
		
		Zoom : function(d)
		{
			var innerBase = this.GetInnerBase();
			innerBase.distance *= Math.pow(0.9, d);
			
			this.at = this.to.Minus(innerBase.z.Times(innerBase.distance));
		},
		
		ComputeProjection : function(v)
		{
			var u;
			if(v.coordinates.length==3)
				u = new Matrix(1, 4, [v.coordinates[0], v.coordinates[1], v.coordinates[2], 1.0]);
			else
				u = new Matrix(1, 4, v.coordinates);
			var projection = this.GetProjectionMatrix();
			var modelview = this.GetModelViewMatrix();
			var render = projection.Multiply(modelview);
			var w = new Vector(render.Multiply(u).values);
			return w.Times(1./w.coordinates[3]);
		}
	},
	
	Inititalize : function(scene)
	{
		this.drawingContext.Initialize();
		this.Draw(Scene);
		
		this.drawingContext.renderingArea.oncontextmenu = function (event) {
			event = event ||window.event;
			event.preventDefault();
			return false;
		};
		
		this.drawingContext.renderingArea.onmousemove = function(event)
		{
			event = event ||window.event;
			switch(event.which)
			{
				case 1: //Left mouse
					Renderer.camera.Rotate(-5*event.movementX, 5*event.movementY);
					break;
				case 2: //Middle mouse
					break;
				case 3: //Right mouse
					Renderer.camera.Pan(event.movementX, event.movementY);
					break;
				default:
					return true;
			}
			Renderer.Draw(scene);
			return true;
		};
		
		this.drawingContext.renderingArea.onmousewheel = function(event)
		{
			event = event ||window.event;
			Renderer.camera.Zoom(event.wheelDelta/100);
			Renderer.Draw(scene);
		};
		
		document.onkeypress = function(event)
		{
			event = event ||window.event;
			switch(event.keyCode)
			{
				case 'p'.charCodeAt(0):
					Renderer.drawingContext.rendering.Point(!Renderer.drawingContext.rendering.Point());
					break;
				case 'w'.charCodeAt(0):
					Renderer.drawingContext.rendering.Wire(!Renderer.drawingContext.rendering.Wire());
					break;
				case 's'.charCodeAt(0):
					Renderer.drawingContext.rendering.Surface(!Renderer.drawingContext.rendering.Surface());
					break;
				default:
					return true;
			}
			Renderer.Draw(scene);
		};
	},
	
	Draw : function(scene)
	{
		var gl = this.drawingContext.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		this.drawingContext.RefreshSize();
		this.camera.InititalizeDrawingContext(this.drawingContext);
		if(scene)
		{
			scene.Draw(this.drawingContext);
		}
	}
};