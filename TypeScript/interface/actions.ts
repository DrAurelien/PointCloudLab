class Action {
	constructor(public label: string, protected callback: Function = null, public icon?: string) {
	}

	HasAction(): boolean {
		return this.callback !== null;
	}

	Run() : Function {
		return this.callback();
	}
}