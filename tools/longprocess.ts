abstract class Process {
	private next: Process | Function;

	Start(caller : Process = null) {
		var self = this;
		this.Initialize(caller);
		this.Run(() => {
			self.Finalize();
			self.InvokeNext();
		});
	}

	SetNext(next: Process | Function): Process {
		this.next = next;
		if (next instanceof Process)
			return next;
		return this;
	}

	private InvokeNext() {
		if (this.next) {
			if (this.next instanceof Process) {
				(<Process>this.next).Start(this);
			}
			else {
				(<Function>this.next)(this);
			}
		}
	}

	protected Initialize(caller: Process) { }
	protected Finalize() { }
	protected abstract Run(ondone: Function);
}

abstract class LongProcess extends Process
{
	constructor(private message: string) {
		super();
	}

	protected abstract Step();
	protected abstract get Current(): number;
	protected abstract get Target(): number;

	public get Done(): boolean {
		return this.Target <= this.Current;
	}

	protected Run(ondone: Function) {
		let progress = null;
		if (this.message) {
			progress = new ProgressBar();
			progress.SetMessage(this.message);
			progress.Show();
		}

		let self = this;
		function RunInternal(): boolean {
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
	}
}

abstract class IterativeLongProcess extends LongProcess {
	protected currentstep = 0;
	constructor(protected nbsteps: number, message: string) {
		super(message);
	}

	protected Step() {
		this.Iterate(this.currentstep);
		this.currentstep++;
	}

	protected get Current(): number {
		return this.currentstep;
	}

	protected get Target(): number {
		return this.nbsteps;
	}

	protected abstract Iterate(step: number);
}