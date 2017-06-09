class Interface {
    sceneRenderer: Renderer;
    dataHandler: DataHandler;
	currentControler: MouseControler;
	coordinatesSystem: CoordinatesSystem;

    constructor(scene: Scene) {
        let appInterface: Interface = this;

        this.InitializeDataHandler(scene);
        this.InitializeRenderers(scene);

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

    InitializeRenderers(scene: Scene) {
        //Create the scene rendering component
        this.sceneRenderer = new Renderer('SceneRendering');
        document.body.appendChild(this.sceneRenderer.GetElement());

		//Create the coordinates axes to be rendered
		this.coordinatesSystem = new CoordinatesSystem(this);
		document.body.appendChild(this.coordinatesSystem.GetElement());

		//Create the default controler (camera controler)
		this.currentControler = new CameraControler(this, scene);

		this.sceneRenderer.Draw(scene);
		this.coordinatesSystem.Refresh();
    }

	UpdateSelectedElement(selectedItem: CADNode) {
		this.dataHandler.currentItem = selectedItem;
		this.Refresh();
	}

    Refresh() {
        this.dataHandler.Resize(window.innerWidth, window.innerHeight);
        this.dataHandler.RefreshContent();

		this.RefreshRendering();
    }

	RefreshRendering() {
        this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
        this.sceneRenderer.Draw(this.dataHandler.scene);
		this.coordinatesSystem.Refresh();
	}

	UseCameraControler() {
		this.currentControler = new CameraControler(this, this.dataHandler.scene);
	}

	UseTransformationControler() {
		this.currentControler = new TransformControler(this, this.dataHandler.scene);
	}

	UseLightControler() {
		this.currentControler = new LightControler(this);
	}
}