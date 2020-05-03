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
var PointCloud = /** @class */ (function (_super) {
    __extends(PointCloud, _super);
    function PointCloud() {
        var _this = _super.call(this, NameProvider.GetName('PointCloud')) || this;
        _this.tree = null;
        _this.KNearestNeighbours = function (queryPoint, k) {
            if (!this.tree) {
                console.log('Computing KD-Tree for point cloud "' + this.name + '"');
                this.tree = new KDTree(this);
            }
            var knn = new KNearestNeighbours(k);
            this.tree.FindNearestNeighbours(queryPoint, knn);
            return knn.Neighbours();
        };
        _this.points = [];
        _this.pointssize = 0;
        _this.normals = [];
        _this.normalssize = 0;
        _this.boundingbox = new BoundingBox();
        _this.glPointsBuffer = null;
        _this.glNormalsBuffer = null;
        return _this;
    }
    PointCloud.prototype.PushPoint = function (p) {
        if (this.pointssize + p.Dimension() > this.points.length) {
            //Not optimal (Reserve should be called before callin PushPoint)
            this.Reserve(this.points.length + p.Dimension());
        }
        for (var index = 0; index < p.Dimension(); index++) {
            this.points[this.pointssize++] = p.Get(index);
        }
        this.boundingbox.Add(p);
        this.tree = null;
    };
    PointCloud.prototype.Reserve = function (capacity) {
        var points = new Array(3 * capacity);
        for (var index = 0; index < this.pointssize; index++) {
            points[index] = this.points[index];
        }
        this.points = points;
        var normals = new Array(3 * capacity);
        for (var index = 0; index < this.normalssize; index++) {
            normals[index] = this.normals[index];
        }
        this.normals = normals;
    };
    PointCloud.prototype.GetPoint = function (i) {
        var index = 3 * i;
        return new Vector([
            this.points[index],
            this.points[index + 1],
            this.points[index + 2]
        ]);
    };
    PointCloud.prototype.GetPointCoordinate = function (i, j) {
        return this.points[3 * i + j];
    };
    PointCloud.prototype.Size = function () {
        return this.pointssize / 3;
    };
    PointCloud.prototype.PushNormal = function (n) {
        if (this.normalssize + n.Dimension() > this.normals.length) {
            //Not optimal (Reserve should be called before callin PushPoint)
            this.Reserve(this.normals.length + n.Dimension());
        }
        for (var index = 0; index < n.Dimension(); index++) {
            this.normals[this.normalssize++] = n.Get(index);
        }
    };
    PointCloud.prototype.GetNormal = function (i) {
        var index = 3 * i;
        return new Vector([
            this.normals[index],
            this.normals[index + 1],
            this.normals[index + 2]
        ]);
    };
    PointCloud.prototype.InvertNormal = function (i) {
        for (var index = 0; index < 3; index++) {
            this.normals[3 * i + index] = -this.normals[3 * i + index];
        }
    };
    PointCloud.prototype.HasNormals = function () {
        return (this.normalssize == this.pointssize);
    };
    PointCloud.prototype.ClearNormals = function () {
        this.normalssize = 0;
    };
    PointCloud.prototype.PrepareRendering = function (drawingContext) {
        var shapetransform = Matrix.Identity(4);
        drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));
        if (!this.glPointsBuffer) {
            this.glPointsBuffer = drawingContext.gl.createBuffer();
            drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
            drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.points), drawingContext.gl.STATIC_DRAW);
        }
        drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
        drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
        if (this.HasNormals()) {
            drawingContext.EnableNormals(true);
            if (!this.glNormalsBuffer) {
                this.glNormalsBuffer = drawingContext.gl.createBuffer();
                drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glNormalsBuffer);
                drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.normals), drawingContext.gl.STATIC_DRAW);
            }
            drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glNormalsBuffer);
            drawingContext.gl.vertexAttribPointer(drawingContext.normals, 3, drawingContext.gl.FLOAT, false, 0, 0);
        }
        else {
            drawingContext.EnableNormals(false);
        }
    };
    PointCloud.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            this.material.InitializeLightingModel(drawingContext);
            this.PrepareRendering(drawingContext);
            drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, this.Size());
            if (this.selected && this.pointssize > 0) {
                this.boundingbox.Draw(drawingContext);
            }
        }
    };
    PointCloud.prototype.RayIntersection = function (ray) {
        return new Picking(this);
    };
    PointCloud.prototype.ComputeNormal = function (index, k) {
        //Get the K-nearest neighbours (including the query point)
        var point = this.GetPoint(index);
        var knn = this.KNearestNeighbours(point, k + 1);
        //Compute the covariance matrix
        var covariance = Matrix.Null(3, 3);
        var center = new Vector([0, 0, 0]);
        for (var ii = 0; ii < knn.length; ii++) {
            if (knn[ii].index != index) {
                center = center.Plus(this.GetPoint(knn[ii].index));
            }
        }
        center = center.Times(1 / (knn.length - 1));
        for (var kk = 0; kk < knn.length; kk++) {
            if (knn[kk].index != index) {
                var vec = this.GetPoint(knn[kk].index).Minus(center);
                for (var ii = 0; ii < 3; ii++) {
                    for (var jj = 0; jj < 3; jj++) {
                        covariance.SetValue(ii, jj, covariance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj)));
                    }
                }
            }
        }
        //The normal is the eigenvector having the smallest eigenvalue in the covariance matrix
        for (var ii = 0; ii < 3; ii++) {
            //Check no column is null in the covariance matrix
            if (covariance.GetColumnVector(ii).SqrNorm() <= 1.0e-12) {
                var result = new Vector([0, 0, 0]);
                result.Set(ii, 1);
                return result;
            }
        }
        var eigen = new EigenDecomposition(covariance);
        if (eigen) {
            return eigen[0].eigenVector.Normalized();
        }
        return null;
    };
    PointCloud.prototype.ComputeConnectedComponents = function (k, onDone) {
        k = k || 30;
        var builder = new PCDProcessing.ConnecterComponentsBuilder(this, k);
        builder.SetNext(function (b) { return onDone(b.result); });
        builder.Start();
    };
    PointCloud.prototype.ComputeNormals = function (k, ondone) {
        k = k || 30;
        var ncomputer = new PCDProcessing.NormalsComputer(this, k);
        var nharmonizer = new PCDProcessing.NormalsHarmonizer(this, k);
        ncomputer.SetNext(nharmonizer).SetNext(function () { return ondone(); });
        ncomputer.Start();
    };
    PointCloud.prototype.GaussianSphere = function () {
        var gsphere = new PointCloud();
        gsphere.Reserve(this.Size());
        for (var index = 0; index < this.Size(); index++) {
            gsphere.PushPoint(this.GetNormal(index));
        }
        return gsphere;
    };
    PointCloud.prototype.GetCSVData = function () {
        var result = 'x;y;z';
        if (this.HasNormals()) {
            result += ';nx;ny;nz';
        }
        result += '\n';
        for (var index = 0; index < this.Size(); index++) {
            var point = this.GetPoint(index);
            result += point.Get(0) + ';' +
                point.Get(1) + ';' +
                point.Get(2);
            if (this.HasNormals()) {
                var normal = this.GetNormal(index);
                result += ';' + normal.Get(0) + ';' +
                    normal.Get(1) + ';' +
                    normal.Get(2);
            }
            result += '\n';
        }
        return result;
    };
    PointCloud.prototype.GetActions = function (dataHandler, onDone) {
        var cloud = this;
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        if (this.HasNormals()) {
            result.push(new ClearNormalsAction(cloud, onDone));
        }
        else {
            result.push(new ComputeNormalsAction(cloud, onDone));
        }
        result.push(new GaussianSphereAction(cloud, onDone));
        result.push(null);
        if (cloud.ransac) {
            result.push(new ResetDetectionAction(cloud, onDone));
        }
        if (!(cloud.ransac && cloud.ransac.IsDone())) {
            result.push(new RansacDetectionAction(cloud, onDone));
        }
        result.push(new ConnectedComponentsAction(cloud, onDone));
        result.push(new ExportPointCloudFileAction(cloud, onDone));
        return result;
    };
    PointCloud.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        var points = new NumberProperty('Points', this.Size(), null);
        points.SetReadonly();
        properties.Push(points);
        return properties;
    };
    return PointCloud;
}(CADPrimitive));
var PCDProcessing;
(function (PCDProcessing) {
    var NormalsComputer = /** @class */ (function (_super) {
        __extends(NormalsComputer, _super);
        function NormalsComputer(cloud, k) {
            var _this = _super.call(this, cloud.Size(), 'Computing normals (' + cloud.Size() + ' data points)') || this;
            _this.cloud = cloud;
            _this.k = k;
            return _this;
        }
        NormalsComputer.prototype.Initialize = function () {
            if (this.cloud.normals.length != this.cloud.points.length) {
                this.cloud.normals = new Array(this.cloud.points.length);
            }
            this.cloud.ClearNormals();
        };
        NormalsComputer.prototype.Iterate = function (step) {
            var normal = this.cloud.ComputeNormal(step, this.k);
            this.cloud.PushNormal(normal);
        };
        return NormalsComputer;
    }(IterativeLongProcess));
    PCDProcessing.NormalsComputer = NormalsComputer;
    ;
    var NormalsHarmonizer = /** @class */ (function (_super) {
        __extends(NormalsHarmonizer, _super);
        function NormalsHarmonizer(cloud, k) {
            return _super.call(this, cloud, k, 'Harmonizing normals (' + cloud.Size() + ' data points)') || this;
        }
        NormalsHarmonizer.prototype.ProcessPoint = function (cloud, index, knn, region) {
            //Search for the neighbor whose normal orientation has been decided,
            //and whose normal is the most aligned with the current one
            var ss = 0;
            var normal = cloud.GetNormal(index);
            for (var ii = 0; ii < knn.length; ii++) {
                var nnindex = knn[ii].index;
                if (this.Status(nnindex) === RegionGrowthStatus.processed) {
                    var nnormal = cloud.GetNormal(nnindex);
                    var s = nnormal.Dot(normal);
                    if (Math.abs(s) > Math.abs(ss))
                        ss = s;
                }
            }
            if (ss < 0)
                cloud.InvertNormal(index);
        };
        return NormalsHarmonizer;
    }(RegionGrowthProcess));
    PCDProcessing.NormalsHarmonizer = NormalsHarmonizer;
    ;
    var ConnecterComponentsBuilder = /** @class */ (function (_super) {
        __extends(ConnecterComponentsBuilder, _super);
        function ConnecterComponentsBuilder(cloud, k) {
            var _this = _super.call(this, cloud, k, 'Computing connected components') || this;
            _this.result = new CADGroup(cloud.name + ' - ' + k + '-connected components');
            return _this;
        }
        ConnecterComponentsBuilder.prototype.ProcessPoint = function (cloud, index, knn, region) {
            if (region >= this.result.children.length)
                this.result.Add(new PointCloud());
            var component = this.result.children[region];
            component.PushPoint(cloud.GetPoint(index));
            if (cloud.HasNormals())
                component.PushNormal(cloud.GetNormal(index));
        };
        return ConnecterComponentsBuilder;
    }(RegionGrowthProcess));
    PCDProcessing.ConnecterComponentsBuilder = ConnecterComponentsBuilder;
})(PCDProcessing || (PCDProcessing = {}));
