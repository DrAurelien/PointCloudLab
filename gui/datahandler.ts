class DataHandler extends HideablePannel {
    dataArea: Pannel;
    propertiesArea: Pannel;
    currentItem: PCLNode;

    constructor(public scene: Scene, private ownerView: PCLApp) {
		super('DataWindow', HandlePosition.Right);

		//Data visualization
		this.dataArea = new Pannel('DataArea');
		this.AddControl(this.dataArea);
		
		//Properties visualization
		this.propertiesArea = new Pannel('PropertiesArea');
		this.AddControl(this.propertiesArea);

		this.RefreshContent();
    }
	
	Resize(width: number, height: number): void {
		let pannel = this.GetElement();
        pannel.style.height = (height - 2 * pannel.offsetTop) + 'px';
		this.RefreshSize();
		
		this.HandlePropertiesWindowVisibility();
	}
	
	HandlePropertiesWindowVisibility() : void
	{
		let pannel = this.GetElement();
		let dataArea = this.dataArea.GetElement();
		let propertiesArea = this.propertiesArea.GetElement();
		if(this.currentItem != null)
        {
            let height: number = pannel.clientHeight / 2;
			dataArea.style.height = height+'px';
			var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
			height -= delta;
			dataArea.style.height = height + 'px';
			propertiesArea.style.height = dataArea.style.height;
			dataArea.style.borderBottom = '1px solid lightGray';
			propertiesArea.style.borderTop = '1px solid darkGray';
		}
		else
        {
            let height: number = pannel.clientHeight;
			dataArea.style.height = height + 'px';
			var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
			height -= delta;
			dataArea.style.height = height + 'px';
			propertiesArea.style.height = "0px";
			dataArea.style.borderBottom = '';
			propertiesArea.style.borderTop = '';
		}
	}

    AddCreatedObject(scene: Scene, createdObject: PCLNode)
	{
		if(createdObject)
        {
			//If the object does not have an owner, affect one
			if (!createdObject.owner) {
				let owner: PCLGroup = (createdObject instanceof Light) ? scene.Lights : scene.Contents;
				if (this.currentItem && this.currentItem instanceof PCLGroup) {
					owner = (<PCLGroup>this.currentItem);
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
		this.dataArea.Clear();
		let item = new DataItem(this.scene, this, this.scene);
		this.dataArea.GetElement().appendChild(item.GetContainerElement());
	}
	
	protected RefreshProperties() : void
	{
		this.HandlePropertiesWindowVisibility();
		this.propertiesArea.Clear();
		if(this.currentItem != null)
		{
			let currentProperties = this.currentItem.GetProperties();
			let self = this;
			currentProperties.onChange = () => self.NotifyChange();
			this.propertiesArea.AddControl(currentProperties);
		}
	}
}