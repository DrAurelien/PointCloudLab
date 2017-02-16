class Action {
	constructor(public label: string, protected callback: Function = () => { }) {
	}

	Run() : Function {
		return this.callback();
	}
}