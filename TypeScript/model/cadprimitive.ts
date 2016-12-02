abstract class CADPrimitive {
	material: Material;
	visible: boolean;
	selected: boolean;

    constructor(public name: string) {
		this.material = new Material([0.0, 1.0, 0.0]);
		this.visible = true;
		this.selected = false;
    }

    abstract RayIntersection(ray: Ray) : number[];
}