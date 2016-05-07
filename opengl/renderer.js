function Renderer(renderingArea, refreshCallback)
{
	this.drawingContext =
	{
		renderingArea : renderingArea,
		sampling : 30,
		gl : null,
		shaders : null,
		projection : null,
		modelview : null,
		shapetransform : null,
		vertices : null,
		normals : null,
		usenormals : null,
		//Lighting
		color : null,
		diffuse : null,
		ambiant : null,
		specular : null,
		glossy : null,
		refreshCallback : refreshCallback,
		
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
			console.log('Initializing gl context');
			this.gl = this.renderingArea.getContext("webgl") || this.renderingArea.getContext("experimental-webgl");
			this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.disable(this.gl.CULL_FACE);
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
			this.EnableNormals(true);
			
			console.log('   Inititalizing matrices');
			this.projection = this.gl.getUniformLocation(this.shaders, "Projection");
			this.modelview = this.gl.getUniformLocation(this.shaders, "ModelView");
			this.shapetransform = this.gl.getUniformLocation(this.shaders, "ShapeTransform");
			
			this.color = this.gl.getUniformLocation(this.shaders, "Color");
			this.eyeposition = this.gl.getUniformLocation(this.shaders, "EyePosition");
			this.lightposition = this.gl.getUniformLocation(this.shaders, "LightPosition");
			this.diffuse = this.gl.getUniformLocation(this.shaders, "DiffuseCoef");
			this.ambiant = this.gl.getUniformLocation(this.shaders, "AmbiantCoef");
			this.specular = this.gl.getUniformLocation(this.shaders, "SpecularCoef");
			this.glossy = this.gl.getUniformLocation(this.shaders, "GlossyPow");
			this.usenormals = this.gl.getUniformLocation(this.shaders, "UseNormals");
		},
		
		EnableNormals : function(b)
		{
			if(b)
			{
				this.gl.uniform1i(this.usenormals, 1);
				this.gl.enableVertexAttribArray(this.normals);
			}
			else
			{
				this.gl.uniform1i(this.usenormals, 0);
				this.gl.disableVertexAttribArray(this.normals);
			}
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
	};
	
	this.camera =
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
			
			//Lighting
			context.gl.uniform3fv(context.eyeposition, new Float32Array(this.at.Flatten()));
			context.gl.uniform3fv(context.lightposition, new Float32Array([100.0, 100.0, 100.0])); //TODO : parameter light
			
			context.gl.viewport(0,0,this.screen.width,this.screen.height);
			context.gl.clear(context.gl.COLOR_BUFFER_BIT|context.gl.DEPTH_BUFFER_BIT);
		},
		
		GetInnerBase : function()
		{
			var lookAt = this.to.Minus(this.at);
			var d = lookAt.Norm();
			lookAt = lookAt.Times(1./d);
			var right = lookAt.Cross(this.up).Normalized();
			var up = right.Cross(lookAt).Normalized();
			return {right:right, up:up, lookAt:lookAt, distance:d};
		},
		
		GetModelViewMatrix : function()
		{
			var innerBase = this.GetInnerBase();
			var basechange = IdentityMatrix(4);
			var translation = IdentityMatrix(4);
			for(var index=0; index<3; index++)
			{
				basechange.SetValue(0, index, innerBase.right.Get(index));
				basechange.SetValue(1, index, innerBase.up.Get(index));
				basechange.SetValue(2, index, -innerBase.lookAt.Get(index));
				translation.SetValue(index, 3, -this.at.Get(index));
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
			
			var deltax = innerBase.right.Times(objectSpaceWidth*-dx/this.screen.width);
			var deltay = innerBase.up.Times(objectSpaceHeight*-dy/this.screen.height);
			var delta = deltax.Plus(deltay);
			
			this.at = this.at.Plus(delta);
			this.to = this.to.Plus(delta);
		},
		
		Rotate : function(dx, dy)
		{
			//DX rotation (around Y axis)
			var angle = 2*Math.PI*-dx / this.screen.width;
			var innerBase = this.GetInnerBase();
			var rotation = RotationMatrix(innerBase.up, angle);
			var point = new Matrix(1, 4, this.at.Minus(this.to).Flatten().concat([1]));
			point = rotation.Multiply(point);
			for(var index=0; index<3; index++)
			{
				this.at.Set(index, point.values[index]);
			}
			this.at = this.to.Plus(this.at);
			this.up = innerBase.up;

			
			//DY rotation (around X axis)
			angle = Math.PI*dy / this.screen.height;
			innerBase = this.GetInnerBase();
			rotation = RotationMatrix(innerBase.right, angle);
			point = new Matrix(1, 4, this.at.Minus(this.to).Flatten().concat([1]));
			var updir = new Matrix(1, 4, innerBase.up.Flatten().concat([0]));
			point = rotation.Multiply(point);
			updir = rotation.Multiply(updir);
			for(var index=0; index<3; index++)
			{
				this.at.Set(index, point.values[index]);
				this.up.Set(index, updir.values[index]);
			}
			this.at = this.to.Plus(this.at);
		},
		
		Zoom : function(d)
		{
			var innerBase = this.GetInnerBase();
			innerBase.distance *= Math.pow(0.9, d);
			
			this.at = this.to.Minus(innerBase.lookAt.Times(innerBase.distance));
		},
		
		ComputeProjection : function(v)
		{
			var u;
			if(v.Dimension()==3)
				u = new Matrix(1, 4, v.Flatten().concat([1.0]));
			else
				u = new Matrix(1, 4, v.Flatten());
			var projection = this.GetProjectionMatrix();
			var modelview = this.GetModelViewMatrix();
			var render = projection.Multiply(modelview);
			var w = new Vector(render.Multiply(u).values);
			return w.Times(1./w.Get(3));
			//Viewport
			w.Set(0, (w.Get(0)+1.0)*this.screen.width/2.0);
			w.Set(1, (w.Get(1)+1.0)*this.screen.height/2.0);
			return w
		},
		
		ComputeInvertedProjection : function(p)
		{
			var u;
			if(p.Dimension()==3)
				u = new Matrix(1, 4, p.Flatten().concat([1.0]));
			else
				u = new Matrix(1, 4, p.Flatten());
			//First : screen to normalized screen coordinates
			u.SetValue(0, 0, 2.0*u.GetValue(0,0)/this.screen.width - 1.0);
			u.SetValue(1, 0, 1.0 - 2.0*u.GetValue(1,0)/this.screen.height);
			//Then : normalized screen to world coordinates
			var projection = this.GetProjectionMatrix();
			var modelview = this.GetModelViewMatrix();
			var render = projection.Multiply(modelview);
			var v = render.LUSolve(u);
			var w = new Vector([0, 0, 0]);
			for(var index=0; index<3; index++)
			{
				w.Set(index, v.GetValue(index, 0)/v.GetValue(3, 0));
			}
			return w;
		}
	};
	
	this.mouseTracker = null;
	
	this.Initialize = function(scene)
	{
		this.drawingContext.Initialize();
		this.Draw(Scene);
		
		var renderer = this;
		this.drawingContext.renderingArea.oncontextmenu = function (event) {
			event = event ||window.event;
			event.preventDefault();
			return false;
		};
		
		this.drawingContext.renderingArea.onmousedown = function(event)
		{
			event = event || window.event;
			renderer.mouseTracker = {
				x : event.clientX,
				y : event.clientY,
				button : event.which,
				date : new Date()
			};
		};
		
		
		this.drawingContext.renderingArea.onmouseup = function(event)
		{
			event = event || window.event;
			var now = new Date();
			if(renderer.mouseTracker != null)
			{
				if(now.getTime()-renderer.mouseTracker.date.getTime() < 200)
				{
					var selected = renderer.PickObject(event.clientX, event.clientY, scene);
					scene.Select(selected);
					refreshCallback(selected);
				}
			}
			renderer.mouseTracker = null;
		};
		
		this.drawingContext.renderingArea.onmousemove = function(event)
		{
			event = event || window.event;
			
			var dx=0, dy=0;
			if(renderer.mouseTracker)
			{
				dx = event.clientX-renderer.mouseTracker.x;
				//Screen coordinate system is top-left (oriented down) while camera is oriented up
				dy = renderer.mouseTracker.y-event.clientY;
				renderer.mouseTracker.x = event.clientX;
				renderer.mouseTracker.y = event.clientY;
			
				switch(renderer.mouseTracker.button)
				{
					case 1: //Left mouse
						renderer.camera.Rotate(dx, dy);
						break;
					case 2: //Middle mouse
						renderer.camera.Zoom(dy/10);
						break;
					case 3: //Right mouse
						renderer.camera.Pan(dx, dy);
						break;
					default:
						return true;
				}
				
				renderer.Draw(scene);
			}
			return true;
		};
		
		this.drawingContext.renderingArea.onmousewheel = function(event)
		{
			event = event ||window.event;
			renderer.camera.Zoom(event.wheelDelta/100);
			renderer.Draw(scene);
		};
		
		document.onkeypress = function(event)
		{
			event = event || window.event;
			var key = event.key ? event.key.charCodeAt(0) : event.keyCode;
			switch(key)
			{
				case 'p'.charCodeAt(0):
					renderer.drawingContext.rendering.Point(!renderer.drawingContext.rendering.Point());
					break;
				case 'w'.charCodeAt(0):
					renderer.drawingContext.rendering.Wire(!renderer.drawingContext.rendering.Wire());
					break;
				case 's'.charCodeAt(0):
					renderer.drawingContext.rendering.Surface(!renderer.drawingContext.rendering.Surface());
					break;
				default:
					return true;
			}
			renderer.Draw(scene);
		};
	};
	
	this.Draw = function(scene)
	{
		var gl = this.drawingContext.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		this.camera.InititalizeDrawingContext(this.drawingContext);
		if(scene)
		{
			scene.Draw(this.drawingContext);
		}
	};
	
	this.Resize = function(width, height)
	{
		this.drawingContext.renderingArea.width = width;
		this.drawingContext.renderingArea.height = height;
	};
	
	this.GetRay = function(x, y)
	{
		var point = this.camera.ComputeInvertedProjection(new Vector([x, y, -1.0]));
		return {
			from : this.camera.at,
			dir : point.Minus(this.camera.at).Normalized()
		};
	};
	
	this.ResolveRayIntersection = function(ray, scene)
	{
		var picked = null;
		for(var index=0; index<scene.objects.length; index++)
		{
			if(scene.objects[index].visible)
			{
				var intersections = scene.objects[index].RayIntersection(ray);
				for(var ii=0; ii<intersections.length; ii++)
				{
					if(picked == null || picked.depth>intersections[ii])
					{
						picked={
							object : scene.objects[index],
							depth : intersections[ii]
						};
					}
				}
			}
		}
		return picked;
	};
	
	this.PickObject = function(x, y, scene)
	{
		var ray = this.GetRay(x, y);
		var picked = this.ResolveRayIntersection(ray, scene);
		
		if(picked != null)
		{
			return picked.object;
		}
		return null;
	};
	
	
	this.ScanFromCurrentViewPoint = function(scene, resultHandler)
	{
		var self = this;
		var resolution =
		{
			width : 1024,
			height : 768,
			currenti : 0,
			currentj : 0,
			next : function()
			{
				this.currentj++;
				if(this.currentj >= this.height)
				{
					this.currentj = 0;
					this.currenti ++;
				}
				if(this.currenti < this.width)
				{
					return {
						current : this.currenti * this.width + this.currentj,
						total : this.width * this.height
					};
				}
				return null;
			},
			log : function()
			{
				return '' + this.width + 'x' + this.height;
			}
		};
		
		var cloud = new PointCloud();
		cloud.Reserve(resolution.width * resolution.height);
		
		function GenerateScanRay()
		{			
			var ray = self.GetRay(
				self.camera.screen.width * (resolution.currenti / resolution.width),
				self.camera.screen.height * (resolution.currentj / resolution.height)
			);
			var intersection = self.ResolveRayIntersection(ray, scene);
			if(intersection)
			{
				var point = ray.from.Plus(ray.dir.Times(intersection.depth));
				cloud.PushPoint(point);
			}
			return resolution.next();
		}
		
		function HandleResult()
		{
			if(resultHandler)
			{
				resultHandler(cloud);
			}
		}
		
		LongProcess('Scanning the scene (' + resolution.log() + ')', GenerateScanRay, HandleResult);
	};
};