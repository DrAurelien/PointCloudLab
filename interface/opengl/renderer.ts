class Renderer implements Control {
	sceneRenderingArea: HTMLCanvasElement;
	drawingcontext: DrawingContext;
	camera: Camera;

    constructor(className : string) {
        //Create a canvas to display the scene
        this.sceneRenderingArea = document.createElement('canvas');
        this.sceneRenderingArea.className = className;

        this.drawingcontext = new DrawingContext(this.sceneRenderingArea);
        this.camera = new Camera(this.drawingcontext);
    }

	GetElement(): HTMLElement {
		return this.sceneRenderingArea;
	}

    Draw(scene : Scene) : void {
        var gl = this.drawingcontext.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//Set the lights positions and colors
		let nbLights = 0;
		for (var index = 0; index < scene.Lights.children.length; index++) {
			let light = <Light>scene.Lights.children[index];
			if (light.visible) {
				this.drawingcontext.gl.uniform3fv(this.drawingcontext.lightpositions[nbLights], new Float32Array(light.Position.coordinates));
				this.drawingcontext.gl.uniform3fv(this.drawingcontext.lightcolors[nbLights], new Float32Array(light.Color));
				nbLights++;
			}
		}
		this.drawingcontext.gl.uniform1i(this.drawingcontext.nblights, nbLights);

		//Set the camera position
		this.camera.InititalizeDrawingContext(this.drawingcontext);

		//Perform rendering
        if (scene) {
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
    }

    GetRay(x: number, y: number) : Ray {
        let point : Vector = this.camera.ComputeInvertedProjection(new Vector([x, y, -1.0]));
        return new Ray(this.camera.at, point.Minus(this.camera.at).Normalized());
    }

    ResolveRayIntersection(ray: Ray, root: CADNode): Picking {
		return root.RayIntersection(ray);
    }

    PickObject(x: number, y: number, scene: Scene): CADNode {
        let ray : Ray = this.GetRay(x, y);
        let picked = this.ResolveRayIntersection(ray, scene.Contents);

        if (picked != null && picked.HasIntersection()) {
            return picked.object;
        }
        return null;
    }

    ScanFromCurrentViewPoint(group: CADNode, hsampling: number, vsampling: number, resultHandler: Function) {
        let scanner = new SceneScanner(this, group, hsampling, vsampling);
        scanner.SetNext((s: SceneScanner) => resultHandler(s.cloud));
        scanner.Start();
    }
}

class SceneScanner extends LongProcess {
    currenti: number;
    currentj: number;
    public cloud: PointCloud;

    constructor(private renderer: Renderer, private group: CADNode, private width: number, private height: number) {
        super('Scanning the scene (' + width + 'x' + height + ')');
        this.currenti = 0;
        this.currentj = 0;
    }

    Initialize() {
        this.cloud = new PointCloud();
        this.cloud.Reserve(this.width * this.height);
	}

    Step() {
        let screen = this.renderer.camera.screen;
        let x = screen.width * (this.currenti / this.width);
        let y = screen.height * (this.currentj / this.height);
        let ray = this.renderer.GetRay(x, y);

        let intersection = this.renderer.ResolveRayIntersection(ray, this.group);
        if (intersection && intersection.HasIntersection()) {
            let point = ray.from.Plus(ray.dir.Times(intersection.distance));
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
