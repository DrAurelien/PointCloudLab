class LightsContainer extends CADGroup {
    constructor(name?: string, owner: CADGroup = null) {
        super(name || NameProvider.GetName('Lights'), owner);
    }

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let self = this;
		let result: Action[] = super.GetActions(dataHandler, onDone);

		//result.push(null);
		//result.push(new Action('New light', () => { let light = new Light(new Vector([100.0, 100.0, 100.0]), self); onDone(null); }));
		
		return result;
    }
}