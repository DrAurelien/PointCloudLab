var Action = (function () {
    function Action(label, callback, hintMessage) {
        if (callback === void 0) { callback = null; }
        this.label = label;
        this.callback = callback;
        this.hintMessage = hintMessage;
    }
    Action.prototype.HasAction = function () {
        return this.callback !== null;
    };
    Action.prototype.Run = function () {
        return this.callback();
    };
    return Action;
}());
//# sourceMappingURL=actions.js.map