/// <reference path="../maths/matrix.ts" />
/// <reference path="../maths/vector.ts" />


class Transform {
	rotation: Matrix;
	translation: Vector;
	scalefactor: number;
	matrix: Matrix;

	constructor(private rotationCenter?: Vector) {
		this.rotation = Matrix.Identity(4);
		this.translation = new Vector([0.0, 0.0, 0.0]);
		this.scalefactor = 1.0;
	}

	Rotate(rotation: Matrix) {
		this.rotation = this.rotation.Multiply(rotation);
		delete this.matrix;
	}

	Scale(scale: number) {
		this.scalefactor *= scale;
		delete this.matrix;
	}

	Translate(translation: Vector) {
		this.translation = this.translation.Plus(translation);
		delete this.matrix;
	}

	GetMatrix(): Matrix {
		if (!this.matrix) {
			let shift = this.rotationCenter ? Matrix.Translation(this.rotationCenter) : null;
			this.matrix = this.rotation.Clone();
			for (let row = 0; row < 3; row++) {
				this.matrix.SetValue(row, 3, this.translation.Get(row));
			}
			this.matrix.SetValue(3, 3, 1.0 / this.scalefactor);
			if (this.rotationCenter) {
				let shift = Matrix.Translation(this.rotationCenter.Times(-1));
				let unshift = Matrix.Translation(this.rotationCenter);
				this.matrix = unshift.Multiply(this.matrix.Multiply(shift));
			}
		}
		return this.matrix;
	}

	TransformPoint(p: Vector): Vector {
		return Homogeneous.ToVector(this.GetMatrix().Multiply(new HomogeneousPoint(p)));
	}

	TransformVector(v: Vector): Vector {
		return Homogeneous.ToVector(this.GetMatrix().Multiply(new HomogeneousVector(v)));
	}

	SetTranslation(t: Vector) {
		this.translation = t;
	}

	SetRotation(r: Matrix) {
		if (r.width == 4 && r.height == 4) {
			this.rotation = r;
		}
		else if (r.width == 3 && r.height == 3) {
			this.rotation = Matrix.Identity(4);
			for (let ii = 0; ii < 3; ii++) {
				for (let jj = 0; jj < 3; jj++) {
					this.rotation.SetValue(ii, jj, r.GetValue(ii, jj));
				}
			}
		}
		else {
			throw 'Invalid rotation matrix for rigid transform';
		}
	}
}