var LongProcess = (function () {
    function LongProcess() {
    }
    LongProcess.Run = function (message, iteration, ondone) {
        var progress = null;
        if (message) {
            progress = new ProgressBar();
            progress.SetMessage(message);
            progress.Show();
        }
        function RunInternal() {
            var state;
            while ((state = iteration()) != null) {
                if (progress && progress.Update(state.current, state.total)) {
                    setTimeout(RunInternal, progress.refreshtime);
                    return false;
                }
            }
            if (ondone) {
                if (progress) {
                    setTimeout(ondone, progress.refreshtime);
                }
                else {
                    ondone();
                }
            }
            if (progress) {
                progress.Delete();
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
}());
//# sourceMappingURL=longprocess.js.map