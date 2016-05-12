function DataHandler(dataWindow, updateCallback)
{
	this.window = dataWindow;
	this.dataToolbar = null;
	this.dataArea = null;
	this.propertiesArea = null;
	this.visibility = null;
	this.handle = null;
	this.currentItem = null;
	this.updateCallback = updateCallback;
	
	this.Initialize = function(scene)
	{
		var dataHandler = this;
		//Data toolbar
		this.dataToolbar = Toolbar([
			//Items creation button
			ComboBox('New',
			[
				this.GetItemCreator('Sphere', scene),
				this.GetItemCreator('Cylinder', scene),
				this.GetItemCreator('Torus', scene),
				this.GetItemCreator('Scan from current viewpoint', scene)
			]),
			//File import button
			FileOpener('Open', function(createdObject) {
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
			}),
			//Scene export
			Button('Export', function() {
				var link = document.createElement('a');
				
				link.onclick = function()
				{
					var content = JSON.stringify(scene);
					var contentData = 'data:application/csv;charset=utf-8,' 
								   + encodeURIComponent(content);
					this.href = contentData;
					this.target = '_blank';
					this.download = 'filename.txt';
					if(this.parent)
					{
						this.parent.removeChild(this);
					}
				}
				link.click();
			})
		]);
		this.dataToolbar.className = 'DataToolbar';
		this.window.appendChild(this.dataToolbar);
		
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
	
	
	this.GetItemCreator = function(objectName, scene)
	{
		var dataHandler = this;
		return {
			label : objectName,
			callback : function()
			{
				function HandleResult(createdObject)
				{
					if(createdObject)
					{
						scene.objects.push(createdObject);
						scene.Select(createdObject);
						dataHandler.currentItem = createdObject;
						if(dataHandler.updateCallback != null)
						{
							dataHandler.updateCallback();
						}
					}
				}
				
				switch(objectName)
				{
					case 'Sphere' :
						HandleResult(new Sphere(new Vector([0, 0, 0]), 1));
						break;
					case 'Cylinder' :
						HandleResult(new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1));
						break;
					case 'Torus' :
						HandleResult(createdObject = new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1));
						break;
					case 'Scan from current viewpoint':
						Interface.sceneRenderer.ScanFromCurrentViewPoint(scene, HandleResult);
						break;
					default :
						break;
				}
			}
		};
	};
	
	//Refresh content of data and properties views
	this.RefreshContent = function(scene)
	{
		this.RefreshData(scene);
		this.RefreshProperties();
	};
	
	this.RefreshData = function(scene)
	{
		function Refresh(dataHandler)
		{
			if(dataHandler.updateCallback != null)
			{
				dataHandler.updateCallback();
			}
			else
			{
				dataHandler.RefreshContent(scene);
			}
		}
		
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
					Refresh(self.target);
				}
			}
		}
		
		function ViewClicked(object, icon, target)
		{
			this.object = object;
			this.target = target;
			
			this.Callback = function(event)
			{
				var self = this;
				return function()
				{
					self.object.visible = ! self.object.visible;
					Refresh(self.target);
				}
			}
		}
		
		function DeletionClicked(object, target)
		{
			this.object = object;
			this.target = target;
			
			this.Callback = function()
			{
				var self = this;
				return function(event)
				{
					event = event ||window.event;
					
					if(confirm('Are you sure you want to delete "' + self.object.name + '" ?'))
					{
						scene.Remove(self.object);
						self.target.currentItem = null;
						Refresh(self.target);
						
						if (event.stopPropagation) {
						  event.stopPropagation();
						}
						else {
						  event.cancelBubble = true;
						}
					}
				}
			}
		}
		
		//-----------------------------------------------------
		
		//Clear dataArea content
		while(this.dataArea.firstChild)
		{
			this.dataArea.removeChild(this.dataArea.firstChild);
		}
		
		//List scene objects
		for(var index=0; index<scene.objects.length; index++)
		{
			var currentObject = scene.objects[index];
			var item = document.createElement('div');
			item.className = (currentObject == this.currentItem)?'SelectedSceneItem':'SceneItem';
			
			var visibilityIcon = document.createElement('i');
			visibilityIcon.className = 'ItemAction fa fa-eye' + (currentObject.visible ? '' : '-slash');
			item.appendChild(visibilityIcon);
			
			var deletionIcon = document.createElement('i');
			deletionIcon.className = 'ItemAction fa fa-close';
			item.appendChild(deletionIcon);
			
			var itemContentContainer = document.createElement('span');
			itemContentContainer.className = 'ItemNameContainer';
			
			var itemContent = document.createTextNode(currentObject.name);
			itemContentContainer.appendChild(itemContent);
			item.appendChild(itemContentContainer);
			
			item.onclick = new ItemClicked(currentObject, this).Callback();
			visibilityIcon.onclick = new ViewClicked(currentObject, visibilityIcon, this).Callback();
			deletionIcon.onclick = new DeletionClicked(currentObject, this).Callback();
			
			this.dataArea.appendChild(item);
		}
	}
	
	this.RefreshProperties = function()
	{
		this.HandlePropertiesWindowVisibility();
		this.propertiesArea.innerHTML = '';
		if(this.currentItem != null)
		{
			var currentProperties = this.currentItem.GetProperties();
			var table = this.DisplayProperties(currentProperties);
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