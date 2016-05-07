function DataHandler(dataWindow, updateCallback)
{
	this.window = dataWindow;
	this.dataArea = null;
	this.propertiesArea = null;
	this.visibility = null;
	this.handle = null;
	this.currentItem = null;
	this.updateCallback = updateCallback;
	
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
		if(this.currentItem != null)
		{
			var height = this.window.clientHeight/2;
			this.dataArea.style.height = height;
			var delta = this.dataArea.getBoundingClientRect().height - height; //because of margins and padding
			height -= delta;
			this.dataArea.style.height = height;
			this.propertiesArea.style.height = this.dataArea.style.height;
			this.dataArea.style.borderBottom = '1px solid lightGray';
			this.propertiesArea.style.borderTop = '1px solid darkGray';
		}
		else
		{
			var height = this.window.clientHeight;
			this.dataArea.style.height = height;
			var delta = this.dataArea.getBoundingClientRect().height - height; //because of margins and padding
			height -= delta;
			this.dataArea.style.height = height;
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
		this.RefreshData(scene);
		this.RefreshProperties();
	};
	
	this.RefreshData = function(scene)
	{
		this.dataArea.innerHTML = '';
		
		var container = document.createElement('table');
		container.width = '100%';
		var containerRow = document.createElement('tr');
		container.appendChild(containerRow);
		this.dataArea.appendChild(container);
		
		//Buttons
		var dataHandler = this;
		function CreateItem(objectName)
		{
			return {
				label : objectName,
				callback : function()
				{
					var createdObject = null;
					switch(objectName)
					{
						case 'Sphere' :
							createdObject = new Sphere(new Vector([0, 0, 0]), 1);
							break;
						case 'Cylinder' :
							createdObject = new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1);
							break;
						case 'Torus' :
							createdObject = new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1);
							break;
						case 'Scan from current viewpoint':
							createdObject = Interface.sceneRenderer.ScanFromCurrentViewPoint(scene);
							break;
						default : break;
					}
					
					scene.objects.push(createdObject);
					scene.Select(createdObject);
					dataHandler.currentItem = createdObject;
					if(dataHandler.updateCallback != null)
					{
						dataHandler.updateCallback();
					}
				}
			};
		}
		
		var createCombo = ComboBox('New',
		[
			CreateItem('Sphere'),
			CreateItem('Cylinder'),
			CreateItem('Torus'),
			CreateItem('Scan from current viewpoint')
		]);
		
		var containerCell = document.createElement('td');
		containerRow.appendChild(containerCell);
		containerCell.appendChild(createCombo);
		
		var openButton = FileOpener('Open', function(createdObject) {
			if(createdObject != null)
			{
				scene.objects.push(createdObject);
				scene.Select(createdObject);
				dataHandler.currentItem = createdObject;
				if(dataHandler.updateCallback != null)
				{
					dataHandler.updateCallback();
				}
			}
		});
		var containerCell = document.createElement('td');
		containerRow.appendChild(containerCell);
		containerCell.appendChild(openButton);
		
		//Scene
		for(var index=0; index<scene.objects.length; index++)
		{
			var currentObject = scene.objects[index];
			var item = document.createElement('div');
			item.className = (currentObject == this.currentItem)?'SelectedSceneItem':'SceneItem';
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
						self.target.currentItem = self.object;
						scene.Select(self.object);
						if(self.target.updateCallback != null)
						{
							self.target.updateCallback();
						}
						else
						{
							self.target.RefreshContent(scene);
						}
					}
				}
			}
			
			item.onclick = new ItemClicked(currentObject, this).Callback();
			
			this.dataArea.appendChild(item);
		}
	}
	
	this.RefreshProperties = function()
	{
		this.HandlePropertiesWindowVisibility();
		if(this.currentItem != null)
		{
			var currentProperties = this.currentItem.GetProperties();
			var table = this.DisplayProperties(currentProperties);
			this.propertiesArea.innerHTML = '';
			this.propertiesArea.appendChild(table);
			
			var applyButton = document.createElement('div');
			applyButton.className = 'button';
			var applyLabel = document.createTextNode('Apply');
			applyButton.appendChild(applyLabel);
			
			var self = this;
			applyButton.onclick = function()
			{
				var propertiesTable = null;
				for(var index=0; index<self.propertiesArea.children.length && propertiesTable==null; index++)
				{
					if(self.propertiesArea.children[index].tagName.toLowerCase() == 'table')
					{
						propertiesTable = self.propertiesArea.children[index];
					}
				}
				var properties = self.GetCurrentProperties(propertiesTable);
				var oldProperties = self.currentItem.GetProperties();
				if(!self.currentItem.SetProperties(properties))
				{
					alert("Invalid properties. The submitted modifications are not taken into account");
					self.currentItem.SetProperties(oldProperties);
				}
				if(self.updateCallback != null)
				{
					self.updateCallback();
				}
			};
			this.propertiesArea.appendChild(applyButton);
		}
	}
	
	//Computes the table showing the properties in parameter
	this.DisplayProperties = function(properties)
	{
		var table = document.createElement('table');
		table.className = 'Properties';
		for(var property in properties)
		{
			var row = document.createElement('tr');
			row.className = 'Property';
			
			var leftCol = document.createElement('td');
			leftCol.className = 'PropertyName';
			var leftColContent = document.createTextNode(property);
			leftCol.appendChild(leftColContent);
			row.appendChild(leftCol);
			
			var rightCol = document.createElement('td');
			var rightColContent;
			if(properties[property] instanceof Object)
			{
				rightCol.className = 'PropertyComplexValue';
				rightColContent = this.DisplayProperties(properties[property]);
			}
			else
			{
				rightCol.className = 'PropertyValue';
				rightColContent = document.createElement('input');
				rightColContent.type = 'text';
				rightColContent.width=20;
				rightColContent.className = 'PropertyValue';
				rightColContent.value = properties[property];
			}
			rightCol.appendChild(rightColContent);
			row.appendChild(rightCol);
			
			table.appendChild(row);
		}
		
		return table;
	};
	
	this.GetCurrentProperties = function(propertiesTable)
	{
		var properties = {};
		for(var index=0; index<propertiesTable.children.length; index++)
		{
			var propertyRow = propertiesTable.children[index];
			var porpertyNameCol = propertyRow.children[0];
			var porpertyValueCol = propertyRow.children[1];
			var propertyValueElement = porpertyValueCol.children[0];
			if(propertyValueElement.tagName.toLowerCase() == 'input')
			{
				properties[porpertyNameCol.textContent] = propertyValueElement.value;
			}
			else
			{
				properties[porpertyNameCol.textContent] = this.GetCurrentProperties(propertyValueElement);
			}
		}
		return properties;
	};
}