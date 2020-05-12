/// <reference path="../maths/matrix.ts" />
/// <reference path="../maths/vector.ts" />


class Transform {
	rotation: Matrix;
	translation: Vector;
	scalefactor: number;
	matrix: Matrix;

	constructor(private rotationCenter: Vector) {
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
			this.matrix.SetValue(3, 3, 1.0	 / this.scalefactor);
			if (shift) {
				this.matrix = shift.Times(-1).Multiply(this.matrix).Multiply(shift);
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
}