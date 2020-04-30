var BoundingBox = (function () {
    function BoundingBox(min, max) {
        if (min === void 0) { min = null; }
        if (max === void 0) { max = null; }
        this.min = min;
        this.max = max;
    }
    BoundingBox.InititalizeGL = function (glContext) {
        if (this.pointsBuffer === null) {
            var points = [
                -0.5, -0.5, -0.5,
                -0.5, 0.5, -0.5,
                0.5, 0.5, -0.5,
                0.5, -0.5, -0.5,
                -0.5, -0.5, 0.5,
                -0.5, 0.5, 0.5,
                0.5, 0.5, 0.5,
                0.5, -0.5, 0.5];
            var indices = [
                0, 1, 2, 3,
                4, 5, 6, 7,
                0, 4,
                1, 5,
                2, 6,
                3, 7
            ];
            this.drawnElements = [
                new GLBufferElement(0, 4, glContext.LINE_LOOP),
                new GLBufferElement(4, 4, glContext.LINE_LOOP),
                new GLBufferElement(8, 2, glContext.LINES),
                new GLBufferElement(10, 2, glContext.LINES),
                new GLBufferElement(12, 2, glContext.LINES),
                new GLBufferElement(14, 2, glContext.LINES)
            ];
            //Create webgl buffers
            this.pointsBuffer = glContext.createBuffer();
            glContext.bindBuffer(glContext.ARRAY_BUFFER, this.pointsBuffer);
            glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(points), glContext.STATIC_DRAW);
            //indices buffer
            this.indexBuffer = glContext.createBuffer();
            glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), glContext.STATIC_DRAW);
        }
    };
    BoundingBox.prototype.Set = function (center, size) {
        var halfSize = size.Times(0.5);
        this.min = center.Minus(halfSize);
        this.max = center.Plus(halfSize);
    };
    BoundingBox.prototype.GetCenter = function () {
        return this.min.Plus(this.max).Times(0.5);
    };
    BoundingBox.prototype.GetSize = function () {
        return this.max.Minus(this.min);
    };
    BoundingBox.prototype.Add = function (p) {
        if (this.min == null || this.max == null) {
            this.min = new Vector(p.Flatten());
            this.max = new Vector(p.Flatten());
        }
        else {
            for (var index = 0; index < p.Dimension(); index++) {
                this.min.Set(index, Math.min(this.min.Get(index), p.Get(index)));
                this.max.Set(index, Math.max(this.max.Get(index), p.Get(index)));
            }
        }
    };
    BoundingBox.prototype.AddBoundingBox = function (bb) {
        if (bb && bb.IsValid()) {
            this.Add(bb.min);
            this.Add(bb.max);
        }
    };
    BoundingBox.prototype.IsValid = function () {
        return (this.min != null && this.max != null);
    };
    BoundingBox.prototype.Intersect = function (box) {
        var dim = this.min.Dimension();
        for (var index = 0; index < dim; index++) {
            if ((box.max.Get(index) < this.min.Get(index)) || (box.min.Get(index) > this.max.Get(index))) {
                return false;
            }
        }
        return true;
    };
    BoundingBox.prototype.TestAxisSeparation = function (point, axis) {
        var dim = this.min.Dimension();
        var v = 0.0;
        for (var index = 0; index < dim; index++) {
            v += Math.abs(axis.Get(index) * (this.max.Get(index) - this.min.Get(index)));
        }
        var proj = this.GetCenter().Minus(point).Dot(axis);
        var minproj = proj - v;
        var maxproj = proj + v;
        return (minproj * maxproj) > 0;
    };
    BoundingBox.prototype.RayIntersection = function (ray) {
        var result = new Picking(null);
        var dim = this.min.Dimension();
        var self = this;
        function Accept(dist, ignore) {
            var inside = true;
            var p = ray.GetPoint(dist);
            for (var index = 0; inside && index < dim; index++) {
                if (index != ignore) {
                    inside = (p.Get(index) >= self.min.Get(index)) && (p.Get(index) <= self.max.Get(index));
                }
            }
            if (inside) {
                result.Add(dist);
            }
        }
        for (var index = 0; index < dim; index++) {
            var dd = ray.dir.Get(index);
            if (Math.abs(dd) > 1.0e-12) {
                Accept((this.min.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
                Accept((this.max.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
            }
        }
        return result;
    };
    BoundingBox.prototype.Draw = function (drawingContext) {
        if (this.IsValid()) {
            drawingContext.EnableNormals(false);
            BoundingBox.InititalizeGL(drawingContext.gl);
            var material = new Material([1.0, 1.0, 0.0]);
            material.InitializeLightingModel(drawingContext);
            var size = this.GetSize();
            var center = this.GetCenter();
            var shapetransform = Matrix.Identity(4);
            for (var index_1 = 0; index_1 < 3; index_1++) {
                shapetransform.SetValue(index_1, index_1, size.Get(index_1));
                shapetransform.SetValue(index_1, 3, center.Get(index_1));
            }
            drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));
            drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, BoundingBox.pointsBuffer);
            drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
            drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, BoundingBox.indexBuffer);
            var sizeOfUnisgnedShort = 2;
            for (var index = 0; index < BoundingBox.drawnElements.length; index++) {
                var element = BoundingBox.drawnElements[index];
                drawingContext.gl.drawElements(element.type, element.count, drawingContext.gl.UNSIGNED_SHORT, sizeOfUnisgnedShort * element.from);
            }
        }
    };
    BoundingBox.pointsBuffer = null;
    BoundingBox.indexBuffer = null;
    return BoundingBox;
}());
var GLBufferElement = (function () {
    function GLBufferElement(from, count, type) {
        this.from = from;
        this.count = count;
        this.type = type;
    }
    return GLBufferElement;
}());
//# sourceMappingURL=boundingbox.js.map