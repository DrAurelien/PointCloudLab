class Interface {
    sceneRenderer: Renderer;
    dataHandler: DataHandler;
	currentControler: MouseControler;

    constructor(scene: Scene) {
        let appInterface: Interface = this;

        this.InitializeDataHandler(scene);
        this.InitializeRenderer(scene);

        window.onresize = function () {
            appInterface.Refresh();
        }
        this.Refresh();
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

	UpdateSelectedElement(selectedItem: CADNode) {
		this.dataHandler.currentItem = selectedItem;
		this.Refresh();
	}

    Refresh(): void {
        this.dataHandler.Resize(window.innerWidth, window.innerHeight);
        this.dataHandler.RefreshContent();

        this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
        this.sceneRenderer.Draw(this.dataHandler.scene);
    }

	UseCameraControler() {
		this.currentControler = new CameraControler(this, this.dataHandler.scene);
	}

	UseTransformationControler() {
		this.currentControler = new TransformControler(this, this.dataHandler.scene);
	}
}