class Ransac {
	nbPoints: number;
	nbFailure: number;
	noise: number;
	ignore: boolean[];

	constructor(public cloud : PointCloud, private generators: ShapeGenerator[] = null) {
		this.nbPoints = 3;
		this.nbFailure = 100;
		this.noise = 0.1;
		this.ignore = new Array(this.cloud.Size());
		for (var ii = 0; ii < this.cloud.Size(); ii++) {
			this.ignore[ii] = false;
		}
	}

	SetGenerators(generators: ShapeGenerator[]): void {
		this.generators = generators;
	}

	IsDone(): boolean {
		for (var ii = 0; ii < this.ignore.length; ii++) {
			if (!this.ignore[ii]) {
				return false;
			}
		}
		return true;
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
		var candidates = [];
		for (var ii = 0; ii < this.generators.length; ii++) {
			var shape = this.generators[ii](points);
			if (shape != null) {
				candidates.push(shape);
			}
		}

		//Compute scores and keep the best candidate
		var candidate = null;
		for (var ii = 0; ii < candidates.length; ii++) {
			var score = this.ComputeShapeScore(candidates[ii]);
			if (candidate == null || candidate.score > score.score) {
				candidate = {
					score: score.score,
					points: score.points,
					shape: candidates[ii]
				};
			}
		}

		return candidate;
	}

	ComputeShapeScore = function (shape) {
		var score = {
			score: 0,
			points: []
		};
		for (var ii = 0; ii < this.cloud.Size(); ii++) {
			if (!this.ignore[ii]) {
				var dist = shape.Distance(this.cloud.GetPoint(ii));
				if (dist > this.noise) {
					dist = this.noise;
				}
				else {
					score.points.push(ii);
				}
				score.score += dist * dist;
			}
		}
		return score;
	}

	static RansacPlane(points: PickedPoints[]) : Shape {
		var result = new Plane(points[0].point, points[0].normal, 0);
		return result;
	}

	static RansacSphere(points: PickedPoints[]) : Shape {
		var r1 = new Ray(points[0].point, points[0].normal);
		var r2 = new Ray(points[1].point, points[1].normal);

		var center = Geometry.LinesIntersection(r1, r2);
		var radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());

		var result = new Sphere(center, radius);
		return result;
	}

	static RansacCylinder(points: PickedPoints[]): Shape {
		var r1 = new Ray(points[0].point, points[0].normal);
		var r2 = new Ray(points[1].point, points[1].normal);

		var center = Geometry.LinesIntersection(r1, r2);
		var axis = r1.dir.Cross(r2.dir);
		var radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());

		var result = new Cylinder(center, axis, radius, 1.0);
		return result;
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
	constructor(public score: number, public points: number[], public shape: Shape) {
	}
}

class RansacStepProcessor extends LongProcess{
	nbTrials: number;
	progress: number;
	best: Candidate;

	constructor(private ransac: Ransac) {
		super('Searching for a shape');
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
		this.best.shape.ComputeBounds(this.best.points, this.ransac.cloud);

		for (let index = 0; index < this.best.points.length; index++) {
			this.ransac.ignore[this.best.points[index]] = true;
		}
	}
}