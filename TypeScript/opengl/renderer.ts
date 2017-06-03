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
    
    Resize(width : number, height : number) : void {
        this.drawingcontext.renderingArea.width = width;
        this.drawingcontext.renderingArea.height = height;
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
        var self = this;
        var resolution =
            {
                width: hsampling,
                height: vsampling,
                currenti: 0,
                currentj: 0,
                next: function () {
                    this.currentj++;
                    if (this.currentj >= this.height) {
                        this.currentj = 0;
                        this.currenti++;
                    }
                    if (this.currenti < this.width) {
                        return {
                            current: this.currenti * this.width + this.currentj,
                            total: this.width * this.height
                        };
                    }
                    return null;
                },
                log: function () {
                    return '' + this.width + 'x' + this.height;
                }
            };

        var cloud = new PointCloud();
        cloud.Reserve(resolution.width * resolution.height);

        function GenerateScanRay() {
            var ray = self.GetRay(
                self.camera.screen.width * (resolution.currenti / resolution.width),
                self.camera.screen.height * (resolution.currentj / resolution.height)
                );
            var intersection = self.ResolveRayIntersection(ray, group);
            if (intersection && intersection.HasIntersection()) {
                var point = ray.from.Plus(ray.dir.Times(intersection.distance));
                cloud.PushPoint(point);
            }
            return resolution.next();
        }

        function HandleResult() {
            if (resultHandler) {
                resultHandler(cloud);
            }
        }

        LongProcess.Run('Scanning the scene (' + resolution.log() + ')', GenerateScanRay, HandleResult);
    }
}