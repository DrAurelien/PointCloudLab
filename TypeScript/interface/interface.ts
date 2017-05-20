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
        //Create a div to display the scene
        var dataVewing = document.createElement('div');
        dataVewing.className = 'DataWindow';
        document.body.appendChild(dataVewing);

        var self = this;
        this.dataHandler = new DataHandler(dataVewing, function () { self.Refresh(scene); }, scene, this);

        this.dataHandler.handle.onclick = function (event) {
            self.dataHandler.SwitchVisibility();
        }
    }

    InitializeRenderer(scene: Scene) {
        //Create a canvas to display the scene
        let sceneRenderingArea = document.createElement('canvas');
        sceneRenderingArea.className = 'SceneRendering';
        document.body.appendChild(sceneRenderingArea);
		
        //Create the scene handler
        this.sceneRenderer = new Renderer(sceneRenderingArea);
		this.sceneRenderer.Draw(scene);

		//Create controler
		this.currentControler = new CameraControler(this, scene, sceneRenderingArea);
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