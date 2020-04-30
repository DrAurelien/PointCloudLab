var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HandlePosition;
(function (HandlePosition) {
    HandlePosition[HandlePosition["None"] = 0] = "None";
    HandlePosition[HandlePosition["Left"] = 1] = "Left";
    HandlePosition[HandlePosition["Top"] = 2] = "Top";
    HandlePosition[HandlePosition["Right"] = 3] = "Right";
    HandlePosition[HandlePosition["Bottom"] = 4] = "Bottom";
})(HandlePosition || (HandlePosition = {}));
;
var Handle = (function () {
    function Handle(owner, position) {
        this.owner = owner;
        this.position = position;
        var self = this;
        this.handle = document.createElement('div');
        this.handle.className = 'HideablePannelHandle ' + position;
        this.handle.onclick = function (event) {
            if (!self.owner.pinned)
                self.owner.SwitchVisibility();
        };
        switch (position) {
            case HandlePosition.Left:
                this.handle.style.left = this.handle.style.top = '0';
                break;
            case HandlePosition.Right:
                this.handle.style.right = this.handle.style.top = '0';
                break;
            case HandlePosition.Top:
                this.handle.style.left = this.handle.style.top = '0';
                break;
            case HandlePosition.Bottom:
                this.handle.style.left = this.handle.style.bottom = '0';
                break;
            default: break;
        }
        this.UpdateCursor();
    }
    Handle.prototype.GetElement = function () {
        return this.handle;
    };
    Handle.prototype.RefreshSize = function (neighbour, width, height) {
        switch (this.position) {
            case HandlePosition.Left:
            case HandlePosition.Right:
                this.handle.style.height = this.owner.GetElement().style.height;
                neighbour.style.width = (width - this.handle.clientWidth) + 'px';
                break;
            case HandlePosition.Top:
            case HandlePosition.Bottom:
                this.handle.style.width = this.owner.GetElement().style.width;
                neighbour.style.height = (height - this.handle.clientHeight) + 'px';
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
var HideablePannel = (function (_super) {
    __extends(HideablePannel, _super);
    function HideablePannel(classname, handlePosition) {
        if (classname === void 0) { classname = ""; }
        if (handlePosition === void 0) { handlePosition = HandlePosition.None; }
        _super.call(this, classname);
        this.container = new Pannel('HideablePannelContainer');
        _super.prototype.AddControl.call(this, this.container);
        if (handlePosition !== HandlePosition.None) {
            this.handle = new Handle(this, handlePosition);
            _super.prototype.AddControl.call(this, this.handle);
        }
        this.originalWidth = null;
        this.originalHeight = null;
        this.visible = true;
        this.originalvisibility = true;
        this.pinned = false;
    }
    HideablePannel.prototype.AddControl = function (control) {
        this.container.AddControl(control);
    };
    HideablePannel.prototype.Show = function () {
        if (!this.visible) {
            var pannel = this.GetElement();
            if (this.originalWidth !== null) {
                pannel.style.width = this.originalWidth;
            }
            if (this.originalHeight !== null) {
                pannel.style.width = this.originalHeight;
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
                    this.originalWidth = pannel.clientWidth + 'px';
                    pannel.style.width = handle.clientWidth + 'px';
                    break;
                case HandlePosition.Top:
                case HandlePosition.Bottom:
                    this.originalHeight = pannel.clientHeight + 'px';
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
        if (this.handle) {
            this.handle.RefreshSize(this.container.GetElement(), this.pannel.clientWidth, this.pannel.clientHeight);
        }
    };
    return HideablePannel;
}(Pannel));
//# sourceMappingURL=hideablepannel.js.map