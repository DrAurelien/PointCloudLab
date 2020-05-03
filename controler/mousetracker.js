var MouseTracker = /** @class */ (function () {
    function MouseTracker(event) {
        this.x = event.clientX;
        this.y = event.clientY;
        this.button = event.which;
        this.date = new Date();
    }
    MouseTracker.prototype.IsQuickEvent = function () {
        var now = new Date();
        return (now.getTime() - this.date.getTime() < MouseTracker.quickeventdelay);
    };
    MouseTracker.prototype.UpdatePosition = function (event) {
        var delta = new MouseDisplacement(event.clientX - this.x, event.clientY - this.y, this.button);
        this.x = event.clientX;
        this.y = event.clientY;
        return delta;
    };
    MouseTracker.quickeventdelay = 200;
    return MouseTracker;
}());
var MouseDisplacement = /** @class */ (function () {
    function MouseDisplacement(dx, dy, button) {
        this.dx = dx;
        this.dy = dy;
        this.button = button;
    }
    MouseDisplacement.prototype.IsNull = function () {
        return (this.dx == 0 && this.dy == 0);
    };
    return MouseDisplacement;
}());
