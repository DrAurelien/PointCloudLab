/// <reference path="kdtree.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="neighbourhood.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/matrix.ts" />
/// <reference path="../maths/geometry.ts" />
/// <reference path="../maths/svd.ts" />
/// <reference path="../tools/transform.ts" />


class ICPPairing {
	constructor(public cloudIndex: number, public refIndex: number, public sqrdist: number) {
	}

	static Compare(a: ICPPairing, b: ICPPairing): number {
		return a.sqrdist - b.sqrdist;
	}
}

//Trimed Iterative Closest Point implementation
class ICPRegistration extends IterativeLongProcess {
	trmse: number;
	done: boolean;

	constructor(private reference: PointCloud,
		private cloud: PointCloud,
		private overlap: number = 1,
		public maxiterations: number = 100,
		public stabilityfactor: number = 0.01) {
		super(maxiterations, 'Iterative closest point registration');
	}

	Initialize() {
		if (!this.reference.tree) {
			this.reference.tree = new KDTree(this.reference);
		}
		this.trmse = null;
		this.done = false;
	}

	get Done(): boolean {
		return this.done || this.currentstep >= this.maxiterations;
	}

	private get Trim() {
		return Math.round(this.cloud.Size() * this.overlap);
	}

	Iterate() {
		//Pair each cloud point with its clostest neighbour in reference
		let pairing: ICPPairing[];
		let size = this.cloud.Size();
		pairing = new Array<ICPPairing>(size);
		for (let index = 0; index < size; index++) {
			let nn = this.reference.KNearestNeighbours(this.cloud.GetPoint(index), 1).Neighbours()[0];
			pairing[index] = new ICPPairing(index, nn.index, nn.sqrdistance);
		}

		//Trim pairing
		let trim = this.Trim;
		pairing.sort(ICPPairing.Compare);
		pairing = pairing.slice(0, trim);

		//Evaluate the Trimmed Mean Square Error (and then compare with the last one)
		let mse = 0;
		for (let index = 0; index < trim; index++) {
			mse += pairing[index].sqrdist;
		}
		mse /= trim;

		//Stop when stability is reached
		if (this.trmse !== null && ((this.trmse - mse) < this.trmse * this.stabilityfactor)) {
			this.done = true;
			return;
		}
		this.trmse = mse;

		//Build the corresponding point clouds
		let refIndices = new Array<number>(trim);
		let cloudIndices = new Array<number>(trim);
		for (let index = 0; index < trim; index++) {
			refIndices[index] = pairing[index].refIndex;
			cloudIndices[index] = pairing[index].cloudIndex;
		}
		let refSub = new PointSubCloud(this.reference, refIndices);
		let cloudSub = new PointSubCloud(this.cloud, cloudIndices);

		//Get the transform
		let refCentroid = Geometry.Centroid(refSub);
		let cloudCentroid = Geometry.Centroid(cloudSub);
		let covariance = Matrix.Null(3, 3);
		for (let index = 0; index < trim; index++) {
			let x = cloudSub.GetPoint(index).Minus(cloudCentroid);
			let y = refSub.GetPoint(index).Minus(refCentroid);
			for (let ii = 0; ii < 3; ii++) {
				for (let jj = 0; jj < 3; jj++) {
					covariance.AddValue(ii, jj, x.Get(ii) * y.Get(jj));
				}
			}
		}

		//Rigid motion computation
		let svd = new SVD(covariance);
		let rigidMotion = new Transform();
		rigidMotion.SetRotation(svd.GetV().Multiply(svd.GetU().Transposed()));
		rigidMotion.SetTranslation(refCentroid.Minus(rigidMotion.TransformPoint(cloudCentroid)));

		//Apply the computed transform
		this.cloud.ApplyTransform(rigidMotion);
	}
}