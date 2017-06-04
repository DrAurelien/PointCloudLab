class CoordinatesSystem implements Control {
	renderer: Renderer;
	showAxesLabels: boolean;
	private system: Scene;
	private axesLabels: AxisLabel[];

	constructor(private mainRenderer: Renderer) {
		//Create the coordinates axes to be rendered
		let axes: Cylinder[] = [
			new Cylinder(new Vector([.5, .0, .0]), new Vector([1.0, .0, .0]), .1, 1.0),
			new Cylinder(new Vector([.0, .5, .0]), new Vector([.0, 1.0, .0]), .1, 1.0),
			new Cylinder(new Vector([.0, .0, .5]), new Vector([.0, .0, 1.0]), .1, 1.0)
		];
		this.system = new Scene();
		for (let index = 0; index < axes.length; index++) {
			axes[index].material.baseColor = axes[index].axis.Flatten();
			this.system.Contents.Add(axes[index]);
		}

		//Create labels
		this.axesLabels = [
			new AxisLabel('X', new Vector([1.0, .0, .0])),
			new AxisLabel('Y', new Vector([.0, 1.0, .0])),
			new AxisLabel('Z', new Vector([.0, .0, 1.0]))
		];
		for (var index = 0; index < this.axesLabels.length; index++) {
			document.body.appendChild(this.axesLabels[index].GetElement());
		}

		//Create the coordinates rendering component
		this.renderer = new Renderer('CoordsRendering');
		this.renderer.camera.CenterOnBox(this.system.Contents.GetBoundingBox());
		this.renderer.camera.to = new Vector([.0, .0, .0]);

		this.showAxesLabels = true;
	}

	Refresh() {
		this.renderer.camera.Direction = this.mainRenderer.camera.Direction;
		this.renderer.RefreshSize();
		this.renderer.Draw(this.system);
		for (var index = 0; index < this.axesLabels.length; index++) {
			this.axesLabels[index].Refresh(this);
		}
		for (var index = 0; index < this.axesLabels.length; index++) {
			this.axesLabels[index].UpdateDepth(this.axesLabels);
		}
	}

	GetElement(): HTMLElement {
		return this.renderer.GetElement();
	}
}