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
var LightsContainer = /** @class */ (function (_super) {
    __extends(LightsContainer, _super);
    function LightsContainer(name, owner) {
        if (owner === void 0) { owner = null; }
        return _super.call(this, name || NameProvider.GetName('Lights'), owner) || this;
    }
    LightsContainer.prototype.GetActions = function (dataHandler, onDone) {
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        result.push(new NewLightAction(this, onDone));
        return result;
    };
    return LightsContainer;
}(CADGroup));
var NewLightAction = /** @class */ (function (_super) {
    __extends(NewLightAction, _super);
    function NewLightAction(container, onDone) {
        var _this = _super.call(this, 'New light', 'Add up to ' + DrawingContext.NbMaxLights + ' light sources') || this;
        _this.container = container;
        _this.onDone = onDone;
        return _this;
    }
    NewLightAction.prototype.Run = function () {
        this.onDone(new Light(new Vector([100.0, 100.0, 100.0]), this.container));
    };
    NewLightAction.prototype.Enabled = function () {
        return this.container.children.length < DrawingContext.NbMaxLights;
    };
    return NewLightAction;
}(Action));
//# sourceMappingURL=lightscontainer.js.map