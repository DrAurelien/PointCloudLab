class MouseTracker {
    date: Date;

    constructor(public x: number, public y: number, public button: number) {
        this.date = new Date();
    }
}

class Renderer {
    drawingcontext: DrawingContext;
    camera: Camera;
	light: Sphere;
    private mousetracker: MouseTracker;

    constructor(public renderingArea: HTMLCanvasElement, public refreshCallback: Function, scene : Scene) {
        this.drawingcontext = new DrawingContext(renderingArea, refreshCallback);
        this.camera = new Camera(this.drawingcontext);

		this.light = new Sphere(new Vector([10.0, 10.0, 10.0]), 0.1);
		this.light.material = new Material([1.0, 1.0, 1.0], 0.0, 3.0, 0.0, 1.0);

        this.mousetracker = null;
        this.Draw(scene);

        var renderer = this;

        this.drawingcontext.renderingArea.oncontextmenu = function (event: Event) {
            event = event || window.event;
            event.preventDefault();
            return false;
        };

        this.drawingcontext.renderingArea.onmousedown = function (event: MouseEvent) {
            event = <MouseEvent>(event || window.event);
            renderer.mousetracker = new MouseTracker(event.clientX, event.clientY, event.which);
        };


        this.drawingcontext.renderingArea.onmouseup = function (event : MouseEvent) {
            event = <MouseEvent>(event || window.event);
            var now = new Date();
            if (renderer.mousetracker != null) {
                if (now.getTime() - renderer.mousetracker.date.getTime() < 200) {
                    var selected = renderer.PickObject(event.clientX, event.clientY, scene);
                    scene.Select(selected);
                    refreshCallback(selected);
                }
            }
            renderer.mousetracker = null;
        };

        this.drawingcontext.renderingArea.onmousemove = function (event: MouseEvent) {
            event = <MouseEvent>(event || window.event);

            var dx = 0, dy = 0;
            if (renderer.mousetracker) {
                dx = event.clientX - renderer.mousetracker.x;
                //Screen coordinate system is top-left (oriented down) while camera is oriented up
                dy = renderer.mousetracker.y - event.clientY;
                renderer.mousetracker.x = event.clientX;
                renderer.mousetracker.y = event.clientY;

                switch (renderer.mousetracker.button) {
                    case 1: //Left mouse
                        renderer.camera.Rotate(dx, dy);
                        break;
                    case 2: //Middle mouse
                        renderer.camera.Zoom(dy / 10);
                        break;
                    case 3: //Right mouse
                        renderer.camera.Pan(dx, dy);
                        break;
                    default:
                        return true;
                }

                renderer.Draw(scene);
            }
            return true;
        };

        this.drawingcontext.renderingArea.onmousewheel = function (event: MouseWheelEvent) {
            event = <MouseWheelEvent>(event || window.event);
            renderer.camera.Zoom(event.wheelDelta / 100);
            renderer.Draw(scene);
        };

        document.onkeypress = function (event: KeyboardEvent) {
            event = <KeyboardEvent>(event || window.event);
            var key = event.key ? event.key.charCodeAt(0) : event.keyCode;
            switch (key) {
                case 'p'.charCodeAt(0):
                    renderer.drawingcontext.rendering.Point(!renderer.drawingcontext.rendering.Point());
                    break;
                case 'w'.charCodeAt(0):
                    renderer.drawingcontext.rendering.Wire(!renderer.drawingcontext.rendering.Wire());
                    break;
                case 's'.charCodeAt(0):
                    renderer.drawingcontext.rendering.Surface(!renderer.drawingcontext.rendering.Surface());
                    break;
                default:
                    return true;
            }
            renderer.Draw(scene);
        };
    }
    

    Draw(scene : Scene) : void {
        var gl = this.drawingcontext.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//Set the light position
        this.drawingcontext.gl.uniform3fv(this.drawingcontext.lightposition, new Float32Array(this.light.center.coordinates));

		//Set the camera position
		this.camera.InititalizeDrawingContext(this.drawingcontext);

		//Perform rendering
        if (scene) {
            scene.Draw(this.drawingcontext);
        }
		this.light.Draw(this.drawingcontext);
    }
    
    Resize(width : number, height : number) : void {
        this.drawingcontext.renderingArea.width = width;
        this.drawingcontext.renderingArea.height = height;
    }

    GetRay(x: number, y: number) : Ray {
        let point : Vector = this.camera.ComputeInvertedProjection(new Vector([x, y, -1.0]));
        return new Ray(this.camera.at, point.Minus(this.camera.at).Normalized());
    }

    ResolveRayIntersection(ray: Ray, root: CADGroup): Picking {
		return root.RayIntersection(ray);
    }

    PickObject(x: number, y: number, scene: Scene): CADPrimitive {
        let ray : Ray = this.GetRay(x, y);
        let picked = this.ResolveRayIntersection(ray, scene.root);

        if (picked != null && picked.HasIntersection()) {
            return picked.object;
        }
        return null;
    }

    ScanFromCurrentViewPoint(group: CADGroup, resultHandler: Function) {
        var self = this;
        var resolution =
            {
                width: 1024,
                height: 768,
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