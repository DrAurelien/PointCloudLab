abstract class Shape {
	boundingbox: BoundingBox;
    visible: boolean;

	constructor() {
		this.boundingbox = null;
	}

    abstract ComputeMesh(sampling: number): Mesh;
	abstract ComputeBoundingBox(): BoundingBox;

	abstract Distance(point: Vector): number;

	abstract Rotate(rotation: Matrix);
	abstract Translate(translation: Vector);
	abstract Scale(scale: number);

	abstract RayIntersection(ray: Ray, wrapper: Pickable);

	GetBoundingBox(): BoundingBox{
		if (!this.boundingbox) {
			this.boundingbox = this.ComputeBoundingBox();
		}
		return this.boundingbox;
	}

	ComputeBounds(points: number[], cloud: PointCloud): void {
	}
}

interface ShapeCreator {
	(): Shape;
}