/// <reference path="opengl/renderer.ts" />
/// <reference path="datahandler.ts" />
/// <reference path="menu.ts" />
/// <reference path="controls/progressbar.ts" />
/// <reference path="controls/coordinatessystem.ts" />
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
		this.currentControler = new CameraControler(this);

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

	RenderScene() {
		this.sceneRenderer.Draw(this.dataHandler.scene);
	}

	RefreshRendering() {
		this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
		this.RenderScene();
		this.coordinatesSystem.Refresh();
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

		let item = this.dataHandler.currentItem;
		if (item && item instanceof Light) {
			return item as Light;
		}
	}

	GetCurrentTransformable(): Transformable {
		let item = this.dataHandler.currentItem;
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
		if (c === ViewPointChange.Rotation || c === ViewPointChange.Position) {
			this.coordinatesSystem.Refresh();
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
		scene.Select(selected);
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
	ScanFromCurrentViewPoint(group: PCLGroup, hsampling: number, vsampling: number, onDone: Function) {
		this.sceneRenderer.ScanFromCurrentViewPoint(group, hsampling, vsampling,
			(cloud) => {
				group.Add(cloud);
				if (onDone) {
					onDone(cloud);
				}
			}
		);
	}

	GetShapesSampling(): number {
		return this.sceneRenderer.drawingcontext.sampling;
	}
}