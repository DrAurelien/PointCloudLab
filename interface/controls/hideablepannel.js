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
var HandlePosition;
(function (HandlePosition) {
    HandlePosition[HandlePosition["None"] = 0] = "None";
    HandlePosition[HandlePosition["Left"] = 1] = "Left";
    HandlePosition[HandlePosition["Top"] = 2] = "Top";
    HandlePosition[HandlePosition["Right"] = 3] = "Right";
    HandlePosition[HandlePosition["Bottom"] = 4] = "Bottom";
})(HandlePosition || (HandlePosition = {}));
;
var Handle = /** @class */ (function () {
    function Handle(owner, position) {
        this.owner = owner;
        this.position = position;
        var self = this;
        this.handle = document.createElement('div');
        this.handle.className = 'HideablePannelHandle';
        this.handle.setAttribute("Position", HandlePosition[position]);
        this.handle.onclick = function (event) {
            if (!self.owner.pinned)
                self.owner.SwitchVisibility();
        };
        this.UpdateCursor();
    }
    Handle.prototype.GetElement = function () {
        return this.handle;
    };
    Handle.prototype.RefreshSize = function () {
        switch (this.position) {
            case HandlePosition.Left:
            case HandlePosition.Right:
                this.handle.style.height = this.owner.GetElement().clientHeight + 'px';
                break;
            case HandlePosition.Top:
            case HandlePosition.Bottom:
                this.handle.style.width = this.owner.GetElement().clientWidth + 'px';
            default:
                break;
        }
    };
    Handle.prototype.UpdateCursor = function () {
        var orientation = '';
        var visible = this.owner.visible;
        switch (this.position) {
            case HandlePosition.Left:
                orientation = visible ? 'e' : 'w';
                break;
            case HandlePosition.Right:
                orientation = visible ? 'w' : 'e';
                break;
            case HandlePosition.Top:
                orientation = visible ? 's' : 'n';
                break;
            case HandlePosition.Bottom:
                orientation = visible ? 'n' : 's';
                break;
            default: break;
        }
        this.handle.style.cursor = orientation + '-resize';
    };
    return Handle;
}());
var HideablePannel = /** @class */ (function (_super) {
    __extends(HideablePannel, _super);
    function HideablePannel(classname, handlePosition) {
        if (classname === void 0) { classname = ""; }
        if (handlePosition === void 0) { handlePosition = HandlePosition.None; }
        var _this = _super.call(this, classname) || this;
        _this.container = new Pannel('HideablePannelContainer');
        _super.prototype.AddControl.call(_this, _this.container);
        if (handlePosition !== HandlePosition.None) {
            _this.handle = new Handle(_this, handlePosition);
            _super.prototype.AddControl.call(_this, _this.handle);
        }
        _this.originalWidth = null;
        _this.originalHeight = null;
        _this.visible = true;
        _this.originalvisibility = true;
        _this.pinned = false;
        return _this;
    }
    HideablePannel.prototype.AddControl = function (control) {
        this.container.AddControl(control);
    };
    HideablePannel.prototype.Show = function () {
        if (!this.visible) {
            var pannel = this.GetElement();
            if (this.originalWidth !== null) {
                pannel.style.width = this.originalWidth + 'px';
            }
            if (this.originalHeight !== null) {
                pannel.style.height = this.originalHeight + 'px';
            }
            this.visible = true;
            this.originalvisibility = true;
            this.RefreshSize();
            if (this.handle) {
                this.handle.UpdateCursor();
            }
        }
    };
    HideablePannel.prototype.Hide = function () {
        if (this.visible) {
            var pannel = this.GetElement();
            var handle = this.handle.GetElement();
            switch (this.handle.position) {
                case HandlePosition.Left:
                case HandlePosition.Right:
                    this.originalWidth = pannel.clientWidth;
                    pannel.style.width = handle.clientWidth + 'px';
                    break;
                case HandlePosition.Top:
                case HandlePosition.Bottom:
                    this.originalHeight = pannel.clientHeight;
                    pannel.style.height = handle.clientHeight + 'px';
                    break;
                default: break;
            }
            this.visible = false;
            this.originalvisibility = false;
            if (this.handle) {
                this.handle.UpdateCursor();
            }
        }
    };
    HideablePannel.prototype.TemporaryHide = function () {
        var visbilityToRestore = this.visible;
        this.Hide();
        this.originalvisibility = visbilityToRestore;
    };
    HideablePannel.prototype.RestoreVisibility = function () {
        if (this.originalvisibility) {
            this.Show();
        }
        else {
            this.Hide();
        }
    };
    HideablePannel.prototype.SwitchVisibility = function () {
        if (this.visible) {
            this.Hide();
        }
        else {
            this.Show();
        }
    };
    HideablePannel.prototype.RefreshSize = function () {
        switch (this.handle.position) {
            case HandlePosition.Left:
            case HandlePosition.Right:
                this.GetElement().style.width = this.container.GetElement().clientWidth +
                    this.handle.GetElement().clientWidth + 'px';
                break;
            case HandlePosition.Top:
            case HandlePosition.Bottom:
                this.GetElement().style.height = this.container.GetElement().clientHeight +
                    this.handle.GetElement().clientHeight + 'px';
                break;
            default: break;
        }
        if (this.handle) {
            this.handle.RefreshSize();
        }
    };
    return HideablePannel;
}(Pannel));
