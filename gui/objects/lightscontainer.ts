/// <reference path="pclgroup.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../datahandler.ts" />


class LightsContainer extends PCLGroup {
    constructor(name?: string, owner: PCLGroup = null) {
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
	constructor(private container: LightsContainer, private onDone: CADNodeHandler) {
		super('New light', 'Add up to ' + DrawingContext.NbMaxLights + ' light sources');
	}

	Run() {
		this.onDone(new Light(new Vector([100.0, 100.0, 100.0]), this.container));
	}

	Enabled(): boolean {
		return this.container.children.length < DrawingContext.NbMaxLights;
	}
}