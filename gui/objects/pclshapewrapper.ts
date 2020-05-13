/// <reference path="pclshape.ts" />
/// <reference path="pclplane.ts" />
/// <reference path="pclsphere.ts" />
/// <reference path="pclcone.ts" />
/// <reference path="pclcylinder.ts" />
/// <reference path="pcltorus.ts" />
/// <reference path="../../model/shapes/plane.ts" />
/// <reference path="../../model/shapes/sphere.ts" />
/// <reference path="../../model/shapes/cone.ts" />
/// <reference path="../../model/shapes/cylinder.ts" />
/// <reference path="../../model/shapes/torus.ts" />


class PCLShapeWrapper {
	constructor(private shape: Shape) {
	}

	GetPCLShape(): PCLShape {
		let result: PCLShape;
		if (this.shape instanceof Plane) {
			result = new PCLPlane(this.shape as Plane);
		}
		else if (this.shape instanceof Sphere) {
			result = new PCLSphere(this.shape as Sphere);
		}
		else if (this.shape instanceof Cone) {
			result = new PCLCone(this.shape as Cone);
		}
		else if (this.shape instanceof Cylinder) {
			result = new PCLCylinder(this.shape as Cylinder);
		}
		else if (this.shape instanceof Torus) {
			result = new PCLTorus(this.shape as Torus);
		}
		else {
			throw 'PCL Shapes wrapping error : Cannot handle "' + (typeof this.shape) + '" as a valid shape type';
		}
		return result;
	}
}