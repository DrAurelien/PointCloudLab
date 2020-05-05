var Octree = /** @class */ (function () {
    function Octree(mesh, maxdepth, facespercell) {
        if (maxdepth === void 0) { maxdepth = 10; }
        if (facespercell === void 0) { facespercell = 30; }
        this.mesh = mesh;
        this.maxdepth = maxdepth;
        this.facespercell = facespercell;
        var size = mesh.Size();
        this.facescache = new Array(size);
        for (var index = 0; index < size; index++) {
            this.facescache[index] = mesh.GetFace(index);
        }
        this.root = new OctreeCell(this, null, mesh.GetBoundingBox());
        this.root.Split();
    }
    Octree.prototype.RayIntersection = function (ray) {
        var result = new Picking(this.mesh);
        if (this.root) {
            this.root.RayIntersection(ray, result);
        }
        return result;
    };
    Octree.prototype.GetFace = function (index) {
        return this.facescache[index];
    };
    Object.defineProperty(Octree.prototype, "NbFaces", {
        get: function () {
            return this.facescache.length;
        },
        enumerable: true,
        configurable: true
    });
    return Octree;
}());
var OctreeCell = /** @class */ (function () {
    function OctreeCell(octree, parent, boundingbox) {
        this.octree = octree;
        this.parent = parent;
        this.boundingbox = boundingbox;
        var candidates;
        if (parent) {
            this.depth = parent.depth + 1;
            candidates = parent.faces;
        }
        else {
            this.depth = 0;
            var size = octree.NbFaces;
            candidates = new Array(size);
            for (var index_1 = 0; index_1 < size; index_1++) {
                candidates[index_1] = index_1;
            }
        }
        this.faces = new Array(candidates.length);
        var nbfaces = 0;
        for (var index = 0; index < candidates.length; index++) {
            var face = octree.GetFace(candidates[index]);
            if (face.IntersectBox(this.boundingbox)) {
                this.faces[nbfaces] = candidates[index];
                nbfaces++;
            }
        }
        this.faces.splice(nbfaces);
        this.sons = [];
    }
    OctreeCell.prototype.Split = function () {
        if (this.depth >= this.octree.maxdepth || this.faces.length <= this.octree.facespercell) {
            return false;
        }
        var center = this.boundingbox.GetCenter();
        var min = this.boundingbox.min;
        var max = this.boundingbox.max;
        var boxes = [];
        boxes.push(new BoundingBox(new Vector([min.Get(0), min.Get(1), min.Get(2)]), new Vector([center.Get(0), center.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), min.Get(1), min.Get(2)]), new Vector([max.Get(0), center.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), center.Get(1), min.Get(2)]), new Vector([center.Get(0), max.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), min.Get(1), center.Get(2)]), new Vector([center.Get(0), center.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), center.Get(1), min.Get(2)]), new Vector([max.Get(0), max.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), center.Get(1), center.Get(2)]), new Vector([center.Get(0), max.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), min.Get(1), center.Get(2)]), new Vector([max.Get(0), center.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), center.Get(1), center.Get(2)]), new Vector([max.Get(0), max.Get(1), max.Get(2)])));
        for (var index = 0; index < boxes.length; index++) {
            var son = new OctreeCell(this.octree, this, boxes[index]);
            son.Split();
            this.sons.push(son);
        }
        return true;
    };
    OctreeCell.prototype.RayIntersection = function (ray, result) {
        var boxintersection = this.boundingbox.RayIntersection(ray);
        if (boxintersection.HasIntersection() && boxintersection.Compare(result) < 0) {
            var nbsons = this.sons.length;
            if (nbsons > 0) {
                for (var index_2 = 0; index_2 < nbsons; index_2++) {
                    this.sons[index_2].RayIntersection(ray, result);
                }
            }
            else {
                for (var index = 0; index < this.faces.length; index++) {
                    var face = this.octree.GetFace(this.faces[index]);
                    var tt = face.LineFaceIntersection(ray);
                    if (tt != null) {
                        result.Add(tt);
                    }
                }
            }
        }
    };
    return OctreeCell;
}());
//# sourceMappingURL=octree.js.map