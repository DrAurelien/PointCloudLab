class DataHandler {
    dataToolbar: Toolbar;
    dataArea: HTMLDivElement;
    propertiesArea: HTMLDivElement;
    visibility: DataGandlerVisibility;
    handle: HTMLDivElement;
    currentItem: CADPrimitive;

    constructor(public container: HTMLDivElement, public updateCallback: Function, scene: Scene, private view : Interface) {
		let dataHandler = this;
		//Data toolbar
        this.dataToolbar = new Toolbar([
            //Items creation button
            new ComboBox('New', this.GetItemCreationControler(scene)),
			//File import button
			new FileOpener('Open', function(createdObject) {
				if(createdObject != null)
				{
					scene.items.push(createdObject);
					scene.Select(createdObject);
					dataHandler.currentItem = createdObject;
					if(dataHandler.updateCallback != null)
					{
						dataHandler.updateCallback();
					}
				}
			}),
			//Help
			new Button('?', function () {
				window.open('help.html', '_blank');
			})
        ]);
        let dataToolbarElement = this.dataToolbar.GetElement();
        dataToolbarElement.className = 'DataToolbar';
        this.container.appendChild(dataToolbarElement);
		
		//Data visualization
		this.dataArea = document.createElement('div');
		this.dataArea.className = 'DataArea';
		this.container.appendChild(this.dataArea);
		
		//Properties visualization
		this.propertiesArea = document.createElement('div');
		this.propertiesArea.className = 'PropertiesArea';
		this.container.appendChild(this.propertiesArea);
		
		//Window handle
		this.handle = document.createElement('div');
		this.handle.className = 'DataWindowHandle';
		this.container.appendChild(this.handle);

		this.visibility = new DataGandlerVisibility(true, this.container.style.width);
		
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
        this.container.style.height = (height - 2 * this.container.offsetTop)+'px';
		this.handle.style.height = this.container.style.height;
		
		this.HandlePropertiesWindowVisibility();
	}
	
	HandlePropertiesWindowVisibility() : void
	{
		if(this.currentItem != null)
        {
            let height: number = (this.container.clientHeight - this.dataToolbar.GetElement().getBoundingClientRect().height) / 2;
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
            let height: number = this.container.clientHeight;
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
			this.container.style.width = this.handle.scrollWidth + 'px';
            this.container.style.paddingRight = '0px';
			this.visibility.visible = false;
			this.handle.style.cursor = 'e-resize';
			this.dataArea.style.display= 'none';
			this.propertiesArea.style.display = 'none';
		}
		else
		{
			this.container.style.width = this.visibility.widthToRestore;
			this.container.style.paddingRight = this.handle.scrollWidth + 'px';
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
						dataHandler.view.sceneRenderer.ScanFromCurrentViewPoint(scene,
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
		//Clear dataArea content
		while(this.dataArea.firstChild)
		{
			this.dataArea.removeChild(this.dataArea.firstChild);
		}
		
        //List scene objects
        for (var index = 0; index < scene.items.length; index++)
        {
			let item = new DataItem(scene.items[index], this, scene);
			this.dataArea.appendChild(item.GetElement());
		}
	}
	
	RefreshProperties() : void
	{
		this.HandlePropertiesWindowVisibility();
		this.propertiesArea.innerHTML = '';
		if(this.currentItem != null)
		{
			let currentProperties = this.currentItem.GetProperties();
			let table = currentProperties.GetElement();
			this.propertiesArea.appendChild(table);

			let self = this;
			let applyButton = new Button('Apply', function () {
				var propertiesTable = null;
				for (var index = 0; index < self.propertiesArea.children.length && propertiesTable == null; index++) {
					if (self.propertiesArea.children[index].tagName.toLowerCase() == 'table') {
						propertiesTable = self.propertiesArea.children[index];
					}
				}
				let properties = self.GetCurrentProperties(propertiesTable);
				let oldProperties = self.currentItem.GetProperties();
				if (!self.currentItem.SetProperties(properties)) {
					alert("Invalid properties. The submitted modifications are not taken into account");
					self.currentItem.SetProperties(oldProperties);
				}
				if (self.updateCallback != null) {
					self.updateCallback();
				}
			});
			this.propertiesArea.appendChild(applyButton.GetElement());
		}
	}

    GetCurrentProperties(propertiesTable: HTMLTableElement): Properties
	{
        let properties = new Properties();
        for (var index = 0; index < propertiesTable.rows.length; index++)
        {
            let propertyRow: HTMLTableRowElement = <HTMLTableRowElement>propertiesTable.rows[index];
            let porpertyNameCol: HTMLTableCellElement = <HTMLTableCellElement>propertyRow.cells[0];
            let porpertyValueCol: HTMLTableCellElement = <HTMLTableCellElement>propertyRow.cells[1];
            let propertyValueElement = porpertyValueCol.children[0];
			if(propertyValueElement.tagName.toLowerCase() == 'input')
			{
				properties.Push(porpertyNameCol.textContent, (<HTMLInputElement>propertyValueElement).value);
			}
			else
			{
				properties.PushProperties(porpertyNameCol.textContent, this.GetCurrentProperties(<HTMLTableElement>propertyValueElement));
			}
		}
		return properties;
	}
}

class DataGandlerVisibility {
	constructor(public visible: boolean, public widthToRestore: string) { }
}