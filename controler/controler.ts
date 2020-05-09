﻿/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/matrix.ts" />


enum ViewPointChange {
	Position,
	Rotation,
	Panning,
	Zoom
}

enum RenderingMode {
	Point,
	Wire,
	Surface
}

interface ViewPoint {
	Rotate(xfrom: number, yfrom: number, xto: number, yto: number);
	Pan(dx: number, dy: number);
	Zoom(delta: number);
	SetPosition(p: Vector);
	GetPosition(): Vector;
	GetRotationMatrix(xfrom: number, yfrom: number, xto: number, yto: number): Matrix;
	GetTranslationVector(dx: number, dy: number): Vector;
	GetScreenHeight(): number;
}

interface LightingPosition {
	GetPosition(): Vector;
	SetPositon(p: Vector);
}

interface Transformable {
	Rotate(rotation: Matrix);
	Scale(scale: number);
	Translate(translation: Vector);
}

interface Controler {
}

interface Controlable {
	GetViewPoint(): ViewPoint;
	GetLightPosition(): LightingPosition;
	GetCurrentTransformable(): Transformable;
	NotifyViewPointChange(c: ViewPointChange);
	NotifyTransform();
	NotifyControlStart();
	NotifyControlEnd();
	NotifyPendingControl();
	GetRengeringArea(): HTMLElement;
	SetCurrentControler(controler: Controler);
	GetCurrentControler(): Controler;
	PickItem(x: number, y: number);
	FocusOnCurrentItem();
	CanFocus(): boolean;
	ToggleRendering(mode: RenderingMode);
}