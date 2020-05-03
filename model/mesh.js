//import './meshface.ts';
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
var Mesh = /** @class */ (function (_super) {
    __extends(Mesh, _super);
    function Mesh(pointcloud) {
        var _this = _super.call(this, NameProvider.GetName('Mesh')) || this;
        _this.pointcloud = pointcloud;
        _this.faces = [];
        _this.size = 0;
        return _this;
    }
    Mesh.prototype.PushFace = function (f) {
        if (f.length != 3) {
            throw 'Non triangular faces are not (yet) supported in meshes';
        }
        if (this.size + f.length > this.faces.length) {
            //Not optimal (Reserve should be called before callin PushFace)
            this.Reserve(this.faces.length + f.length);
        }
        for (var index = 0; index < f.length; index++) {
            this.faces[this.size++] = f[index];
        }
    };
    Mesh.prototype.Reserve = function (capacity) {
        var faces = new Array(3 * capacity);
        for (var index = 0; index < this.size; index++) {
            faces[index] = this.faces[index];
        }
        this.faces = faces;
    };
    Mesh.prototype.GetFace = function (i) {
        var index = 3 * i;
        var indices = [
            this.faces[index++],
            this.faces[index++],
            this.faces[index++]
        ];
        return new MeshFace(indices, [
            this.pointcloud.GetPoint(indices[0]),
            this.pointcloud.GetPoint(indices[1]),
            this.pointcloud.GetPoint(indices[2])
        ]);
    };
    Mesh.prototype.Size = function () {
        return this.size / 3;
    };
    Mesh.prototype.ComputeOctree = function (onDone) {
        if (!this.octree) {
            var self_1 = this;
            self_1.octree = new Octree(this);
        }
        if (onDone)
            onDone(this);
    };
    Mesh.prototype.ClearNormals = function () {
        this.pointcloud.ClearNormals();
    };
    Mesh.prototype.ComputeNormals = function (onDone) {
        var _this = this;
        if (onDone === void 0) { onDone = null; }
        if (!this.pointcloud.HasNormals()) {
            var ncomputer = new MeshProcessing.NormalsComputer(this);
            ncomputer.SetNext(function () { if (onDone)
                onDone(_this); });
            ncomputer.Start();
        }
    };
    Mesh.prototype.GetBoundingBox = function () {
        return this.pointcloud.GetBoundingBox();
    };
    Mesh.prototype.PrepareRendering = function (drawingContext) {
        this.pointcloud.PrepareRendering(drawingContext);
        if (!this.glIndexBuffer) {
            this.glIndexBuffer = drawingContext.gl.createBuffer();
            drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
            drawingContext.gl.bufferData(drawingContext.gl.ELEMENT_ARRAY_BUFFER, drawingContext.GetIntArray(this.faces), drawingContext.gl.STATIC_DRAW);
        }
        drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
    };
    Mesh.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            this.material.InitializeLightingModel(drawingContext);
            this.PrepareRendering(drawingContext);
            //Points-based rendering
            if (drawingContext.rendering.Point()) {
                this.pointcloud.Draw(drawingContext);
            }
            //Surface rendering
            if (drawingContext.rendering.Surface()) {
                drawingContext.gl.drawElements(drawingContext.gl.TRIANGLES, this.size, drawingContext.GetIntType(), 0);
            }
            //Wire rendering
            if (drawingContext.rendering.Wire()) {
                drawingContext.gl.drawElements(drawingContext.gl.LINES, this.size, drawingContext.GetIntType(), 0);
            }
            if (this.selected) {
                this.GetBoundingBox().Draw(drawingContext);
            }
        }
    };
    Mesh.prototype.RayIntersection = function (ray) {
        if (this.octree) {
            return this.octree.RayIntersection(ray);
        }
        var result = new Picking(this);
        for (var ii = 0; ii < this.Size(); ii++) {
            var tt = this.GetFace(ii).LineFaceIntersection(ray);
            if (tt !== null) {
                result.Add(tt);
            }
        }
        return result;
    };
    Mesh.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        var points = new NumberProperty('Points', this.pointcloud.Size(), null);
        points.SetReadonly();
        var faces = new NumberProperty('Faces', this.Size(), null);
        faces.SetReadonly();
        properties.Push(points);
        properties.Push(faces);
        return properties;
    };
    return Mesh;
}(CADPrimitive));
var MeshProcessing;
(function (MeshProcessing) {
    var NormalsComputer = /** @class */ (function (_super) {
        __extends(NormalsComputer, _super);
        function NormalsComputer(mesh) {
            var _this = _super.call(this, mesh.Size(), 'Computing normals') || this;
            _this.mesh = mesh;
            return _this;
        }
        NormalsComputer.prototype.Initialize = function () {
            this.normals = new Array(this.mesh.pointcloud.Size());
            for (var index = 0; index < this.normals.length; index++) {
                this.normals[index] = new Vector([0, 0, 0]);
            }
        };
        NormalsComputer.prototype.Iterate = function (step) {
            var face = this.mesh.GetFace(step);
            for (var index = 0; index < face.indices.length; index++) {
                var nindex = face.indices[index];
                this.normals[nindex] = this.normals[nindex].Plus(face.Normal);
            }
        };
        NormalsComputer.prototype.Finalize = function () {
            var cloud = this.mesh.pointcloud;
            cloud.ClearNormals();
            var nbPoints = cloud.Size();
            for (var index = 0; index < nbPoints; index++) {
                cloud.PushNormal(this.normals[index].Normalized());
            }
        };
        return NormalsComputer;
    }(IterativeLongProcess));
    MeshProcessing.NormalsComputer = NormalsComputer;
    ;
})(MeshProcessing || (MeshProcessing = {}));
