﻿/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/materials.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />


abstract class PCLPrimitive extends PCLNode {
	private material: Material;

	constructor(public name: string, owner: PCLGroup = null) {
		super(name, owner);
		this.material = new Material([0.0, 1.0, 0.0]);

	}

	SetBaseColor(color: number[]) {
		this.material.baseColor = color;
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();
		properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
		return properties;
	}

	abstract DrawPrimitive(drawingContext: DrawingContext);

	DrawNode(drawingContext: DrawingContext) {
		this.material.InitializeLightingModel(drawingContext);
		this.DrawPrimitive(drawingContext);
	}

	GetDisplayIcon(): string {
		return 'fa-cube';
	}
}