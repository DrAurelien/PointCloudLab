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
var RegionGrowthStatus;
(function (RegionGrowthStatus) {
    RegionGrowthStatus[RegionGrowthStatus["unprocessed"] = 0] = "unprocessed";
    RegionGrowthStatus[RegionGrowthStatus["enqueued"] = 1] = "enqueued";
    RegionGrowthStatus[RegionGrowthStatus["processed"] = 2] = "processed";
})(RegionGrowthStatus || (RegionGrowthStatus = {}));
var RegionGrowthIterator = /** @class */ (function () {
    function RegionGrowthIterator(cloud, k) {
        this.cloud = cloud;
        this.k = k;
        this.status = new Array(this.Size());
        this.queue = new Queue();
    }
    RegionGrowthIterator.prototype.Reset = function () {
        var size = this.Size();
        for (var index = 0; index < size; index++) {
            this.status[index] = RegionGrowthStatus.unprocessed;
        }
        this.lastUnprocessed = 0;
        this.currentIndex = null;
        this.currentRegion = null;
        this.currentNeighborhood = null;
        this.regionIndex = 0;
        this.Enqueue(this.lastUnprocessed);
    };
    RegionGrowthIterator.prototype.Size = function () {
        return this.cloud.Size();
    };
    RegionGrowthIterator.prototype.End = function () {
        return this.lastUnprocessed >= this.Size();
    };
    RegionGrowthIterator.prototype.LoadAndSpread = function () {
        this.currentRegion = this.regionIndex;
        this.currentIndex = this.queue.Dequeue();
        this.status[this.currentIndex] = RegionGrowthStatus.processed;
        //Enqueue current point neighbourhood
        this.currentNeighborhood = this.cloud.KNearestNeighbours(this.cloud.GetPoint(this.currentIndex), this.k);
        for (var ii = 0; ii < this.currentNeighborhood.length; ii++) {
            var nbhindex = this.currentNeighborhood[ii].index;
            if (this.status[nbhindex] == RegionGrowthStatus.unprocessed)
                this.Enqueue(nbhindex);
        }
        //If the queue is empty, enqueue the next point that has not been processed yet
        if (this.queue.Empty()) {
            this.regionIndex++;
            while (!this.End() && this.status[this.lastUnprocessed] !== RegionGrowthStatus.unprocessed)
                this.lastUnprocessed++;
            if (!this.End())
                this.Enqueue(this.lastUnprocessed);
        }
    };
    RegionGrowthIterator.prototype.Enqueue = function (index) {
        this.queue.Enqueue(index);
        this.status[index] = RegionGrowthStatus.enqueued;
    };
    return RegionGrowthIterator;
}());
var RegionGrowthProcess = /** @class */ (function (_super) {
    __extends(RegionGrowthProcess, _super);
    function RegionGrowthProcess(cloud, k, message) {
        var _this = _super.call(this, cloud.Size(), message) || this;
        _this.cloud = cloud;
        _this.iterator = new RegionGrowthIterator(cloud, k);
        return _this;
    }
    RegionGrowthProcess.prototype.Initialize = function () {
        this.iterator.Reset();
    };
    Object.defineProperty(RegionGrowthProcess.prototype, "Done", {
        get: function () {
            return this.iterator.End();
        },
        enumerable: true,
        configurable: true
    });
    RegionGrowthProcess.prototype.Iterate = function () {
        this.iterator.LoadAndSpread();
        this.ProcessPoint(this.cloud, this.iterator.currentIndex, this.iterator.currentNeighborhood, this.iterator.currentRegion);
    };
    RegionGrowthProcess.prototype.Status = function (index) {
        return this.iterator.status[index];
    };
    return RegionGrowthProcess;
}(IterativeLongProcess));
//# sourceMappingURL=regiongrowth.js.map