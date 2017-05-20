class DataHandler {
    dataToolbar: Toolbar;
    dataArea: HTMLDivElement;
    propertiesArea: HTMLDivElement;
    visibility: DataGandlerVisibility;
    handle: HTMLDivElement;
    currentItem: CADNode;

    constructor(public container: HTMLDivElement, public updateCallback: Function, scene: Scene, private view : Interface) {
		let dataHandler = this;
		//Data toolbar
        this.dataToolbar = new Toolbar([
			//File import button
			new FileOpener('[Icon:file-o] Open', function(createdObject) {
				if(createdObject != null)
				{
					scene.root.Add(createdObject);
					scene.Select(createdObject);
					dataHandler.currentItem = createdObject;
					if(dataHandler.updateCallback != null)
					{
						dataHandler.updateCallback();
					}
				}
			}, 'Load data from a file'),
			new ComboBox('[Icon:video-camera] View',
				[new CenterCameraAction(scene, view)],
				'Handle the camera position'
			),
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

    AddCreatedObject(scene: Scene, createdObject: CADNode)
	{
		if(createdObject)
        {
			//If the object does not have an owner, affect one
			if (!createdObject.owner) {
				let owner: CADGroup = scene.root;
				if (this.currentItem && this.currentItem instanceof CADGroup) {
					owner = (<CADGroup>this.currentItem);
				}
				owner.Add(createdObject);
			}
			//Select the new item, and make it the current active object
			scene.Select(createdObject);
			this.currentItem = createdObject;
			if(this.updateCallback != null)
			{
				this.updateCallback();
			}
		}
	}

	GetSceneRenderer(): Renderer{
		return this.view.sceneRenderer;
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

		let item = new DataItem(scene.root, this, scene);
		this.dataArea.appendChild(item.GetContainerElement());
	}
	
	RefreshProperties() : void
	{
		this.HandlePropertiesWindowVisibility();
		this.propertiesArea.innerHTML = '';
		if(this.currentItem != null)
		{
			let currentProperties = this.currentItem.GetProperties();
			currentProperties.onChange = this.updateCallback;
			let table = currentProperties.GetElement();
			this.propertiesArea.appendChild(table);
		}
	}
}

class DataGandlerVisibility {
	constructor(public visible: boolean, public widthToRestore: string) { }
}