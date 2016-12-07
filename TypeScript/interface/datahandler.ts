class DataHandler {
    dataToolbar: Toolbar;
    dataArea: HTMLDivElement;
    propertiesArea: HTMLDivElement;
    visibility: DataGandlerVisibility;
    handle: HTMLDivElement;
    currentItem: CADPrimitive;

    constructor(public window: HTMLDivElement, public updateCallback: Function, scene: Scene) {
		var dataHandler = this;
		//Data toolbar
        this.dataToolbar = new Toolbar([
            //Items creation button
            new ComboBox('New', this.GetItemCreationControler(scene))
            /*
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
			Button('?', function() {
				window.open('help.html', '_blank');
			})*/
        ]);
        let dataToolbarElement = this.dataToolbar.GetElement();
        dataToolbarElement.className = 'DataToolbar';
        this.window.appendChild(dataToolbarElement);
		
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

		this.visibility = new DataGandlerVisibility(true, this.window.style.width);
		
		this.RefreshContent(scene);
    }

    GetItemCreationControler(scene: Scene): Function {
        let dataHandler = this;
        return function () {
            var itemsCreationMenu = [
                dataHandler.GetItemCreator('Plane', scene),
                dataHandler.GetItemCreator('Sphere', scene),
                dataHandler.GetItemCreator('Cylinder', scene),
                dataHandler.GetItemCreator('Torus', scene)
            ];

            if (scene.items && scene.items.length) {
                itemsCreationMenu.push(dataHandler.GetItemCreator('Scan from current viewpoint', scene));
            }
            return itemsCreationMenu;
        };
    }
	
	Resize(width : number, height : number) : void {
        //this.window.style.height = height-2*this.window.offsetTop);
        this.window.clientHeight = height - 2 * this.window.offsetTop;
		this.handle.style.height = this.window.style.height;
		
		this.HandlePropertiesWindowVisibility();
	}
	
	HandlePropertiesWindowVisibility() : void
	{
		if(this.currentItem != null)
        {
            let height: number = (this.window.clientHeight - this.dataToolbar.GetElement().getBoundingClientRect().height) / 2;
			this.dataArea.style.height = height+'px';
			var delta = this.dataArea.getBoundingClientRect().height - height; //because of margins and padding
			height -= delta;
			this.dataArea.style.height = height + 'px';
			this.propertiesArea.style.height = this.dataArea.style.height;
			this.dataArea.style.borderBottom = '1px solid lightGray';
			this.propertiesArea.style.borderTop = '1px solid darkGray';
		}
		else
        {
            let height: number = this.window.clientHeight;
			this.dataArea.style.height = height + 'px';
			var delta = this.dataArea.getBoundingClientRect().height - height; //because of margins and padding
			height -= delta;
			this.dataArea.style.height = height + 'px';
			this.propertiesArea.style.height = "0px";
			this.dataArea.style.borderBottom = '';
			this.propertiesArea.style.borderTop = '';
		}
	}
	
	SwitchVisibility() : void
	{
		if(this.visibility.visible)
		{
			this.window.style.width = this.handle.scrollWidth + 'px';
            this.window.style.paddingRight = '0px';
			this.visibility.visible = false;
			this.handle.style.cursor = 'e-resize';
			this.dataArea.style.display= 'none';
			this.propertiesArea.style.display = 'none';
		}
		else
		{
			this.window.style.width = this.visibility.widthToRestore;
			this.window.style.paddingRight = this.handle.scrollWidth + 'px';
			this.visibility.visible = true;
			this.handle.style.cursor = 'w-resize';
			this.dataArea.style.display= 'block';
			this.propertiesArea.style.display = 'block';
		}
	}

    AddCreatedObject = function (scene: Scene, createdObject: CADPrimitive)
	{
		if(createdObject)
        {
            scene.items.push(createdObject);
			scene.Select(createdObject);
			this.currentItem = createdObject;
			if(this.updateCallback != null)
			{
				this.updateCallback();
			}
		}
	}

    GetItemCreator(objectName: string, scene: Scene)
	{
		var dataHandler = this;
		return {
			label : objectName,
			callback : function()
            {
				switch(objectName)
				{
					case 'Plane' :
						dataHandler.AddCreatedObject(scene, new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1));
						break;
					case 'Sphere' :
						dataHandler.AddCreatedObject(scene, new Sphere(new Vector([0, 0, 0]), 1));
						break;
					case 'Cylinder' :
						dataHandler.AddCreatedObject(scene, new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1));
						break;
					case 'Torus' :
						dataHandler.AddCreatedObject(scene, new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1));
						break;
					case 'Scan from current viewpoint':
						this.sceneRenderer.ScanFromCurrentViewPoint(scene,
							function(scan) {
								dataHandler.AddCreatedObject(scene, scan);
							});
						break;
					default :
						break;
				}
			}
		};
	}
	
    //Refresh content of data and properties views
    RefreshContent(scene: Scene): void
	{
		this.RefreshData(scene);
		this.RefreshProperties();
	}

    RefreshData(scene: Scene) : void
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
		
		//When left - clicking an item
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
		
		//When right - clicking an item
		function ItemMenu(object, owner, target)
		{
			this.object = object;
			this.target = target;
			
			this.Callback = function(event)
			{
				event = event ||window.event;
				var self = this;
				return function()
				{
					var actions = self.object.GetActions(
						function(createdObject)
						{
							if(createdObject)
							{
								self.target.AddCreatedObject(scene, createdObject);
							}
							else
							{
								Refresh(self.target)
							}
						}
                        );
                    Popup.CreatePopup(owner, actions);
					return false;
				}
			}
		}
		
		//When clicking the visibility icon next to an item
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
		
		//When clickin the deletion icon next to an item
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
        for (var index = 0; index < scene.items.length; index++)
        {
            let currentObject: CADPrimitive = scene.items[index];
            let item: HTMLDivElement = <HTMLDivElement>document.createElement('div');
			item.className = (currentObject == this.currentItem)?'SelectedSceneItem':'SceneItem';
			
			let visibilityIcon = document.createElement('i');
			visibilityIcon.className = 'ItemAction fa fa-eye' + (currentObject.visible ? '' : '-slash');
			item.appendChild(visibilityIcon);
			
			let deletionIcon = document.createElement('i');
			deletionIcon.className = 'ItemAction fa fa-close';
			item.appendChild(deletionIcon);
			
			let itemContentContainer = document.createElement('span');
			itemContentContainer.className = 'ItemNameContainer';
			
			let itemContent = document.createTextNode(currentObject.name);
			itemContentContainer.appendChild(itemContent);
			item.appendChild(itemContentContainer);
			
			item.onclick = new ItemClicked(currentObject, this).Callback();
			item.oncontextmenu = new ItemMenu(currentObject, itemContentContainer, this).Callback();
			visibilityIcon.onclick = new ViewClicked(currentObject, visibilityIcon, this).Callback();
			deletionIcon.onclick = new DeletionClicked(currentObject, this).Callback();
			
			this.dataArea.appendChild(item);
		}
	}
	
	RefreshProperties() : void
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
			
			let self = this;
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
    DisplayProperties(properties): HTMLTableElement
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

    GetCurrentProperties(propertiesTable: HTMLTableElement): any
	{
        var properties = {};
        for (var index = 0; index < propertiesTable.rows.length; index++)
        {
            let propertyRow: HTMLTableRowElement = <HTMLTableRowElement>propertiesTable.rows[index];
            let porpertyNameCol: HTMLTableCellElement = <HTMLTableCellElement>propertyRow.cells[0];
            let porpertyValueCol: HTMLTableCellElement = <HTMLTableCellElement>propertyRow.cells[1];
            let propertyValueElement = porpertyValueCol.children[0];
			if(propertyValueElement.tagName.toLowerCase() == 'input')
			{
				properties[porpertyNameCol.textContent] = (<HTMLInputElement>propertyValueElement).value;
			}
			else
			{
				properties[porpertyNameCol.textContent] = this.GetCurrentProperties(<HTMLTableElement>propertyValueElement);
			}
		}
		return properties;
	}
}

class DataGandlerVisibility {
	constructor(public visible: boolean, public widthToRestore: string) { }
}