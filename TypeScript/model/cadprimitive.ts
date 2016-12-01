abstract class CADPrimitive {
	material: Material;
	visible: boolean;
	selected: boolean;

    constructor(public name: string) {
		visible = true;
		selected = false;
    }

    abstract RayIntersection(ray: Ray) : number[];
}