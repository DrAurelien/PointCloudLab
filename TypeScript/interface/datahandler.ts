﻿class DataHandler implements Control {
	container: HTMLDivElement;
    dataToolbar: Toolbar;
    dataArea: HTMLDivElement;
    propertiesArea: HTMLDivElement;
    visibility: DataHandlerVisibility;
    handle: HTMLDivElement;
    currentItem: CADNode;

    constructor(public scene: Scene, private ownerView: Interface) {
		this.container = document.createElement('div');
        this.container.className = 'DataWindow';

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
					dataHandler.NotifyChange();
				}
			}, 'Load data from a file'),
			new ComboBox('[Icon:video-camera] View', [
					new CenterCameraAction(scene, ownerView),
					null,
					new CameraModeAction(ownerView),
					new TransformModeAction(ownerView)
				],
				'Handle the camera position'
			),
			//Help
			new Button('[Icon:question-circle] Help', function () {
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
        this.handle.onclick = (event) => { dataHandler.SwitchVisibility(); }

		this.visibility = new DataHandlerVisibility(true, this.container.style.width);
		this.RefreshContent();
    }

	GetElement(): HTMLElement {
		return this.container;
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

	Hide() {
		this.container.style.width = this.handle.scrollWidth + 'px';
		this.container.style.paddingRight = '0px';
		this.visibility.visible = false;
		this.handle.style.cursor = 'e-resize';
		this.dataArea.style.display = 'none';
		this.propertiesArea.style.display = 'none';
	}

	Show() {
		this.container.style.width = this.visibility.widthToRestore;
		this.container.style.paddingRight = this.handle.scrollWidth + 'px';
		this.visibility.visible = true;
		this.handle.style.cursor = 'w-resize';
		this.dataArea.style.display = 'block';
		this.propertiesArea.style.display = 'block';
	}

	SwitchVisibility()
	{
		if(this.visibility.visible)
		{
			this.Hide();
		}
		else
		{
			this.Show();
		}
	}

    AddCreatedObject(scene: Scene, createdObject: CADNode)
	{
		if(createdObject)
        {
			//If the object does not have an owner, affect one
			if (!createdObject.owner) {
				let owner: CADGroup = (createdObject instanceof Light) ? scene.lights : scene.root;
				if (this.currentItem && this.currentItem instanceof CADGroup) {
					owner = (<CADGroup>this.currentItem);
				}
				owner.Add(createdObject);
			}
			//Select the new item, and make it the current active object
			scene.Select(createdObject);
			this.currentItem = createdObject;
			this.NotifyChange();
		}
	}

	NotifyChange() {
		this.ownerView.Refresh();
	}

	GetSceneRenderer(): Renderer{
		return this.ownerView.sceneRenderer;
	}

    //Refresh content of data and properties views
    RefreshContent(): void
	{
		this.RefreshData();
		this.RefreshProperties();
	}

    protected RefreshData() : void
	{
		//Clear dataArea content
		while(this.dataArea.firstChild)
		{
			this.dataArea.removeChild(this.dataArea.firstChild);
		}

		let item = new DataItem(this.scene, this, this.scene);
		this.dataArea.appendChild(item.GetContainerElement());
	}
	
	protected RefreshProperties() : void
	{
		this.HandlePropertiesWindowVisibility();
		this.propertiesArea.innerHTML = '';
		if(this.currentItem != null)
		{
			let currentProperties = this.currentItem.GetProperties();
			let self = this;
			currentProperties.onChange = () => self.NotifyChange();
			let table = currentProperties.GetElement();
			this.propertiesArea.appendChild(table);
		}
	}
}

class DataHandlerVisibility {
	constructor(public visible: boolean, public widthToRestore: string) { }
}