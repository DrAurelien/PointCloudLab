var Interface = 
{
	sceneRenderer : null,
	dataWindow : null,
	clickSelection : null,
	
	Initialize : function(scene)
	{
		this.InitializeDataWindow(scene);
		this.InitializeRenderer(scene);
		
		window.onresize = function()
		{
			Interface.Refresh();
		}
		this.Refresh();
	},
	
	InitializeDataWindow : function(scene)
	{
		//Create a div to display the scene
		var dataVewing = document.createElement('div');
		dataVewing.className = 'DataWindow';
		document.body.appendChild(dataVewing);
		
		this.dataWindow = new Data(dataVewing);
		this.dataWindow.Initialize(scene);
		
		this.dataWindow.handle.onclick = function(event)
		{
			Interface.dataWindow.SwitchVisibility();
		}
	},
	
	InitializeRenderer : function(scene)
	{
		//Create a canvas to display the scene
		var sceneRenderingArea = document.createElement('canvas');
		sceneRenderingArea.className = 'SceneRendering';
		document.body.appendChild(sceneRenderingArea);
		
		//Create the scene handler
		this.sceneRenderer = new Renderer(sceneRenderingArea);
		this.sceneRenderer.Initialize();
		
		//Handle user commands on scene rendering area
		sceneRenderingArea.oncontextmenu = function (event) {
			event = event ||window.event;
			event.preventDefault();
			return false;
		};
		
		sceneRenderingArea.onmousemove = function(event)
		{
			event = event ||window.event;
			switch(event.which)
			{
				case 1: //Left mouse
					Interface.sceneRenderer.camera.Rotate(-5*event.movementX, 5*event.movementY);
					break;
				case 2: //Middle mouse
					break;
				case 3: //Right mouse
					Interface.sceneRenderer.camera.Pan(event.movementX, event.movementY);
					break;
				default:
					return true;
			}
			Interface.sceneRenderer.Draw(scene);
			return true;
		};
		
		sceneRenderingArea.onmousewheel = function(event)
		{
			event = event ||window.event;
			Interface.sceneRenderer.camera.Zoom(event.wheelDelta/100);
			Interface.sceneRenderer.Draw(scene);
		};
		
		document.onkeypress = function(event)
		{
			event = event ||window.event;
			switch(event.keyCode)
			{
				case 'p'.charCodeAt(0):
					Interface.sceneRenderer.drawingContext.rendering.Point(!Interface.sceneRenderer.drawingContext.rendering.Point());
					break;
				case 'w'.charCodeAt(0):
					Interface.sceneRenderer.drawingContext.rendering.Wire(!Interface.sceneRenderer.drawingContext.rendering.Wire());
					break;
				case 's'.charCodeAt(0):
					Interface.sceneRenderer.drawingContext.rendering.Surface(!Interface.sceneRenderer.drawingContext.rendering.Surface());
					break;
				default:
					return true;
			}
			event.preventDefault();
			Interface.sceneRenderer.Draw(scene);
		};
	},
	
	Refresh : function()
	{
		this.dataWindow.Resize(window.innerWidth, window.innerHeight);
		
		this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
		this.sceneRenderer.Draw(Scene);
	}
}