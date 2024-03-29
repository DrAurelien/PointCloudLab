﻿/// <reference path="pclgroup.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../files/pclserializer.ts" />


class LightsContainer extends PCLGroup {
	constructor(name?: string) {
		super(name || NameProvider.GetName('Lights'), false);
	}

	GetActions(delegate: ActionDelegate): Action[] {
		let result: Action[] = super.GetActions(delegate);

		result.push(null);
		result.push(new NewLightAction(this));

		return result;
	}

	static SerializationID = 'LIGHTSSET';
	GetSerializationID(): string {
		return LightsContainer.SerializationID;
	}

	GetParsingHandler(): PCLObjectParsingHandler {
		return new LightsContainerParsingHandler();
	}
}

class LightsContainerParsingHandler extends PCLGroupParsingHandler {
	constructor() {
		super();
	}

	GetObject() {
		return new LightsContainer(this.name);
	}
}

class NewLightAction extends Action {
	constructor(private container: LightsContainer) {
		super('New light', 'Add up to ' + DrawingContext.NbMaxLights + ' light sources');
	}

	Trigger() {
		let light = new Light(new Vector([100.0, 100.0, 100.0]));
		this.container.Add(light);
	}

	Enabled(): boolean {
		return this.container.children.length < DrawingContext.NbMaxLights;
	}
}