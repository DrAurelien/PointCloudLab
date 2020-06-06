/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />


abstract class Shape {
	boundingbox: BoundingBox;
	onChange: Function;

	constructor() {
		this.boundingbox = null;
	}

    abstract ComputeMesh(sampling: number, onDone: Function): Mesh;
	abstract ComputeBoundingBox(): BoundingBox;

	abstract Distance(point: Vector): number;

	abstract ApplyTransform(transform: Transform);

	abstract RayIntersection(ray: Ray, wrapper: Pickable);

	GetBoundingBox(): BoundingBox{
		if (!this.boundingbox) {
			this.boundingbox = this.ComputeBoundingBox();
		}
		return this.boundingbox;
	}

	ComputeBounds(points: number[], cloud: PointCloud): void {
	}

	protected NotifyChange() {
		if (this.onChange) {
			this.onChange();
		}
	}

}

interface ShapeCreator {
	(): Shape;
}