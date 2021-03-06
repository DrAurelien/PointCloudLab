﻿/// <reference path="controls/control.ts" />
/// <reference path="controls/axislabel.ts" />
/// <reference path="app.ts" />
/// <reference path="opengl/renderer.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="objects/light.ts" />
/// <reference path="objects/pclcylinder.ts" />
/// <reference path="../model/shapes/cylinder.ts" />
/// <reference path="../maths/vector.ts" />


class CoordinatesSystem implements Control, Notifiable {
	renderer: Renderer;
	showAxesLabels: boolean;
	private coordssystem: Scene;
	private axesLabels: AxisLabel[];

	constructor(private view: PCLApp) {
		let self = this;
		//Create the coordinates axes to be rendered
		let axes: PCLCylinder[] = [
			new PCLCylinder(new Cylinder(new Vector([.5, .0, .0]), new Vector([1.0, .0, .0]), .1, 1.0)),
			new PCLCylinder(new Cylinder(new Vector([.0, .5, .0]), new Vector([.0, 1.0, .0]), .1, 1.0)),
			new PCLCylinder(new Cylinder(new Vector([.0, .0, .5]), new Vector([.0, .0, 1.0]), .1, 1.0))
		];
		this.coordssystem = new Scene();
		for (let index = 0; index < axes.length; index++) {
			axes[index].SetBaseColor(axes[index].cylinder.axis.Flatten());
			this.coordssystem.Contents.Add(axes[index]);
			axes[index].AddChangeListener(this);
		}

		//Refine lighting
		let light = <Light>this.coordssystem.Lights.children[0];
		this.coordssystem.Lights.Add(new Light(light.position.Times(-1.0)));

		//Create labels
		this.axesLabels = [
			new AxisLabel('X', new Vector([1.0, .0, .0]), this),
			new AxisLabel('Y', new Vector([.0, 1.0, .0]), this),
			new AxisLabel('Z', new Vector([.0, .0, 1.0]), this)
		];
		for (var index = 0; index < this.axesLabels.length; index++) {
			document.body.appendChild(this.axesLabels[index].GetElement());
		}

		//Create the coordinates rendering component
		this.renderer = new Renderer('CoordsRendering');
		this.renderer.camera.CenterOnBox(this.coordssystem.Contents.GetBoundingBox());
		this.renderer.camera.to = new Vector([.0, .0, .0]);

		this.showAxesLabels = true;
	}

	Refresh() {
		let mainCamera = this.MainRenderer.camera;
		this.renderer.camera.SetDirection(mainCamera.GetDirection(), mainCamera.up);
		this.renderer.RefreshSize();
		this.renderer.Draw(this.coordssystem);
		for (var index = 0; index < this.axesLabels.length; index++) {
			this.axesLabels[index].Refresh();
		}
		for (var index = 0; index < this.axesLabels.length; index++) {
			this.axesLabels[index].UpdateDepth(this.axesLabels);
		}
	}

	GetElement(): HTMLElement {
		return this.renderer.GetElement();
	}

	ChangeViewAxis(axis: Vector) {
		this.MainRenderer.camera.SetDirection(axis, axis.GetOrthogonnal());
		this.view.RefreshRendering();
	}

	private get MainRenderer(): Renderer {
		return this.view.sceneRenderer;
	}

	NotifyChange(node: PCLNode) {
		this.renderer.Draw(this.coordssystem);
		this.view.RefreshRendering();
	}
}