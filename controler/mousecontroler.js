var MouseControler = /** @class */ (function () {
    function MouseControler(view) {
        this.view = view;
        this.targetElement = view.sceneRenderer.GetElement();
        this.cursor = new Cursor();
        var self = this;
        this.targetElement.oncontextmenu = function (event) {
            event = event || window.event;
            event.preventDefault();
            return false;
        };
        this.targetElement.onmousedown = function (event) {
            event = (event || window.event);
            self.Start(event);
        };
        this.targetElement.onmouseup = function (event) {
            self.End();
        };
        this.targetElement.onmouseout = function (event) {
            self.End();
        };
        this.targetElement.onmousemove = function (event) {
            event = (event || window.event);
            if (self.mousetracker) {
                var delta = self.mousetracker.UpdatePosition(event);
                self.HandleMouseMove(delta);
                self.view.dataHandler.Hide();
            }
            return true;
        };
        this.targetElement.onwheel = function (event) {
            event = (event || window.event);
            self.HandleWheel(event.deltaY);
        };
        document.onkeypress = function (event) {
            event = (event || window.event);
            var key = event.key ? event.key.charCodeAt(0) : event.keyCode;
            self.HandleKey(key);
        };
    }
    MouseControler.prototype.Start = function (event) {
        this.mousetracker = new MouseTracker(event);
        this.view.TemporaryHideHideables();
        this.StartMouseEvent();
    };
    MouseControler.prototype.End = function () {
        if (this.mousetracker != null && this.mousetracker.IsQuickEvent()) {
            this.HandleClick(this.mousetracker);
        }
        this.mousetracker = null;
        this.view.RestoreHideables();
        this.cursor.Restore(this.targetElement);
        this.EndMouseEvent();
    };
    MouseControler.prototype.StartMouseEvent = function () {
    };
    MouseControler.prototype.EndMouseEvent = function () {
    };
    Object.defineProperty(MouseControler.prototype, "Cursor", {
        set: function (iconCode) {
            this.cursor.Icon = iconCode;
            this.cursor.Apply(this.targetElement);
        },
        enumerable: true,
        configurable: true
    });
    return MouseControler;
}());
