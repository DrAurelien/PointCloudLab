/// <reference path="opengl/renderer.ts" />
/// <reference path="datahandler.ts" />
/// <reference path="menu.ts" />
/// <reference path="coordinatessystem.ts" />
/// <reference path="controls/progressbar.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="objects/pclprimitive.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../controler/controler.ts" />
/// <reference path="../controler/actions/delegate.ts" />
/// <reference path="../controler/mousecontroler.ts" />
/// <reference path="../controler/cameracontroler.ts" />
/// <reference path="../files/pclserializer.ts" />
/// <reference path="../files/pclloader.ts" />


//===========================================
// Entry point for the point cloud application
// Invoke PCLApp.Run() to start the whole thing
//===========================================
class PCLApp implements Controlable, ActionDelegate, SelectionChangeHandler {
	static instance: PCLApp;
	sceneRenderer: Renderer;
	dataHandler: DataHandler;
	menu: Menu;
	currentControler: Controler;
	coordinatesSystem: CoordinatesSystem;
	shortcuts: Record<string, Action>;

	static sceneStorageKey = 'PointCloudLab-Scene';

	constructor() {
		this.shortcuts = {};

		let scenebuffer: string = null;
		try {
			scenebuffer = window.localStorage.getItem(PCLApp.sceneStorageKey);
		}
		catch (e) {
			scenebuffer = null;
			console.warn('Could not load data from local storage');
		}
		if (scenebuffer) {
			console.info('Loading locally stored data');
			let loader = new PCLLoader(scenebuffer);
			let self = this;
			loader.Load(
				(scene: PCLNode) => self.Initialize(scene as Scene),
				(error: string) => {
					console.error('Failed to initialize scene from storage : ' + error);
					console.warn('Start from an empty scene, instead');
					self.Initialize(new Scene());
				}
			);
		} else {
			console.info('Initializing a brand new scene');
			this.Initialize(new Scene());
		}
	}

	static Run() {
		if (!PCLApp.instance) {
			PCLApp.instance = new PCLApp();
		}
	}

	private Initialize(scene: Scene) {
		let self = this;
		this.InitializeLongProcess();
		this.InitializeDataHandler(scene);
		this.InitializeRenderers(scene);
		this.InitializeMenu();
		this.Resize();

		window.onresize = function () {
			self.Resize();
		}
		this.RefreshRendering();

		scene.SetFolding(false);
		scene.Contents.SetFolding(false);
		scene.Lights.SetFolding(true);
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
		this.SetCurrentControler(new CameraControler(this), false);

		this.sceneRenderer.Draw(scene);
		this.coordinatesSystem.Refresh();
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

	SaveCurrentScene() {
		//Dry run (to get the buffer size)
		let serializer = new PCLSerializer(null);
		this.dataHandler.scene.Serialize(serializer);
		let bufferSize = serializer.GetBufferSize();
		//Actual serialization
		serializer = new PCLSerializer(bufferSize);
		this.dataHandler.scene.Serialize(serializer);
		try {
			window.localStorage.setItem(PCLApp.sceneStorageKey, serializer.GetBufferAsString());

			let data = window.localStorage.getItem(PCLApp.sceneStorageKey);
			if (data.length != serializer.GetBufferSize()) {
				console.info('Integrity check failure. Cannot save data to the local storage.');
				window.localStorage.setItem(PCLApp.sceneStorageKey, '');
			}
			console.info('Scene data have been sucessfully saved to local storage.');
		}
		catch (e) {
			let message = 'The data cannot be saved to your browser local storage :\n';
			message += '"' + e + '"\n';
			message += 'Do you want to save the scene data to a local file, instead ?\n';
			message += '(You can load the generated file using the leftmost menu entry)';
			if (confirm(message)) {
				this.dataHandler.scene.SaveToFile();
			}
		}
	}

	//=========================================
	// Implement Controlable interface
	//=========================================
	GetViewPoint(): ViewPoint {
		return this.sceneRenderer.camera;
	}

	GetLightPosition(takeFocus: boolean): LightingPosition {
		let scene = this.dataHandler.scene;
		let light: Light;
		if (scene.Lights.children.length == 1) {
			light = scene.Lights.children[0] as Light;
			if (takeFocus) {
				this.dataHandler.selection.SingleSelect(light);
			}
		}
		else {
			let item = this.dataHandler.selection.GetSingleSelection();
			if (item && item instanceof Light) {
				light = item as Light;
			}
		}
		return light;
	}

	GetCurrentTransformable(): Transformable {
		let item = this.dataHandler.selection.GetSingleSelection();
		if (item && item instanceof PCLPrimitive)
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

	SetCurrentControler(controler: Controler, refresh: boolean=true) {
		this.currentControler = controler;
		this.sceneRenderer.drawingcontext.bboxcolor = controler.GetSelectionColor();
		if (refresh) {
			this.RefreshRendering();
		}
	}

	GetCurrentControler(): Controler {
		return this.currentControler;
	}

	PickItem(x: number, y: number, exclusive: boolean) {
		let scene = this.dataHandler.scene;
		let selected = this.sceneRenderer.PickObject(x, y, scene);
		if (exclusive) {
			this.dataHandler.selection.SingleSelect(selected as PCLNode);
		}
		else if (selected && (selected instanceof PCLNode)) {
			(selected as PCLNode).Select(true);
		}
	}

	FocusOnCurrentSelection() {
		let selection = this.dataHandler.selection;
		let selectionbb = selection.GetBoundingBox();
		if (selectionbb && this.sceneRenderer.camera.CenterOnBox(selectionbb)) {
			this.sceneRenderer.Draw(this.dataHandler.scene);
		}
	}

	HasSelection(): boolean {
		return this.dataHandler.selection.Size() > 0;
	}

	CanFocus(): boolean {
		let selectionbb = this.dataHandler.selection.GetBoundingBox();
		return (selectionbb && selectionbb.IsValid());
	}

	ToggleRendering(mode: RenderingMode) {
		let rendering = this.sceneRenderer.drawingcontext.rendering;
		let message = null;
		function getState(state)
		{
			return state ? '<b style="color:green;">ON</b>' : '<b style="color:red;">OFF</b>';
		}

		switch (mode) {
			case RenderingMode.Point:
				let point = rendering.Point(!rendering.Point());
				message = "Point representation : " + getState(point);
				break;
			case RenderingMode.Wire:
				let wire = rendering.Wire(!rendering.Wire());
				message = "Wire representation : " + getState(wire);
				break;
			case RenderingMode.Surface:
				let surface = rendering.Surface(!rendering.Surface());
				message = "Surface representation : " + getState(surface);
				break;
		}
		if(message)
			new TemporaryHint(message);
		this.RenderScene();
	}

	ChangeRenderingFilter(newFilter : IRenderingFilter|IRenderingFilterFactory)
	{
		let filter: IRenderingFilter = null;
		let factory = newFilter as IRenderingFilterFactory;
		if(factory)
			filter = factory(this.sceneRenderer.drawingcontext);
		this.sceneRenderer.SetFilter(filter);
		// TODO : fix bug ... for some reason, we need to render twice when activating EDL
		this.RefreshRendering();
		this.RefreshRendering();
	}

	GetCurrentRenderingFilter() : IRenderingFilter
	{
		return this.sceneRenderer.activeFilter;
	}

	RegisterShortCut(action: Action): Action {
		let shortcut = action.GetShortCut();
		if (shortcut) {
			let key = shortcut.toLowerCase();
			if (!(key in this.shortcuts)) {
				this.shortcuts[key] = action;
			}
			else {
				console.error('Shortcut "' + shortcut + '" is being registered multiples times.');
			}
		}
		return action;
	}

	HandleShortcut(key: string): boolean {
		let action = this.shortcuts[key.toLowerCase()];
		if (action && action.Enabled()) {
			action.Run();
			return true;
		}
		return false;
	}

	//===================================
	// Implement ActionsDelegate interface
	// ==================================
	ScanFromCurrentViewPoint(group: PCLGroup, hsampling: number, vsampling: number, noise:number) {
		this.sceneRenderer.ScanFromCurrentViewPoint(group, hsampling, vsampling, noise);
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

	//===================================
	// Implement SelectionChangeHandler interface
	// ==================================
	OnSelectionChange(selectionList: SelectionList) {
		this.dataHandler.OnSelectionChange(selectionList);
		this.menu.OnSelectionChange(selectionList);
	}
}