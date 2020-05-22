/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="light.ts" />
/// <reference path="lightscontainer.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />


class Scene extends PCLGroup {
	constructor(initialize:boolean = true) {
		super("Scene");
		this.deletable = false;

		if (initialize) {
			this.children = [null, null];

			this.Contents = new PCLGroup("Objects");
			this.Contents.deletable = false;

			this.Lights = new LightsContainer("Lights");
			this.Lights.deletable = false;
			this.Lights.visible = false;
			this.Lights.folded = true;

			let defaultLight = new Light(new Vector([10.0, 10.0, 10.0]));
			this.Lights.Add(defaultLight);
			defaultLight.deletable = false;
		}
	}

	get Contents(): PCLGroup {
		return <PCLGroup>this.children[1];
	}
	set Contents(c: PCLGroup) {
		this.children[1] = c;
		c.owner = this;
	}

	get Lights(): LightsContainer {
		return <LightsContainer>this.children[0];
	}
	set Lights(l: LightsContainer) {
		this.children[0] = l;
		l.owner = this;
	}

	GetDisplayIcon(): string {
		return 'fa-desktop';
	}

	static SerializationID = 'SCENE';
	GetSerializationID(): string {
		return Scene.SerializationID;
	}

	GetParsingHandler(): PCLObjectParsingHandler {
		return new SceneParsingHandler();
	}
}

class SceneParsingHandler extends PCLGroupParsingHandler {
	constructor() {
		super();
	}

	GetObject() {
		return new Scene(false);
	}
}
