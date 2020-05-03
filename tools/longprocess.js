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
var Process = /** @class */ (function () {
    function Process() {
    }
    Process.prototype.Start = function (caller) {
        if (caller === void 0) { caller = null; }
        var self = this;
        this.Initialize(caller);
        this.Run(function () {
            self.Finalize();
            self.InvokeNext();
        });
    };
    Process.prototype.SetNext = function (next) {
        this.next = next;
        if (next instanceof Process)
            return next;
        return this;
    };
    Process.prototype.InvokeNext = function () {
        if (this.next) {
            if (this.next instanceof Process) {
                this.next.Start(this);
            }
            else {
                this.next(this);
            }
        }
    };
    Process.prototype.Initialize = function (caller) { };
    Process.prototype.Finalize = function () { };
    return Process;
}());
var LongProcess = /** @class */ (function (_super) {
    __extends(LongProcess, _super);
    function LongProcess(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    Object.defineProperty(LongProcess.prototype, "Done", {
        get: function () {
            return this.Target <= this.Current;
        },
        enumerable: true,
        configurable: true
    });
    LongProcess.prototype.Run = function (ondone) {
        var progress = null;
        if (this.message) {
            progress = new ProgressBar();
            progress.SetMessage(this.message);
            progress.Show();
        }
        var self = this;
        function RunInternal() {
            while (!self.Done) {
                self.Step();
                if (progress && progress.Update(self.Current, self.Target)) {
                    setTimeout(RunInternal, progress.refreshtime);
                    return false;
                }
            }
            if (progress) {
                progress.Delete();
            }
            if (ondone) {
                ondone();
            }
            return true;
        }
        if (progress) {
            setTimeout(RunInternal, progress.refreshtime);
        }
        else {
            RunInternal();
        }
    };
    return LongProcess;
}(Process));
var IterativeLongProcess = /** @class */ (function (_super) {
    __extends(IterativeLongProcess, _super);
    function IterativeLongProcess(nbsteps, message) {
        var _this = _super.call(this, message) || this;
        _this.nbsteps = nbsteps;
        _this.currentstep = 0;
        return _this;
    }
    IterativeLongProcess.prototype.Step = function () {
        this.Iterate(this.currentstep);
        this.currentstep++;
    };
    Object.defineProperty(IterativeLongProcess.prototype, "Current", {
        get: function () {
            return this.currentstep;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IterativeLongProcess.prototype, "Target", {
        get: function () {
            return this.nbsteps;
        },
        enumerable: true,
        configurable: true
    });
    return IterativeLongProcess;
}(LongProcess));
