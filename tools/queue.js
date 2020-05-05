var QueueCell = /** @class */ (function () {
    function QueueCell(data) {
        this.data = data;
    }
    return QueueCell;
}());
var Queue = /** @class */ (function () {
    function Queue() {
        this.head = null;
        this.tail = null;
    }
    Queue.prototype.Dequeue = function () {
        var result = this.head.data;
        this.head = this.head.next;
        if (!this.head)
            this.tail = null;
        return result;
    };
    Queue.prototype.Enqueue = function (data) {
        var cell = new QueueCell(data);
        if (this.tail)
            this.tail.next = cell;
        else
            this.head = cell;
        this.tail = cell;
    };
    Queue.prototype.Empty = function () {
        return !this.head;
    };
    Queue.prototype.Clear = function () {
        this.head = null;
        this.tail = null;
    };
    return Queue;
}());
//# sourceMappingURL=queue.js.map