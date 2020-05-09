/// <reference path="opengl/renderer.ts" />
/// <reference path="datahandler.ts" />
/// <reference path="menu.ts" />
/// <reference path="controls/progressbar.ts" />
/// <reference path="controls/coordinatessystem.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../controler/mousecontroler.ts" />
/// <reference path="../controler/cameracontroler.ts" />


//===========================================
// Entry point for the point cloud application
// Invoke PCLApp.Run() to start the whole thing
//===========================================
class PCLApp {
	static instance: PCLApp;
	sceneRenderer: Renderer;
	dataHandler: DataHandler;
	menu: Menu;
	currentControler: MouseControler;
	coordinatesSystem: CoordinatesSystem;

	constructor(scene: Scene) {
		let appInterface: PCLApp = this;

		this.InitializeLongProcess();
		this.InitializeDataHandler(scene);
		this.InitializeMenu();
		this.InitializeRenderers(scene);

		window.onresize = function () {
			appInterface.Refresh();
		}
		this.Refresh();
	}

	static Run() {
		if (!PCLApp.instance) {
			let scene = new Scene;
			PCLApp.instance = new PCLApp(scene);
		}
	}

	private InitializeLongProcess() {
		LongProcess.progresFactory = () => new ProgressBar();
	}

	private InitializeDataHandler(scene: Scene) {
		let self = this;
		this.dataHandler = new DataHandler(scene, this);
		document.body.appendChild(self.dataHandler.GetElement());
	}

	private InitializeMenu() {
		let self = this;
		this.menu = new Menu(this);
		document.body.appendChild(self.menu.GetElement());
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

	UpdateSelectedElement(selectedItem: Pickable) {
		this.dataHandler.currentItem = selectedItem as PCLNode;
		this.Refresh();
	}

	Refresh() {
		this.dataHandler.Resize(window.innerWidth, window.innerHeight);
		this.dataHandler.RefreshContent();

		this.menu.RefreshSize();

		this.RefreshRendering();
	}

	TemporaryHideHideables() {
		this.dataHandler.TemporaryHide();
		this.menu.TemporaryHide();
	}

	RestoreHideables() {
		this.dataHandler.RestoreVisibility();
		this.menu.RestoreVisibility();
	}

	RefreshRendering() {
		this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
		this.sceneRenderer.Draw(this.dataHandler.scene);
		this.coordinatesSystem.Refresh();
	}

	SetCurrentControler(controler: MouseControler) {
		this.currentControler = controler;
	}

	GetCurrentControler(): MouseControler {
		return this.currentControler;
	}
}