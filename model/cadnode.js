var CADNode = /** @class */ (function () {
    function CADNode(name, owner) {
        if (owner === void 0) { owner = null; }
        this.name = name;
        this.visible = true;
        this.selected = false;
        this.deletable = true;
        this.boundingbox = null;
        this.owner = null;
        if (owner) {
            owner.Add(this);
        }
    }
    CADNode.prototype.GetBoundingBox = function () {
        return this.boundingbox;
    };
    CADNode.prototype.GetProperties = function () {
        var self = this;
        var properties = new Properties();
        properties.Push(new StringProperty('Name', this.name, function (newName) { return self.name = newName; }));
        properties.Push(new BooleanProperty('Visible', this.visible, function (newVilibility) { return self.visible = newVilibility; }));
        return properties;
    };
    CADNode.prototype.GetActions = function (dataHandler, onDone) {
        var self = this;
        var result = [];
        if (this.deletable) {
            result.push(new SimpleAction('Remove', function () { self.owner.Remove(self); return onDone(null); }));
        }
        if (this.visible) {
            result.push(new SimpleAction('Hide', function () { self.visible = false; return onDone(null); }));
        }
        else {
            result.push(new SimpleAction('Show', function () { self.visible = true; return onDone(null); }));
        }
        return result;
    };
    CADNode.prototype.GetChildren = function () {
        return [];
    };
    CADNode.prototype.Apply = function (proc) {
        return proc(this);
    };
    return CADNode;
}());
//# sourceMappingURL=cadnode.js.map