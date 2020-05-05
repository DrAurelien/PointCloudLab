var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Renderer = /** @class */ (function () {
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
        var scanner = new SceneScanner(this, group, hsampling, vsampling);
        scanner.SetNext(function (s) { return resultHandler(s.cloud); });
        scanner.Start();
    };
    return Renderer;
}());
var SceneScanner = /** @class */ (function (_super) {
    __extends(SceneScanner, _super);
    function SceneScanner(renderer, group, width, height) {
        var _this = _super.call(this, 'Scanning the scene (' + width + 'x' + height + ')') || this;
        _this.renderer = renderer;
        _this.group = group;
        _this.width = width;
        _this.height = height;
        _this.currenti = 0;
        _this.currentj = 0;
        return _this;
    }
    SceneScanner.prototype.Initialize = function () {
        this.cloud = new PointCloud();
        this.cloud.Reserve(this.width * this.height);
    };
    SceneScanner.prototype.Step = function () {
        var screen = this.renderer.camera.screen;
        var x = screen.width * (this.currenti / this.width);
        var y = screen.height * (this.currentj / this.height);
        var ray = this.renderer.GetRay(x, y);
        var intersection = this.renderer.ResolveRayIntersection(ray, this.group);
        if (intersection && intersection.HasIntersection()) {
            var point = ray.from.Plus(ray.dir.Times(intersection.distance));
            this.cloud.PushPoint(point);
        }
        this.currentj++;
        if (this.currentj >= this.height) {
            this.currentj = 0;
            this.currenti++;
        }
    };
    Object.defineProperty(SceneScanner.prototype, "Current", {
        get: function () { return this.currenti * this.width + this.currentj; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneScanner.prototype, "Target", {
        get: function () { return this.width * this.height; },
        enumerable: true,
        configurable: true
    });
    return SceneScanner;
}(LongProcess));
;
//# sourceMappingURL=renderer.js.map