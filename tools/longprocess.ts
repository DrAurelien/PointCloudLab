abstract class Process {
	private next: Process | Function;

	Start(caller: Process = null) {
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

//================================================
// Process taking significant time
// At least, enough time to let the user know he/she has to wait
//================================================
interface ProgessHandler {
	Initialize(message: string);
	Update(current: number, target: number);
	Finalize();
	RefreshDelay(): number;
}

interface ProgessFactory {
	(): ProgessHandler;
}

abstract class LongProcess extends Process {
	constructor(private message: string) {
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
		let progress: ProgessHandler = null;
		if (this.message && LongProcess.progresFactory) {
			progress = LongProcess.progresFactory();
			progress.Initialize(this.message);
		}

		let self = this;
		function RunInternal(): boolean {
			while (!self.Done) {
				self.Step();
				if (progress && progress.Update(self.Current, self.Target)) {
					setTimeout(RunInternal, progress.RefreshDelay());
					return false;
				}
			}

			if (progress) {
				progress.Finalize();
			}
			if (ondone) {
				ondone();
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
}

//================================================
// Long process, where the total number of steps is defined right from the start
//================================================
abstract class IterativeLongProcess extends LongProcess {
	private currentstep: number;
	constructor(protected nbsteps: number, message: string) {
		super(message);
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