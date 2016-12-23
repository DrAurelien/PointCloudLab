class Action {
	constructor(public label: string, private callback: Function) {
	}

	Run() {
		return this.callback();
	}
}