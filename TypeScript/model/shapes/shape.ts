abstract class Shape extends CADPrimitive{
    visible: boolean;
	mesh: Mesh;

	constructor(name: string) {
		super(name);
		this.mesh = null;
	}
	abstract GetBoundingBox(): BoundingBox;

    abstract GetGeometry(): Object;
    abstract SetGeometry(geometry: Object): void;

    abstract ComputeMesh(sampling: number): Mesh;

    abstract RayIntersection(ray: Ray): number[];

	abstract Distance(point: Vector): number;
}