class Interface {
    sceneRenderer: Renderer;
    dataHandler: DataHandler;
	currentControler: MouseControler;

    constructor(scene: Scene) {
        let appInterface: Interface = this;

        this.InitializeDataHandler(scene);
        this.InitializeRenderer(scene);

        window.onresize = function () {
            appInterface.Refresh(scene);
        }
        this.Refresh(scene);
    }

    private InitializeDataHandler(scene) {
        var self = this;
        this.dataHandler = new DataHandler(scene, this);
		document.body.appendChild(this.dataHandler.GetElement());
    }

    InitializeRenderer(scene: Scene) {
        //Create the scene handler
        this.sceneRenderer = new Renderer();
        document.body.appendChild(this.sceneRenderer.GetElement());
		this.sceneRenderer.Draw(scene);

		//Create the default controler (camera controler)
		this.currentControler = new CameraControler(this, scene);
    }

	UpdateSelectedElement(selectedItem: CADNode, scene: Scene) {
		this.dataHandler.currentItem = selectedItem;
		this.Refresh(scene);
	}

    Refresh(scene: Scene): void {
        this.dataHandler.Resize(window.innerWidth, window.innerHeight);
        this.dataHandler.RefreshContent(scene);

        this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
        this.sceneRenderer.Draw(scene);
    }
}