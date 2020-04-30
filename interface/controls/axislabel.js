var AxisLabel = (function () {
    function AxisLabel(label, axis, system) {
        this.label = label;
        this.axis = axis;
        this.system = system;
        var color = axis.Normalized().Times(160).Flatten();
        this.container = document.createElement('div');
        this.container.className = 'AxisLabel';
        this.container.style.color = 'rgb(' + color.join(',') + ')';
        this.container.appendChild(document.createTextNode(label));
        this.container.onclick = function (event) {
            system.ChangeViewAxis(axis);
        };
    }
    AxisLabel.prototype.GetElement = function () {
        return this.container;
    };
    AxisLabel.prototype.Refresh = function () {
        var camera = this.system.renderer.camera;
        var projection = camera.ComputeProjection(this.axis, true);
        var ownerRect = this.system.GetElement().getBoundingClientRect();
        this.container.style.left = (ownerRect.left + projection.Get(0)) + 'px';
        this.container.style.top = (ownerRect.bottom - projection.Get(1)) + 'px';
        this.depth = projection.Get(2);
    };
    AxisLabel.prototype.UpdateDepth = function (axes) {
        var order = 0;
        for (var index = 0; index < axes.length; index++) {
            if (this.depth < axes[index].depth) {
                order++;
            }
        }
        this.container.style.zIndex = '' + (2 + order);
    };
    return AxisLabel;
}());
//# sourceMappingURL=axislabel.js.map