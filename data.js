function Data(dataWindow)
{
	this.window = dataWindow;
	this.dataArea = null;
	this.propertiesArea = null;
	this.visibility = null;
	this.handle = null;
	this.currentProperties = null;
	this.currentItem = null;
	
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
			this.dataArea.style.borderBottom = '1px solid lightGray';
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
	};
	
	//Refresh content of data and properties views
	this.RefreshContent = function(scene)
	{
		this.dataArea.innerHTML = '';
		for(var index=0; index<scene.objects.length; index++)
		{
			var currentObject = scene.objects[index];
			var item = document.createElement('div');
			item.className = 'SceneItem';
			var itemContent = document.createTextNode(currentObject.name);
			item.appendChild(itemContent);
			
			//Javascript closure : create an object to avoid closure issues
			function ItemClicked(object, target)
			{
				this.object = object;
				this.target = target;
				
				this.Callback = function(event)
				{
					var self = this;
					return function()
					{
						self.target.currentProperties = self.object.GetProperties();
						self.target.RefreshContent(scene);
						self.target.currentItem = self.object;
					}
				}
			}
			
			item.onclick = new ItemClicked(currentObject, this).Callback();
			
			this.dataArea.appendChild(item);
		}
		
		this.HandlePropertiesWindowVisibility();
		if(this.currentProperties != null)
		{
			var table = this.DisplayedProperties(this.currentProperties);
			this.propertiesArea.innerHTML = '';
			this.propertiesArea.appendChild(table);
		}
	};
	
	//Computes the table showing the properties in parameter
	this.DisplayedProperties = function(properties)
	{
		var table = document.createElement('table');
		table.callName = 'Properties';
		for(var property in properties)
		{
			var row = document.createElement('tr');
			row.className = 'Property';
			
			var leftCol = document.createElement('td');
			leftCol.className = 'PropertyName';
			var leftColContent = document.createTextNode(property + ' :');
			leftCol.appendChild(leftColContent);
			row.appendChild(leftCol);
			
			var rightCol = document.createElement('td');
			rightCol.className = 'PropertyValue';
			var rightColContent;
			if(properties[property] instanceof Object)
			{
				rightColContent = this.DisplayedProperties(properties[property]);
				rightColContent.style.borderLeft = '1px solid darkgray';
			}
			else
			{
				rightColContent = document.createTextNode(properties[property]);
			}
			rightCol.appendChild(rightColContent);
			row.appendChild(rightCol);
			
			table.appendChild(row);
		}
		
		return table;
	}
}