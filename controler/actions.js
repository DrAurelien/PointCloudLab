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
var Action = /** @class */ (function () {
    function Action(label, hintMessage) {
        this.label = label;
        this.hintMessage = hintMessage;
    }
    return Action;
}());
var SimpleAction = /** @class */ (function (_super) {
    __extends(SimpleAction, _super);
    function SimpleAction(label, callback, hintMessage) {
        if (callback === void 0) { callback = null; }
        var _this = _super.call(this, label, hintMessage) || this;
        _this.label = label;
        _this.callback = callback;
        _this.hintMessage = hintMessage;
        return _this;
    }
    SimpleAction.prototype.Enabled = function () {
        return this.callback !== null;
    };
    SimpleAction.prototype.Run = function () {
        return this.callback();
    };
    return SimpleAction;
}(Action));
//# sourceMappingURL=actions.js.map