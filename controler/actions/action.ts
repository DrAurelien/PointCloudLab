﻿abstract class Action {
	constructor(public label: string, public hintMessage?: string) {

	}

	abstract Enabled(): boolean;

	abstract Run();
}

class SimpleAction extends Action {
	constructor(public label: string, protected callback: Function = null, public hintMessage?: string) {
		super(label, hintMessage)
	}

	Enabled(): boolean {
		return this.callback !== null;
	}

	Run(): Function {
		return this.callback();
	}
}