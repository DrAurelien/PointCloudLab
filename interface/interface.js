var Interface = 
{
	sceneRenderer : null,
	dataHandler : null,
	clickSelection : null,
	
	Initialize : function(scene)
	{
		this.InitializeDataHandler(scene);
		this.InitializeRenderer(scene);
		
		window.onresize = function()
		{
			Interface.Refresh();
		}
		this.Refresh();
	},
	
	InitializeDataHandler : function(scene)
	{
		//Create a div to display the scene
		var dataVewing = document.createElement('div');
		dataVewing.className = 'DataWindow';
		document.body.appendChild(dataVewing);
		
		var self = this;
		this.dataHandler = new DataHandler(dataVewing, function() {self.Refresh();});
		this.dataHandler.Initialize(scene);
		
		this.dataHandler.handle.onclick = function(event)
		{
			Interface.dataHandler.SwitchVisibility();
		}
	},
	
	InitializeRenderer : function(scene)
	{
		//Create a canvas to display the scene
		var sceneRenderingArea = document.createElement('canvas');
		sceneRenderingArea.className = 'SceneRendering';
		document.body.appendChild(sceneRenderingArea);
		
		//Create the scene handler
		self = this;
		function Refresh(selectedItems)
		{
			if(selectedItems)
			{
				self.dataHandler.currentItem = selectedItems;
			}
			self.Refresh();
		}
		this.sceneRenderer = new Renderer(sceneRenderingArea, Refresh);
		this.sceneRenderer.Initialize(scene);
	},
	
	Refresh : function()
	{
		this.dataHandler.Resize(window.innerWidth, window.innerHeight);
		this.dataHandler.RefreshContent(Scene);
		
		this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
		this.sceneRenderer.Draw(Scene);
	}
}