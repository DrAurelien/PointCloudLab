enum ProcessExecutionStatus {
	notstarted,
	started,
	terminated
}

abstract class Process {
	private next: Process;
	private status: ProcessExecutionStatus;

	constructor() {
		this.status = ProcessExecutionStatus.notstarted;
	}

	Start(caller: Process = null) {
		var self = this;
		this.status = ProcessExecutionStatus.started;
		this.Initialize(caller);
		this.Run(() => {
			self.Finalize();
			self.status = ProcessExecutionStatus.terminated;
			self.InvokeNext();
		});
	}

	SetNext(next: Process | Function): Process {
		if (this.next) {
			return this.next.SetNext(next);
		}
		else {
			this.next = next instanceof Process ? next : new SimpleProcess(next);
			if (this.status == ProcessExecutionStatus.terminated) {
				this.InvokeNext();
			}
			return this.next;
		}
	}

	private InvokeNext() {
		if (this.next) {
			this.next.Start(this);
		}
	}

	protected Initialize(caller: Process) { }
	protected Finalize() { }
	protected abstract Run(ondone: Function);
}

//================================================
// Simple synchroneous function execution
//================================================
class SimpleProcess extends Process {
	caller: Process;

	constructor(private callback) {
		super();
	}

	Initialize(caller: Process) {
		this.caller = caller;
	}

	Run(ondone) {
		this.callback(this.caller);
		ondone();
	}
}

//================================================
// Process taking significant time
// At least, enough time to let the user know he/she has to wait
//================================================
interface Stopable {
	Stopable(): boolean;
	Stop();
}

interface ProgressHandler {
	Initialize(message: string, stopable: Stopable);
	Update(current: number, target: number);
	Finalize();
	RefreshDelay(): number;
}

interface ProgessFactory {
	(): ProgressHandler;
}

abstract class LongProcess extends Process implements Stopable {
	stoped: boolean;

	constructor(private message: string, private onstoped: Function=null) {
		super();
	}

	protected abstract Step();
	protected abstract get Current(): number;
	protected abstract get Target(): number;

	static progresFactory: ProgessFactory = null;;

	public get Done(): boolean {
		return this.Target <= this.Current;
	}

	protected Run(ondone: Function) {
		this.stoped = false;

		let progress: ProgressHandler = null;
		if (this.message && LongProcess.progresFactory) {
			progress = LongProcess.progresFactory();
			progress.Initialize(this.message, this);
		}

		let self = this;
		function RunInternal(): boolean {
			while (!self.Done && !self.stoped) {
				self.Step();
				if (progress && progress.Update(self.Current, self.Target)) {
					setTimeout(RunInternal, progress.RefreshDelay());
					return false;
				}
			}

			if (progress) {
				progress.Finalize();
			}

			if (this.stoped) {
				if (this.onstoped) {
					this.onstoped();
				}
			}
			else {
				if (ondone) {
					ondone();
				}
			}
			return true;
		}

		if (progress) {
			setTimeout(RunInternal, progress.RefreshDelay());
		}
		else {
			RunInternal();
		}
	}

	Stopable(): boolean {
		return !!this.onstoped;
	}

	Stop() {
		this.stoped = true;
	}
}

//================================================
// Long process, where the total number of steps is defined right from the start
//================================================
abstract class IterativeLongProcess extends LongProcess {
	protected currentstep: number;
	constructor(protected nbsteps: number, message: string, onstoped: Function = null) {
		super(message, onstoped);
		this.currentstep = 0;
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