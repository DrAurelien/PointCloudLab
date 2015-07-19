function Data(dataWindow)
{
	this.window = dataWindow;
	this.dataArea = null;
	this.propertiesArea = null;
	this.visibility = null;
	this.handle = null;
	this.currentProperties = null;
	
	this.Initialize = function(scene)
	{
		//Data visualization
		this.dataArea = document.createElement('div');
		this.dataArea.className = 'DataArea';
		this.window.appendChild(this.dataArea);
		
		//Properties visualization
		this.propertiesArea = document.createElement('div');
		this.propertiesArea.className = 'PropertiesArea';
		this.window.appendChild(this.propertiesArea);
		
		//Window handle
		this.handle = document.createElement('div');
		this.handle.className = 'DataWindowHandle';
		this.window.appendChild(this.handle);
		
		this.visibility = {
			visible : true,
			widthToRestore : this.window.style.width
		};
		
		this.SwitchVisibility();
		this.RefreshContent(scene);
	};
	
	this.Resize = function(width, height)
	{
		this.window.style.height = height-2*this.window.offsetTop;
		this.handle.style.height = this.window.style.height;
		
		this.HandlePropertiesWindowVisibility();
		
	};
	
	this.HandlePropertiesWindowVisibility = function()
	{
		if(this.currentProperties != null)
		{
			this.dataArea.style.height = this.window.clientHeight/2;
			this.propertiesArea.style.height = this.dataArea.style.height;
			this.dataArea.style.borderBottom = '1px solid white';
			this.propertiesArea.style.borderTop = '1px solid darkGray';
		}
		else
		{
			this.dataArea.style.height = this.window.clientHeight;
			this.propertiesArea.style.height = "0px";
			this.dataArea.style.borderBottom = '';
			this.propertiesArea.style.borderTop = '';
		}
	};
	
	this.SwitchVisibility = function()
	{
		if(this.visibility.visible)
		{
			this.window.style.width = this.handle.scrollWidth;
			this.window.style.paddingRight = 0;
			this.visibility.visible = false;
			this.handle.style.cursor = 'e-resize';
			this.dataArea.style.display= 'none';
			this.propertiesArea.style.display = 'none';
		}
		else
		{
			this.window.style.width = this.visibility.widthToRestore;
			this.window.style.paddingRight = this.handle.scrollWidth;
			this.visibility.visible = true;
			this.handle.style.cursor = 'w-resize';
			this.dataArea.style.display= 'block';
			this.propertiesArea.style.display = 'block';
		}
	}
	
	this.RefreshContent = function(scene)
	{
		this.dataArea.innerHTML = '';
		for(var index=0; index<scene.objects.length; index++)
		{
			var item = document.createElement('div');
			var itemContent = document.createTextNode(scene.objects[index].name);
			item.appendChild(itemContent);
			this.dataArea.appendChild(item);
		}
	}
}