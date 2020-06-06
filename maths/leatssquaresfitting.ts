/// <reference path="matrix.ts" />
/// <reference path="../tools/dataprovider.ts" />


interface LeastSquaresEvaluable<DataType> {
	Distance(parameters: number[], point: DataType): number;
	DistanceGradient(parameters: number[], point: DataType): number[];
	NotifyNewSolution(parameters: number[]);
}

/*Solves parametric model least squares fitting using Levenberg Marquardt algorithm
The solver stops as soon as one of the following requirement is met :
 - the solution did not evelve after StabilityNbSteps steps
 - the solution improve ratio falls bellow StabilityFactor in ]0,1[*/
class LeastSquaresFitting<DataType> extends LongProcess {
	error: number;
	delta: number;
	iterations: number;
	counter: number;
	maxcounter: number;
	jacobian: Matrix;
	rightHand: Matrix;

	constructor(
		public solution: number[],
		public evaluable: LeastSquaresEvaluable<DataType>,
		private data: DataProvider<DataType>,
		public lambda: number = 1.0,
		public lambdaFactor: number = 10.0,
		public stabilityNbSteps: number = 10,
		public stabilityFactor: number = 1.0e-3
	) {
		super('Performing least squares fitting');
	}

	Initialize() {
		this.error = this.ComputeError(this.solution);
		this.iterations = 0;
		this.counter = 0;
		this.maxcounter = 0;
	}

	get Done(): boolean {
		return (this.counter >= this.stabilityNbSteps) ||
			(this.delta < this.stabilityFactor * this.error);
	}

	get Current(): number {
		return this.maxcounter;
	}

	get Target(): number {
		return this.stabilityNbSteps;
	}

	Step()
	{
		this.counter++;
		if (this.counter > this.maxcounter) {
			this.maxcounter = this.counter;
		}

		//Compute matrices
		if (this.jacobian == null || this.rightHand == null) {
			this.jacobian = Matrix.Null(this.solution.length, this.solution.length);
			this.rightHand = Matrix.Null(1, this.solution.length);

			let size = this.data.Size();
			for (let index = 0; index < size; index++)
			{
				let datum = this.data.GetData(index);
				let dist = -this.evaluable.Distance(this.solution, datum);
				let grad = this.evaluable.DistanceGradient(this.solution, datum);
				for (let ii = 0; ii < this.solution.length; ii++)
				{
					this.rightHand.AddValue(ii, 0, grad[ii] * dist);
					for (let jj = 0; jj < this.solution.length; jj++) {
						this.jacobian.AddValue(ii, jj, grad[ii] * grad[jj]);
					}
				}
			}
		}

		//Compute the modified jacobian
		let leftHand = this.jacobian.Clone();
		for (let index = 0; index < this.jacobian.width; index++) {
			leftHand.SetValue(index, index, this.jacobian.GetValue(index, index) * (1.0 + this.lambda));
		}

		// Solve leftHand . step = rightHand to get the next solution
		let step = leftHand.LUSolve(this.rightHand);
		let next: number[] = new Array<number>(this.solution.length);
		for (let index = 0; index < this.solution.length; index++) {
			next[index] = step.GetValue(index, 0) + this.solution[index];
		}

		let nextError = this.ComputeError(next);
		if (nextError < this.error) {
			//Solution has been improved : accept solution and dicrease lambda
			this.solution = next;
			this.evaluable.NotifyNewSolution(this.solution);

			//Solution has changed : invalidate matrices
			this.jacobian = null;
			this.rightHand = null;

			this.lambda /= this.lambdaFactor;

			//If solution increase falls bellow a tolerance, stop computations
			this.iterations += this.counter;
			this.delta = this.error - nextError;
			this.error = nextError;

			//Reset counter as the solution gets better
			this.counter = 0;
		}
		else {
			//Solution is worst : increase lambda
			this.lambda *= this.lambdaFactor;
		}
	}

	private ComputeError(parameters: number[])
	{
		let error = 0.0;
		let size = this.data.Size();
		for (let index = 0; index < size; index++) {
			error += this.evaluable.Distance(parameters, this.data.GetData(index)) ** 2;
		}
		return error / size;
	}
}