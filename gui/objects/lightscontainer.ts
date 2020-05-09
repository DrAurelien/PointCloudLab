/// <reference path="pclgroup.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../../maths/vector.ts" />


class LightsContainer extends PCLGroup {
	constructor(name?: string, owner: PCLGroup = null) {
		super(name || NameProvider.GetName('Lights'), owner);
	}

	GetActions(delegate: ActionDelegate, onDone: PCLNodeHandler): Action[] {
		let result: Action[] = super.GetActions(delegate, onDone);

		result.push(null);
		result.push(new NewLightAction(this, onDone));

		return result;
	}
}

class NewLightAction extends Action {
	constructor(private container: LightsContainer, private onDone: PCLNodeHandler) {
		super('New light', 'Add up to ' + DrawingContext.NbMaxLights + ' light sources');
	}

	Run() {
		this.onDone(new Light(new Vector([100.0, 100.0, 100.0]), this.container));
	}

	Enabled(): boolean {
		return this.container.children.length < DrawingContext.NbMaxLights;
	}
}