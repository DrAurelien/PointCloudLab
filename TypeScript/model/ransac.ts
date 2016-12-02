class Ransac {
	nbPoints: number;
	nbFailure: number;
	noise: number;
	private ignore: boolean[];

	constructor(private cloud, private generators: Function[] = null) {
		this.nbPoints = 3;
		this.nbFailure = 100;
		this.noise = 0.1;
		this.ignore = new Array(this.cloud.Size());
		for (var ii = 0; ii < this.cloud.Size(); ii++) {
			this.ignore[ii] = false;
		}
	}

	SetGenerators(generators: Function[]): void {
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
		let progress = 0;
		let nbTrials = 0;
		let best = null;
		let ransac = this;

		function RansacStep() {
			if (nbTrials >= ransac.nbFailure) {
				return null;
			}

			var points = ransac.PickPoints();
			var candidate = ransac.GenerateCandidate(points);

			nbTrials++;
			if (nbTrials > progress) {
				progress = nbTrials;
			}

			if (candidate != null) {
				if (best == null || best.score > candidate.score) {
					best = candidate;
					nbTrials = 0;
				}
			}

			return { current: progress, total: ransac.nbFailure };
		}

		function FinalizeResult() {
			best.shape.ComputeBounds(best.points, ransac.cloud);

			for (var ii = 0; ii < best.points.length; ii++) {
				ransac.ignore[best.points[ii]] = true;
			}

			onDone(best.shape);
		}

		LongProcess.Run('Searching for a shape', RansacStep, FinalizeResult);
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

	static RansacPlane(points: PickedPoints[]) {
		var result = new Plane(points[0].point, points[0].normal, 0);
		result.ComputeBounds = function (points, cloud) {
			this.center = new Vector([0, 0, 0]);
			for (var ii = 0; ii < points.length; ii++) {
				this.center = this.center.Plus(cloud.GetPoint(points[ii]));
			}
			this.center = this.center.Times(1.0 / points.length);
			this.patchRadius = 0;
			for (var ii = 0; ii < points.length; ii++) {
				var d = cloud.GetPoint(points[ii]).Minus(this.center).SqrNorm();
				if (d > this.patchRadius) {
					this.patchRadius = d;
				}
			}
			this.patchRadius = Math.sqrt(this.patchRadius);
		};
		return result;
	}

	static RansacSphere(points: PickedPoints[]) {
		var r1 = {
			point: points[0].point,
			direction: points[0].normal
		};
		var r2 = {
			point: points[1].point,
			direction: points[1].normal
		};

		var center = LinesIntersection(r1, r2);
		var radius = 0.5 * (r1.point.Minus(center).Norm() + r2.point.Minus(center).Norm());

		var result = new Sphere(center, radius);
		result.ComputeBounds = function (points, cloud) { };
		return result;
	}

	static RansacCylinder(points: PickedPoints[]) {
		var r1 = {
			point: points[0].point,
			direction: points[0].normal
		};
		var r2 = {
			point: points[1].point,
			direction: points[1].normal
		};

		var center = LinesIntersection(r1, r2);
		var axis = r1.direction.Cross(r2.direction);
		var radius = 0.5 * (r1.point.Minus(center).Norm() + r2.point.Minus(center).Norm());

		var result = new Cylinder(center, axis, radius, 1.0);
		result.ComputeBounds = function (points, cloud) {
			var min = 0;
			var max = 0;
			for (var ii = 0; ii < points.length; ii++) {
				var d = cloud.GetPoint(points[ii]).Minus(this.center).Dot(this.axis);
				if (ii == 0 || d < min) {
					min = d;
				}
				if (ii == 0 || d > max) {
					max = d;
				}
			}
			var d = 0.5 * (min + max);
			this.center = this.center.Plus(this.axis.Times(d));
			this.height = max - min;
		};
		return result;
	}
}

class PickedPoints {
	constructor(public index: number, public point: Vector, public normal: Vector) {
	}
}

class Candidate {
	constructor(public score: number, public points: Vector[], public shape: Shape) {
	}
}