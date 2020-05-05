var Ray = /** @class */ (function () {
    function Ray(from, dir) {
        this.from = from;
        this.dir = dir;
    }
    Ray.prototype.GetPoint = function (distance) {
        return this.from.Plus(this.dir.Times(distance));
    };
    return Ray;
}());
//# sourceMappingURL=ray.js.map