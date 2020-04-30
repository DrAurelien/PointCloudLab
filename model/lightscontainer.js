var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LightsContainer = (function (_super) {
    __extends(LightsContainer, _super);
    function LightsContainer(name, owner) {
        if (owner === void 0) { owner = null; }
        _super.call(this, name || NameProvider.GetName('Lights'), owner);
    }
    LightsContainer.prototype.GetActions = function (dataHandler, onDone) {
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        result.push(new NewLightAction(this, onDone));
        return result;
    };
    return LightsContainer;
}(CADGroup));
var NewLightAction = (function (_super) {
    __extends(NewLightAction, _super);
    function NewLightAction(container, onDone) {
        _super.call(this, 'New light', function () { onDone(new Light(new Vector([100.0, 100.0, 100.0]), container)); }, 'Add up to ' + DrawingContext.NbMaxLights + ' light sources');
        this.container = container;
    }
    NewLightAction.prototype.HasAction = function () {
        return this.container.children.length < DrawingContext.NbMaxLights;
    };
    return NewLightAction;
}(Action));
//# sourceMappingURL=lightscontainer.js.map