class Action {
	constructor(public label: string, protected callback: Function = null, public hintMessage?: string) {

	}

	HasAction(): boolean {
		return this.callback !== null;
	}

	Run() : Function {
		return this.callback();
	}
}