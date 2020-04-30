class LongProcess{
	static Run(message: string, iteration: Function, ondone?: Function) {
		let progress = null;
		if (message) {
			progress = new ProgressBar();
			progress.SetMessage(message);
			progress.Show();
		}

		function RunInternal() : boolean {
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
	}
}