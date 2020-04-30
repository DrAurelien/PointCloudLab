class LightsContainer extends CADGroup {
    constructor(name?: string, owner: CADGroup = null) {
        super(name || NameProvider.GetName('Lights'), owner);
    }

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let result: Action[] = super.GetActions(dataHandler, onDone);

		result.push(null);
		result.push(new NewLightAction(this, onDone));
		
		return result;
    }
}

class NewLightAction extends Action {
	constructor(private container: LightsContainer, onDone: CADNodeHandler) {
		super('New light', () => { onDone(new Light(new Vector([100.0, 100.0, 100.0]), container)); }, 'Add up to ' + DrawingContext.NbMaxLights + ' light sources');
	}

	HasAction(): boolean {
		return this.container.children.length < DrawingContext.NbMaxLights;
	}
}