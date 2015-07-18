function Data(viewingArea)
{
	this.viewingArea = viewingArea;
	this.visibility = null;
	this.handle = null;
	
	this.Initialize = function(scene)
	{
		this.handle = document.createElement('div');
		this.handle.className = 'DataWindowHandle';
		this.viewingArea.appendChild(this.handle);
		this.visibility = {
			visible : true,
			widthToRestore : this.viewingArea.style.width
		};
		this.SwitchVisibility();
	};
	
	this.Resize = function(width, height)
	{
		this.viewingArea.style.height = height-2*this.viewingArea.offsetTop;
		this.handle.style.height = this.viewingArea.style.height;
	}
	
	this.SwitchVisibility = function()
	{
		if(this.visibility.visible)
		{
			this.viewingArea.style.width = this.handle.scrollWidth;
			this.visibility.visible = false;
		}
		else
		{
			this.viewingArea.style.width = this.visibility.widthToRestore;
			this.visibility.visible = true;
		}
	}
}