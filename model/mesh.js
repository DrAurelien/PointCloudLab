//import './meshface.ts';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Mesh = (function (_super) {
    __extends(Mesh, _super);
    function Mesh(pointcloud) {
        _super.call(this, NameProvider.GetName('Mesh'));
        this.pointcloud = pointcloud;
        this.faces = [];
        this.size = 0;
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
        var _this = this;
        if (!this.octree) {
            var self_1 = this;
            LongProcess.Run('Computing space partitionning of the mesh', function () { self_1.octree = new Octree(_this); }, onDone);
        }
    };
    Mesh.prototype.ClearNormals = function () {
        this.pointcloud.ClearNormals();
    };
    Mesh.prototype.ComputeNormals = function (onDone) {
        if (onDone === void 0) { onDone = null; }
        var nbFaces = this.Size();
        var nbPoints = this.pointcloud.Size();
        var normals = new Array(nbPoints);
        var self = this;
        function Initialize() {
            var index = 0;
            LongProcess.Run(onDone ? 'Initializing normals (step 1 / 3)' : null, function () {
                if (index >= nbPoints) {
                    return null;
                }
                normals[index++] = new Vector([0, 0, 0]);
                return { current: index, total: nbPoints };
            }, Compute);
        }
        function Compute() {
            var index = 0;
            LongProcess.Run(onDone ? 'Computing normals (step 2 / 3)' : null, function () {
                if (index >= nbFaces) {
                    return null;
                }
                var face = self.GetFace(index++);
                for (var pointindex = 0; pointindex < face.indices.length; pointindex++) {
                    normals[face.indices[pointindex]] = normals[face.indices[pointindex]].Plus(face.Normal);
                }
                return { current: index, total: nbFaces };
            }, FillPointCloud);
        }
        function FillPointCloud() {
            var index = 0;
            self.pointcloud.ClearNormals();
            LongProcess.Run(onDone ? 'Assigning normals (step 3 / 3)' : null, function () {
                if (index >= nbPoints) {
                    return null;
                }
                self.pointcloud.PushNormal(normals[index++].Normalized());
                return { current: index, total: nbPoints };
            }, function () {
                if (onDone) {
                    onDone(self);
                }
            });
        }
        if (!this.pointcloud.HasNormals()) {
            Initialize();
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
//# sourceMappingURL=mesh.js.map