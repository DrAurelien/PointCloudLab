/// <reference path="../../gui/objects/pclgroup.ts" />


interface ActionDelegate {
	ScanFromCurrentViewPoint(group: PCLGroup, hsampling: number, vsampling: number, noise:number);
	GetShapesSampling(): number;
}