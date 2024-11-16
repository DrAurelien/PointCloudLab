/// <reference path="../controls/control.ts" />
/// <reference path="drawingcontext.ts" />
/// <reference path="camera.ts" />
/// <reference path="edlfilter.ts" />
/// <reference path="../objects/scene.ts" />
/// <reference path="../objects/pclnode.ts" />
/// <reference path="../objects/light.ts" />
/// <reference path="../objects/pclpointcloud.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../tools/longprocess.ts" />
/// <reference path="../../tools/random.ts" />
/// <reference path="../../model/pointcloud.ts" />

interface IRenderingFilter
{
	Dispose();
	CollectRendering(scene : Scene);
	Render(camera: Camera, scene: Scene);
	Resize(size: ScreenDimensions);
}

interface IRenderingFilterFactory
{
	(context: DrawingContext) : IRenderingFilter;
}

class Renderer implements Control, IRenderingTypeListener {
	sceneRenderingArea: HTMLCanvasElement;
	drawingcontext: DrawingContext;
	camera: Camera;
	activeFilter : IRenderingFilter;

	constructor(className: string) {
		//Create a canvas to display the scene
		this.sceneRenderingArea = document.createElement('canvas');
		this.sceneRenderingArea.className = className;

		this.drawingcontext = new DrawingContext(this.sceneRenderingArea);
		this.camera = new Camera(this.drawingcontext);
		this.activeFilter = null;
		this.drawingcontext.rendering.Register(this);

		this.activeFilter = new GlowFilter(this.drawingcontext);
	}

	SetFilter(filter : IRenderingFilter = null)
	{
		if(this.activeFilter)
			this.activeFilter.Dispose();
		this.activeFilter = filter;
	}

	GetElement(): HTMLElement {
		return this.sceneRenderingArea;
	}

	Draw(scene: Scene): void {
		this.drawingcontext.shaders.Use();
		var gl = this.drawingcontext.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);

		//Set the lights positions and colors
		let nbLights = 0;
		for (var index = 0; index < scene.Lights.children.length; index++) {
			let light = <Light>scene.Lights.children[index];
			if (light.visible) {
				gl.uniform3fv(this.drawingcontext.lightpositions[nbLights], new Float32Array(light.position.Flatten()));
				gl.uniform3fv(this.drawingcontext.lightcolors[nbLights], new Float32Array(light.color));
				nbLights++;
			}
		}
		gl.uniform1i(this.drawingcontext.nblights, nbLights);

		//Set the camera position
		this.camera.UpdateDepthRange(scene);
		this.camera.InititalizeDrawingContext(this.drawingcontext);

		//Perform rendering
		if (scene) {
			if(this.activeFilter)
			{
				this.activeFilter.CollectRendering(scene);
				this.activeFilter.Render(this.camera, scene);
			}
			else
				scene.Draw(this.drawingcontext);
		}
	}

	RefreshSize() {
		this.Resize(this.sceneRenderingArea.scrollWidth, this.sceneRenderingArea.scrollHeight);
	}

	Resize(width: number, height: number): void {
		this.drawingcontext.renderingArea.width = width;
		this.drawingcontext.renderingArea.height = height;
		this.camera.screen.width = width;
		this.camera.screen.height = height;
		if(this.activeFilter)
			this.activeFilter.Resize(this.camera.screen);
	}

	GetRay(x: number, y: number, aperture?: number): Ray {
		let point: Vector = this.camera.ComputeInvertedProjection(new Vector([x, y, -1.0]));
		return new Ray(this.camera.at, point.Minus(this.camera.at).Normalized(), aperture);
	}

	ResolveRayIntersection(ray: Ray, root: PCLNode): Picking {
		return root.RayIntersection(ray);
	}

	PickObject(x: number, y: number, scene: Scene): Pickable {
		let ray: Ray = this.GetRay(x, y, Geometry.DegreeToRadian(2));
		let picked = this.ResolveRayIntersection(ray, scene.Contents);

		if (picked != null && picked.HasIntersection()) {
			return picked.object;
		}
		return null;
	}

	ScanFromCurrentViewPoint(group: PCLGroup, hsampling: number, vsampling: number, noise: number) {
		let scanner = new SceneScanner(this, group, hsampling, vsampling, noise);
		scanner.SetNext((s: SceneScanner) => {
			let cloud = new PCLPointCloud(s.cloud);
			group.Add(cloud);
			cloud.NotifyChange(cloud, ChangeType.NewItem);
		});
		scanner.Start();
	}

	OnRenderingTypeChange(renderingType: RenderingType)
	{
	}
}

class SceneScanner extends LongProcess {
	currenti: number;
	currentj: number;
	public cloud: PointCloud;

	constructor(private renderer: Renderer, private group: PCLNode, private width: number, private height: number, private noise:number=0) {
		super('Scanning the scene (' + width + 'x' + height + ')');
		this.currenti = 0;
		this.currentj = 0;
	}

	Initialize() {
		this.cloud = new PointCloud();
		this.cloud.Reserve(this.width * this.height);
	}

	Stopable(): boolean {
		return true;
	}

	Step() {
		let screen = this.renderer.camera.screen;
		let x = screen.width * (this.currenti / this.width);
		let y = screen.height * (this.currentj / this.height);
		let ray = this.renderer.GetRay(x, y);

		let intersection = this.renderer.ResolveRayIntersection(ray, this.group);
		if (intersection && intersection.HasIntersection()) {
			let dist = Random.Gaussian(intersection.distance, this.noise);
			let point = ray.from.Plus(ray.dir.Times(dist));
			this.cloud.PushPoint(point);
		}

		this.currentj++;
		if (this.currentj >= this.height) {
			this.currentj = 0;
			this.currenti++;
		}
	}

	get Current(): number { return this.currenti * this.width + this.currentj; }
	get Target(): number { return this.width * this.height }
};
