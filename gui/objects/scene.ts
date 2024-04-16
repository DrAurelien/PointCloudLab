/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="light.ts" />
/// <reference path="lightscontainer.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />


class Scene extends PCLGroup {
	backgroundColor: number[];

	constructor(initialize:boolean = true) {
		super("Scene");
		this.deletable = false;
		this.backgroundColor = [0.2, 0.2, 0.2];

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
	
	GetProperties(): Properties {
		let self = this;

		if(!this.properties)
		{
			let properties = super.GetProperties();
			properties.Push(new ColorProperty('Background', () => self.backgroundColor, (value) => self.backgroundColor = value));
		}
		return this.properties;
	}

	DrawNode(drawingContext: DrawingContext): void {
		let gl = drawingContext.gl;
		gl.clearColor(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], 1.);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		super.DrawNode(drawingContext);
	}

	SerializeNode(serializer: PCLSerializer) {
		let self = this;
		super.SerializeNode(serializer);
		serializer.PushParameter('background', (s) => {
			s.PushFloat32(self.backgroundColor[0]);
			s.PushFloat32(self.backgroundColor[1]);
			s.PushFloat32(self.backgroundColor[2]);
		});
	}
}

class SceneParsingHandler extends PCLGroupParsingHandler {
	backgroundColor: number[];

	constructor() {
		super();
	}

	ProcessNodeParam(paramname: string, parser: PCLParser): boolean {
		switch (paramname) {
			case 'background':
				this.backgroundColor = [
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				];
			return true;

		}
		return super.ProcessNodeParam(paramname, parser);
	}

	GetObject() {
		let scene = new Scene(false);
		if(this.backgroundColor)
			scene.backgroundColor = this.backgroundColor;
		return scene;
	}
}
