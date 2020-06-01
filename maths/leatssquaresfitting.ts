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
class LeastSquaresFitting<DataType> {
	solution: number[];
	error: number;

	constructor(
		private data: DataProvider<DataType>,
		public lambda: number = 1.0,
		public lambdaFactor: number = 10.0,
		public stabilityNbSteps: number = 10,
		public stabilityFactor: number = 1.0e-3
	) {
	}

	Initialize(value: number[])
	{
		this.solution = value.slice();
	}

	Solve(evaluable: LeastSquaresEvaluable<DataType>): number
	{
		if (this.solution == null || !this.solution.length)
			throw "Solution has not been initiallized";

		this.error = this.ComputeError(evaluable, this.solution);

		let iterations = 0;
		let counter = 0;
		let jacobian: Matrix;
		let rightHand: Matrix;

		while (counter < this.stabilityNbSteps) {
			counter++;

			//Compute matrices
			if (jacobian == null || rightHand == null) {
				jacobian = Matrix.Null(this.solution.length, this.solution.length);
				rightHand = Matrix.Null(1, this.solution.length);

				let grad: Matrix;
				let size = this.data.Size();
				for (let index = 0; index < size; index++)
				{
					let datum = this.data.GetData(index);
					let dist = -evaluable.Distance(this.solution, datum);
					let grad = evaluable.DistanceGradient(this.solution, datum);
					for (let ii = 0; ii < this.solution.length; ii++)
					{
						rightHand.AddValue(ii, 0, grad[ii] * dist);
						for (let jj = 0; jj < this.solution.length; jj++) {
							jacobian.AddValue(ii, jj, grad[ii] * grad[jj]);
						}
					}
				}
			}

			//Compute the modified jacobian
			let leftHand = jacobian.Clone();
			for (let index = 0; index < jacobian.width; index++) {
				leftHand.SetValue(index, index, jacobian.GetValue(index, index) * (1.0 + this.lambda));
			}

			// Solve leftHand . step = rightHand to get the next solution
			let step = leftHand.LUSolve(rightHand);
			let next: number[] = new Array<number>(this.solution.length);
			for (let index = 0; index < this.solution.length; index++) {
				next[index] = step.GetValue(index, 0) + this.solution[index];
			}

			let nextError = this.ComputeError(evaluable, next);
			if (nextError < this.error) {
				//Solution has been improved : accept solution and dicrease lambda
				this.solution = next;
				evaluable.NotifyNewSolution(this.solution);

				//Solution has changed : invalidate matrices
				jacobian = null;
				rightHand = null;

				this.lambda /= this.lambdaFactor;

				//If solution increase falls bellow a tolerance, stop computations
				iterations += counter;
				let delta = this.error - nextError;
				this.error = nextError;
				if (delta < this.stabilityFactor * this.error) {
					return iterations;
				}

				//Reset counter as the solution gets better
				counter = 0;
			}
			else {
				//Solution is worst : increase lambda
				this.lambda *= this.lambdaFactor;
			}
		}
		return iterations;
	}

	ComputeError(distance: LeastSquaresEvaluable<DataType>, parameters: number[])
	{
		let error = 0.0;
		let size = this.data.Size();
		for (let index = 0; index < size; index++) {
			error += distance.Distance(parameters, this.data.GetData(index)) ** 2;
		}
		return error / size;
	}
}