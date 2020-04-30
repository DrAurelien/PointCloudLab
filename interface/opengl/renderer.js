var Renderer = (function () {
    function Renderer(className) {
        //Create a canvas to display the scene
        this.sceneRenderingArea = document.createElement('canvas');
        this.sceneRenderingArea.className = className;
        this.drawingcontext = new DrawingContext(this.sceneRenderingArea);
        this.camera = new Camera(this.drawingcontext);
    }
    Renderer.prototype.GetElement = function () {
        return this.sceneRenderingArea;
    };
    Renderer.prototype.Draw = function (scene) {
        var gl = this.drawingcontext.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //Set the lights positions and colors
        var nbLights = 0;
        for (var index = 0; index < scene.Lights.children.length; index++) {
            var light = scene.Lights.children[index];
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
    };
    Renderer.prototype.RefreshSize = function () {
        this.Resize(this.sceneRenderingArea.scrollWidth, this.sceneRenderingArea.scrollHeight);
    };
    Renderer.prototype.Resize = function (width, height) {
        this.drawingcontext.renderingArea.width = width;
        this.drawingcontext.renderingArea.height = height;
        this.camera.screen.width = width;
        this.camera.screen.height = height;
    };
    Renderer.prototype.GetRay = function (x, y) {
        var point = this.camera.ComputeInvertedProjection(new Vector([x, y, -1.0]));
        return new Ray(this.camera.at, point.Minus(this.camera.at).Normalized());
    };
    Renderer.prototype.ResolveRayIntersection = function (ray, root) {
        return root.RayIntersection(ray);
    };
    Renderer.prototype.PickObject = function (x, y, scene) {
        var ray = this.GetRay(x, y);
        var picked = this.ResolveRayIntersection(ray, scene.Contents);
        if (picked != null && picked.HasIntersection()) {
            return picked.object;
        }
        return null;
    };
    Renderer.prototype.ScanFromCurrentViewPoint = function (group, hsampling, vsampling, resultHandler) {
        var self = this;
        var resolution = {
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
            var ray = self.GetRay(self.camera.screen.width * (resolution.currenti / resolution.width), self.camera.screen.height * (resolution.currentj / resolution.height));
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
    };
    return Renderer;
}());
//# sourceMappingURL=renderer.js.map