/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/geometry.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="shapes/shape.ts" />
/// <reference path="shapes/plane.ts" />
/// <reference path="shapes/sphere.ts" />
/// <reference path="shapes/cylinder.ts" />
/// <reference path="../tools/longprocess.ts" />


class Ransac {
	nbPoints: number;
	ignore: boolean[];
	remainingPoints: number;
	fineShapeFitting: boolean;

	constructor(public cloud: PointCloud,
		private generators: ShapeGenerator[] = null,
		public nbFailure: number,
		public noise: number
	) {
		this.nbPoints = 3;
		this.ignore = new Array(this.cloud.Size());
		for (let ii = 0; ii < this.cloud.Size(); ii++) {
			this.ignore[ii] = false;
		}
		this.remainingPoints = this.cloud.Size();
	}

	SetGenerators(generators: ShapeGenerator[]): void {
		this.generators = generators;
	}

	IsDone(): boolean {
		return this.remainingPoints > 0;
	}

	FindBestFittingShape(onDone: Function): void {
		let step = new RansacStepProcessor(this);
		step.SetNext((s: RansacStepProcessor) => onDone(s.best.shape));
		step.Start();
	}

	PickPoints(): PickedPoints[] {
		let points: PickedPoints[] = [];

		while (points.length < this.nbPoints) {
			let index = Math.floor(Math.random() * this.cloud.Size());
			if (!this.ignore[index]) {
				for (let ii = 0; ii < points.length; ii++) {
					if (index === points[ii].index)
						index = null;
				}
				if (index != null && index < this.cloud.Size()) {
					points.push(new PickedPoints(index, this.cloud.GetPoint(index), this.cloud.GetNormal(index)));
				}
			}
		}

		return points;
	}

	GenerateCandidate(points: PickedPoints[]): Candidate {
		//Generate a candidate shape
		let candidates: Candidate[] = [];
		for (let ii = 0; ii < this.generators.length; ii++) {
			let shape = this.generators[ii](points);
			if (shape != null) {
				candidates.push(new Candidate(shape));
			}
		}

		//Compute scores and keep the best candidate
		let candidate = null;
		for (let ii = 0; ii < candidates.length; ii++) {
			candidates[ii].ComputeScore(this.cloud, this.noise, this.ignore);
			if (candidate == null || candidate.score > candidates[ii].score) {
				candidate = candidates[ii];
			}
		}

		return candidate;
	}

	static RansacPlane(points: PickedPoints[]) : Shape {
		let result = new Plane(points[0].point, points[0].normal, 0);
		return result;
	}

	static RansacSphere(points: PickedPoints[]) : Shape {
		let r1 = new Ray(points[0].point, points[0].normal);
		let r2 = new Ray(points[1].point, points[1].normal);

		let center = Geometry.LinesIntersection(r1, r2);
		let radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());

		return new Sphere(center, radius);
	}

	static RansacCylinder(points: PickedPoints[]): Shape {
		let r1 = new Ray(points[0].point, points[0].normal);
		let r2 = new Ray(points[1].point, points[1].normal);

		let center = Geometry.LinesIntersection(r1, r2);
		let axis = r1.dir.Cross(r2.dir);
		let radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());

		return new Cylinder(center, axis, radius, 0);
	}

	static RansacCone(points: PickedPoints[]): Shape {
		let axis = points[2].normal.Minus(points[0].normal).Cross(points[1].normal.Minus(points[0].normal));
		axis.Normalize();
		let hh = axis.Dot(points[0].normal);
		let angle = Math.asin(hh);

		let planes = [
			new PlaneFittingResult(points[0].point, points[0].normal),
			new PlaneFittingResult(points[1].point, points[1].normal),
			new PlaneFittingResult(points[2].point, points[2].normal)
		];
		let apex = Geometry.PlanesIntersection(planes);

		if (axis.Dot(points[0].point.Minus(apex)) < 0) {
			axis = axis.Times(-1);
		}

		return new Cone(apex, axis, angle, 0);
	}
}

interface ShapeGenerator {
	(points: PickedPoints[]): Shape;
}

class PickedPoints {
	constructor(public index: number, public point: Vector, public normal: Vector) {
	}
}

class Candidate {
	score: number;
	points: number[];

	constructor(public shape: Shape) {
	}

	ComputeScore(cloud: PointCloud, noise: number, ignore: boolean[]) {
		this.score = 0;
		this.points = [];

		//Suboptimal. TODO : use the KDTree to grant fast access to the shapes neighbours
		for (let ii = 0; ii < cloud.Size(); ii++) {
			if (!ignore[ii]) {
				let dist = this.shape.Distance(cloud.GetPoint(ii));
				if (dist > noise) {
					dist = noise;
				}
				else {
					this.points.push(ii);
				}
				this.score += dist * dist;
			}
		}
	}
}

class RansacStepProcessor extends LongProcess{
	nbTrials: number;
	progress: number;
	best: Candidate;

	constructor(private ransac: Ransac) {
		super('Searching for a new shape in the point cloud');
		this.nbTrials = 0;
		this.progress = 0;
	}

	get Done() {
		return this.nbTrials >= this.ransac.nbFailure;
	}

	get Current() {
		return this.progress;
	}

	get Target() {
		return this.ransac.nbFailure;
	}

	Step() {
		let points = this.ransac.PickPoints();
		let candidate = this.ransac.GenerateCandidate(points);

		this.nbTrials++;
		if (this.nbTrials > this.progress) {
			this.progress = this.nbTrials;
		}

		if (candidate != null) {
			if (this.best == null || this.best.score > candidate.score) {
				this.best = candidate;
				this.nbTrials = 0;
			}
		}
	}

	Finalize() {
		this.best.shape.FitToPoints(new PointSubCloud(this.ransac.cloud, this.best.points));
		this.best.ComputeScore(this.ransac.cloud, this.ransac.noise, this.ransac.ignore);
		this.best.shape.ComputeBounds(new PointSubCloud(this.ransac.cloud, this.best.points));

		for (let index = 0; index < this.best.points.length; index++) {
			this.ransac.ignore[this.best.points[index]] = true;
			this.ransac.remainingPoints--;
		}
	}
}