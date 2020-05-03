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
var SelectDrop = /** @class */ (function () {
    function SelectDrop(label, options, selected, hintMessage) {
        var self = this;
        this.button = new Button(label, function () {
            var selectOptions = [];
            for (var index = 0; index < options.length; index++) {
                if (options[index].label !== self.button.GetLabel()) {
                    selectOptions.push(new SelectOption(self, options[index]));
                }
            }
            Popup.CreatePopup(self.button, selectOptions);
        }, hintMessage);
        this.SetCurrent(options[selected].label);
    }
    SelectDrop.prototype.GetElement = function () {
        return this.button.GetElement();
    };
    SelectDrop.prototype.SetCurrent = function (current) {
        this.button.SetLabel(current);
    };
    return SelectDrop;
}());
var SelectOption = /** @class */ (function (_super) {
    __extends(SelectOption, _super);
    function SelectOption(select, innerAction) {
        var _this = _super.call(this, innerAction.label, innerAction.hintMessage) || this;
        _this.select = select;
        _this.innerAction = innerAction;
        return _this;
    }
    SelectOption.prototype.Run = function () {
        this.select.SetCurrent(this.label);
        this.innerAction.Run();
    };
    SelectOption.prototype.Enabled = function () {
        return this.innerAction.Enabled();
    };
    return SelectOption;
}(Action));
