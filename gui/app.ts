/// <reference path="opengl/renderer.ts" />
/// <reference path="datahandler.ts" />
/// <reference path="menu.ts" />
/// <reference path="coordinatessystem.ts" />
/// <reference path="controls/progressbar.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../controler/controler.ts" />
/// <reference path="../controler/actions/delegate.ts" />
/// <reference path="../controler/mousecontroler.ts" />
/// <reference path="../controler/cameracontroler.ts" />


//===========================================
// Entry point for the point cloud application
// Invoke PCLApp.Run() to start the whole thing
//===========================================
class PCLApp implements Controlable, ActionDelegate {
	static instance: PCLApp;
	sceneRenderer: Renderer;
	dataHandler: DataHandler;
	menu: Menu;
	currentControler: Controler;
	coordinatesSystem: CoordinatesSystem;

	constructor() {
		let self: PCLApp = this;

		let scene = new Scene();
		this.InitializeLongProcess();
		this.InitializeDataHandler(scene);
		this.InitializeRenderers(scene);
		this.InitializeMenu();
		this.Resize();

		window.onresize = function () {
			self.Resize();
		}
		this.RefreshRendering();
	}

	static Run() {
		if (!PCLApp.instance) {
			PCLApp.instance = new PCLApp();
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
		this.currentControler = new CameraControler(this);

		this.sceneRenderer.Draw(scene);
		this.coordinatesSystem.Refresh();
	}

	UpdateSelectedElement(selectedItem: Pickable) {
		this.dataHandler.SetCurrentItem(selectedItem as PCLNode);
		this.RefreshRendering();
	}


	Resize() {
		if (this.sceneRenderer) {
			this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
		}
		if (this.dataHandler) {
			this.dataHandler.Resize(window.innerWidth, window.innerHeight);
		}
		if (this.menu) {
			this.menu.RefreshSize();
		}
		this.RefreshRendering();
	}

	RenderScene() {
		if (this.sceneRenderer) {
			this.sceneRenderer.Draw(this.dataHandler.scene);
		}
	}

	RefreshRendering() {
		this.RenderScene();
		if (this.coordinatesSystem) {
			this.coordinatesSystem.Refresh();
		}
	}

	//=========================================
	// Implement Controlable interface
	//=========================================
	GetViewPoint(): ViewPoint {
		return this.sceneRenderer.camera;
	}

	GetLightPosition(): LightingPosition {
		let scene = this.dataHandler.scene;
		if (scene.Lights.children.length == 1)
			return scene.Lights.children[0] as Light;

		let item = this.dataHandler.GetCurrentItem();
		if (item && item instanceof Light) {
			return item as Light;
		}
	}

	GetCurrentTransformable(): Transformable {
		let item = this.dataHandler.GetCurrentItem();
		if (item instanceof PCLShape)
			return item;
		return null;
	}

	NotifyControlStart() {
		this.dataHandler.TemporaryHide();
		this.menu.TemporaryHide();
	}

	NotifyControlEnd() {
		this.dataHandler.RestoreVisibility();
		this.menu.RestoreVisibility();
	}

	NotifyPendingControl() {
	}

	NotifyViewPointChange(c: ViewPointChange) {
		if (this.coordinatesSystem) {
			if (c === ViewPointChange.Rotation || c === ViewPointChange.Position) {
				this.coordinatesSystem.Refresh();
			}
		}
		this.RenderScene();
	}

	NotifyTransform() {
		this.RenderScene();
	}

	GetRengeringArea(): HTMLElement {
		return this.sceneRenderer.GetElement();
	}

	SetCurrentControler(controler: Controler) {
		this.currentControler = controler;
	}

	GetCurrentControler(): Controler {
		return this.currentControler;
	}

	PickItem(x: number, y: number) {
		let scene = this.dataHandler.scene;
		let selected = this.sceneRenderer.PickObject(x, y, scene);
		this.UpdateSelectedElement(selected);
	}

	FocusOnCurrentItem() {
		let scene = this.dataHandler.scene;
		let selectionbb = scene.GetSelectionBoundingBox();
		if (selectionbb && this.sceneRenderer.camera.CenterOnBox(selectionbb)) {
			this.sceneRenderer.Draw(scene);
		}
	}

	CanFocus(): boolean {
		let selectionbb = this.dataHandler.scene.GetSelectionBoundingBox();
		return (selectionbb && selectionbb.IsValid());
	}

	ToggleRendering(mode: RenderingMode) {
		let rendering = this.sceneRenderer.drawingcontext.rendering;
		switch (mode) {
			case RenderingMode.Point:
				rendering.Point(!rendering.Point());
				break;
			case RenderingMode.Wire:
				rendering.Wire(!rendering.Wire());
				break;
			case RenderingMode.Surface:
				rendering.Surface(!rendering.Surface());
				break;
		}
		this.RenderScene();
	}

	//===================================
	// Implement ActionsDelegate interface
	// ==================================
	ScanFromCurrentViewPoint(group: PCLGroup, hsampling: number, vsampling: number) {
		this.sceneRenderer.ScanFromCurrentViewPoint(group, hsampling, vsampling);
	}

	GetShapesSampling(): number {
		return this.sceneRenderer.drawingcontext.sampling;
	}

	//===================================
	// Implement Notifiable interface
	// ==================================
	NotifyChange(source: PCLNode) {
		this.RenderScene();
	}
}