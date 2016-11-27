interface CADPrimitive {
    visible: boolean;
    name: string;

    RayIntersection(ray: Ray) : number[];
}