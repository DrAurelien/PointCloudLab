var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Neighbourhood = (function () {
    function Neighbourhood() {
    }
    Neighbourhood.prototype.Initialize = function (cloud, queryPoint) {
        this.cloud = cloud;
        this.queryPoint = queryPoint;
        this.neighbours = [];
    };
    Neighbourhood.prototype.GetPointData = function (pointIndex) {
        var distance = this.queryPoint.Minus(this.cloud.GetPoint(pointIndex)).SqrNorm();
        return new Neighbour(distance, pointIndex);
    };
    Neighbourhood.prototype.Accept = function (distance) {
        var sqrdist = distance * distance;
        var maxdist = this.GetSqrDistance();
        if (maxdist === null || sqrdist <= maxdist) {
            return true;
        }
        return false;
    };
    Neighbourhood.prototype.Neighbours = function () {
        return this.neighbours;
    };
    return Neighbourhood;
}());
//==================================
// Neighbor
//==================================
var Neighbour = (function () {
    function Neighbour(distance, index) {
        this.distance = distance;
        this.index = index;
    }
    return Neighbour;
}());
//==================================
// K-Nearest Neighbours
//==================================
var KNearestNeighbours = (function (_super) {
    __extends(KNearestNeighbours, _super);
    function KNearestNeighbours(k) {
        _super.call(this);
        this.k = k;
        k = k;
    }
    KNearestNeighbours.prototype.Push = function (index) {
        var data = this.GetPointData(index);
        var cursor = this.neighbours.length;
        if (this.neighbours.length < this.k) {
            this.neighbours.push(data);
        }
        //Locate the cursor to the data whose distance is smaller than the current data distance
        while (cursor > 0 && data.distance < this.neighbours[cursor - 1].distance) {
            if (cursor < this.k) {
                this.neighbours[cursor] = this.neighbours[cursor - 1];
            }
            cursor--;
        }
        //Add the data so that neighbors list remains sorted
        if (cursor < this.k) {
            this.neighbours[cursor] = data;
        }
        return false;
    };
    KNearestNeighbours.prototype.GetSqrDistance = function () {
        if (this.neighbours.length < this.k) {
            return null;
        }
        return this.neighbours[this.neighbours.length - 1].distance;
    };
    return KNearestNeighbours;
}(Neighbourhood));
//# sourceMappingURL=neighbourhood.js.map