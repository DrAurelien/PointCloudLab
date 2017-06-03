class Interface {
    sceneRenderer: Renderer;
    dataHandler: DataHandler;
	currentControler: MouseControler;
	coordinatesRenderer: Renderer;
	coordinatesSystem: Scene;

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
		let axes: Cylinder[] = [
			new Cylinder(new Vector([.5, .0, .0]), new Vector([1.0, .0, .0]), .1, 1.0),
			new Cylinder(new Vector([.0, .5, .0]), new Vector([.0, 1.0, .0]), .1, 1.0),
			new Cylinder(new Vector([.0, .0, .5]), new Vector([.0, .0, 1.0]), .1, 1.0)
		];
		this.coordinatesSystem = new Scene();
		for (let index = 0; index < axes.length; index++) {
			axes[index].material.baseColor = axes[index].axis.Flatten();
			this.coordinatesSystem.Contents.Add(axes[index]);
		}

		//Create the coordinates rendering component
		this.coordinatesRenderer = new Renderer('CoordsRendering');
		document.body.appendChild(this.coordinatesRenderer.GetElement());
		this.coordinatesRenderer.camera.CenterOnBox(this.coordinatesSystem.Contents.GetBoundingBox());
		this.coordinatesRenderer.camera.to = new Vector([.0, .0, .0]);
		this.coordinatesRenderer.camera.Direction = this.sceneRenderer.camera.Direction;
		
		//Create the default controler (camera controler)
		this.currentControler = new CameraControler(this, scene);

		this.sceneRenderer.Draw(scene);
		this.coordinatesRenderer.Draw(this.coordinatesSystem);
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
		this.coordinatesRenderer.Draw(this.coordinatesSystem);
    }

	UseCameraControler() {
		this.currentControler = new CameraControler(this, this.dataHandler.scene);
	}

	UseTransformationControler() {
		this.currentControler = new TransformControler(this, this.dataHandler.scene);
	}
}