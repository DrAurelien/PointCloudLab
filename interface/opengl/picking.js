var Picking = /** @class */ (function () {
    function Picking(object) {
        this.object = object;
        this.distance = null;
    }
    Picking.prototype.HasIntersection = function () {
        return this.distance !== null;
    };
    Picking.prototype.Add = function (distance) {
        if (this.distance === null || this.distance > distance) {
            this.distance = distance;
        }
    };
    Picking.prototype.Compare = function (picking) {
        if (this.HasIntersection() && picking.HasIntersection()) {
            if (this.distance < picking.distance) {
                return -1;
            }
            else if (this.distance > picking.distance) {
                return 1;
            }
            return 0;
        }
        else if (this.HasIntersection()) {
            return -1;
        }
        else if (picking.HasIntersection()) {
            return 1;
        }
        return 0;
    };
    return Picking;
}());
