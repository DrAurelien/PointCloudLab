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
var CADGroup = /** @class */ (function (_super) {
    __extends(CADGroup, _super);
    function CADGroup(name, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, name, owner) || this;
        _this.children = [];
        _this.folded = false;
        return _this;
    }
    CADGroup.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index].Draw(drawingContext);
            }
            if (this.selected) {
                var box = this.GetBoundingBox();
                box.Draw(drawingContext);
            }
        }
    };
    CADGroup.prototype.RayIntersection = function (ray) {
        var picked = null;
        for (var index = 0; index < this.children.length; index++) {
            if (this.children[index].visible) {
                var intersection = this.children[index].RayIntersection(ray);
                if (picked == null || (intersection && intersection.Compare(picked) < 0)) {
                    picked = intersection;
                }
            }
        }
        return picked;
    };
    CADGroup.prototype.Add = function (son) {
        if (son.owner) {
            son.owner.Remove(son);
        }
        son.owner = this;
        this.children.push(son);
    };
    CADGroup.prototype.Remove = function (son) {
        var position = -1;
        for (var index = 0; position < 0 && index < this.children.length; index++) {
            if (this.children[index] === son) {
                position = index;
            }
        }
        if (position >= 0) {
            son.owner = null;
            this.children.splice(position, 1);
        }
    };
    CADGroup.prototype.GetBoundingBox = function () {
        this.boundingbox = new BoundingBox();
        for (var index = 0; index < this.children.length; index++) {
            var bb = this.children[index].GetBoundingBox();
            if (bb.IsValid()) {
                this.boundingbox.Add(bb.min);
                this.boundingbox.Add(bb.max);
            }
        }
        return this.boundingbox;
    };
    CADGroup.prototype.Apply = function (proc) {
        if (!_super.prototype.Apply.call(this, proc)) {
            return false;
        }
        for (var index = 0; index < this.children.length; index++) {
            if (this.children[index].Apply(proc) === false) {
                return false;
            }
        }
        return true;
    };
    CADGroup.prototype.GetChildren = function () {
        if (!this.folded) {
            return this.children;
        }
        return [];
    };
    CADGroup.prototype.GetActions = function (dataHandler, onDone) {
        var self = this;
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        if (this.folded) {
            result.push(new SimpleAction('Unfold', function () {
                self.folded = false;
                return onDone(null);
            }));
        }
        else {
            result.push(new SimpleAction('Fold', function () {
                self.folded = true;
                return onDone(null);
            }));
        }
        return result;
    };
    CADGroup.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        var children = new NumberProperty('Children', this.children.length, null);
        children.SetReadonly();
        properties.Push(children);
        return properties;
    };
    return CADGroup;
}(CADNode));
