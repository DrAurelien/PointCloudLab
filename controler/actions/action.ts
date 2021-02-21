interface ActionListener {
	OnTrigger(action: Action);
}

abstract class Action {
	private listeners: ActionListener[];

	constructor(private label: string, public hintMessage?: string) {
		this.listeners = [];
	}

	abstract Enabled(): boolean;

	Run() {
		this.Trigger();
		for (let index = 0; index < this.listeners.length; index++) {
			this.listeners[index].OnTrigger(this);
		}
	}

	protected abstract Trigger();

	static IsActionProvider(x: any): x is ActionsProvider {
		return x && x.GetActions && x.GetActions instanceof Function;
	}

	GetShortCut(): string {
		return null;
	}

	GetLabel(withShortcut: boolean = true): string {
		if (withShortcut) {
			let shortcut = this.GetShortCut();
			return (shortcut ? ('[' + shortcut + '] ') : '') + this.label;
		}
		return this.label;
	}

	AddListener(listener: ActionListener) {
		this.listeners.push(listener);
	}
}

interface ActionsProvider {
	GetActions(): Action[];
}

class SimpleAction extends Action {
	constructor(label: string, protected callback: Function = null, public hintMessage?: string) {
		super(label, hintMessage)
	}

	Enabled(): boolean {
		return this.callback !== null;
	}

	Trigger() {
		return this.callback();
	}
}

class ActivableAction extends Action {
	constructor(label: string, protected callback: Function, protected isactive: Function, public hintMessage?: string) {
		super(label, hintMessage)
	}

	Enabled(): boolean {
		return this.isactive();
	}

	Trigger() {
		return this.callback();
	}
}