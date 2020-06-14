/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
/// <reference path="eigendecomposition.ts" />


//Sigular values decomposition
class SVD {
	sigma: Matrix;
	lhh: HouseholderReflexion[];
	rhh: HouseholderReflexion[]
	lgg: GivensRotation[];
	rgg: GivensRotation[];
	signs: Matrix;

	constructor(matrix: Matrix) {
		if (matrix.width != matrix.height) {
			throw 'Singular Values Decomposition has not been implemented for non squared matrices';
		}
		this.sigma = matrix.Clone();
		this.lhh = [];
		this.rhh = [];
		this.lgg = [];
		this.rgg = [];
		this.signs = Matrix.Identity(matrix.width);

		// Computes B = H[n-1] ... H[2]H[1].M.G*[1].G*[2] ... G*[n-2]
		// B being a bidiagonnal matrix
		// ()* denotes the transposed matrix
		// B is stored in this.sigma at the end the of this routine
		// H's are stored in this.lhh
		// G's are stored in this.rhh
		this.HouseholderDecomposition();

		// Computes Sigma = L[k] ... L[2]L[1].B.R*[1].R*[2] ... R*[k]
		// Sigma being a diagonnal matrix
		// L's are stored in this.lgg
		// R's are stored in this.rgg
		this.GivensDecomposition();

		//Singular values are supposed to be positive
		for (let index = 0; index < this.signs.width; index++) {
			if (this.sigma.GetValue(index, index) < 0) {
				this.signs.SetValue(index, index, -1);
			}
		}
	}

	private HouseholderDecomposition() {
		this.lhh = [];
		this.rhh = [];

		let width = this.sigma.width;
		for (let index = 0; index < width - 1; index++) {
			this.lhh.push(this.GetHouseholderTransform(index, false));
			if (index < width - 2) {
				this.rhh.push(this.GetHouseholderTransform(index, true));
			}
		}
	}

	private GivensDecomposition() {
		this.lgg = [];
		this.rgg = [];

		let width = this.sigma.width;
		for (let index: number = 0; index <= 200; index++) {
			if (this.sigma.IsDiagonnal())
				break;
			for (let index = 0; index < width - 1; index++) {
				this.rgg.push(this.GetGivensTransform(index, true));
				this.lgg.push(this.GetGivensTransform(index, false));
			}
		}
	}

	private GetHouseholderTransform(index: number, right: boolean = false): HouseholderReflexion {
		let v = right ?
			this.sigma.GetRowVector(index, index + 1) :
			this.sigma.GetColumnVector(index, index);

		//Compute v +- ||v||.e1    (with e1 = [1, 0, 0, ..., 0])
		let a = v.Get(0) > 0 ? - v.Norm() : v.Norm();
		v.Set(0, v.Get(0) - a);

		let householder = new HouseholderReflexion(v);
		householder.ApplyTo(this.sigma, right);
		return householder;
	}

	private GetGivensTransform(index: number, right: boolean): GivensRotation {
		let f = this.sigma.GetValue(index, index);
		let g = this.sigma.GetValue(right ? index : index + 1, right ? index + 1 : index);

		let givens = new GivensRotation(index, f, g);
		givens.ApplyTo(this.sigma, right);
		return givens;
	}

	//=============================================
	// Matrices accessors
	//=============================================
	// From B = H[n-1] ... H[2]H[1]  .  M  .  G*[1].G*[2] ... G*[n-2]
	// => we get M = (H[n-1] ... H[2]H[1])*  .  B  .  (G*[1].G*[2] ... G*[n-2])*
	//           M =        U1               .  B  .          V1*
	// Then, from Sigma = L[k] ... L[2]L[1]  .  B  .  R*[1].R*[2] ... R*[k]
	// => we get B = (L[k] ... L[2]L[1])*  .  Sigma  .  (R*[1].R*[2] ... R*[k])*
	//           B =        U2             .  Sigma  .          V2*
	// Hence M = (U1.U2) . Sigma . (V1.V2)* 
	// Furthermore, we introduce signs correction matrix (being its own inverse : Sign . Sign = Id)
	// in order to get positive singular values :
	// Finally : M = (U1.U2.Sign) . (Sign.Sigma) . (V1.V2)*

	GetU(): Matrix {
		let u = this.signs.Clone();
		let ggsize = this.lgg.length;
		// U2 = L*[1].L*[2] ... L*[k]
		for (let index = ggsize - 1; index >= 0; index--) {
			this.lgg[index].Transposed().ApplyTo(u);
		}
		let hhsize = this.lhh.length;
		// U1 = H*[1].H*[2] ... H*[n-1]
		// H being symmetric => H* = H, thus U1 = H[1].H[2] ... H[n-1]
		for (let index = hhsize - 1; index >= 0; index--) {
			this.lhh[index].ApplyTo(u);
		}
		return u;
	}

	GetV(): Matrix {
		let v = Matrix.Identity(this.sigma.width);
		let ggsize = this.rgg.length;
		// V2 = R*[1].R*[2] ... R*[k]
		for (let index = ggsize - 1; index >= 0; index--) {
			this.rgg[index].Transposed().ApplyTo(v);
		}
		let hhsize = this.rhh.length;
		// V1 = G*[1].G*[2] ... G*[n-2]
		// G being symmetric => G* = G, thus V1 = G[1].G[2] ... G[n-1]
		for (let index = hhsize - 1; index >= 0; index--) {
			this.rhh[index].ApplyTo(v);
		}
		return v;
	}

	GetVTransposed(): Matrix {
		//V* = (V1.V2)* = V2* . V1* . Identity
		let v = Matrix.Identity(this.sigma.width);
		let hhsize = this.rhh.length;
		// V1* = G[n-2] ... G[2].G[1]
		for (let index = 0; index < hhsize; index++) {
			this.rhh[index].ApplyTo(v);
		}
		let ggsize = this.rgg.length;
		// V2* = R[k] ... R[2].R[1]
		for (let index = 0; index < ggsize; index++) {
			this.rgg[index].ApplyTo(v);
		}
		return v;
	}

	GetSigma(): Matrix {
		return this.signs.Multiply(this.sigma.Clone());
	}
}

// Householder maps any vector to its symmetric with respect to the plane orthognal to a given vector v
class HouseholderReflexion {
	constructor(public v: Vector) {
	}

	Reflect(a: Vector): Vector {
		let v = this.v.Clone();
		while (v.Dimension() < a.Dimension()) {
			v.coordinates = [0].concat(v.coordinates);
		}
		let s = 2.0 * a.Dot(v) / v.SqrNorm();
		return a.Minus(v.Times(s));
	}

	ApplyTo(m: Matrix, right: boolean = false) {
		for (let index = 0; index < m.width; index++) {
			if (right) {
				m.SetRowVector(index, this.Reflect(m.GetRowVector(index)));
			}
			else {
				m.SetColumnVector(index, this.Reflect(m.GetColumnVector(index)));
			}
		}
	}

	GetMatrix(): Matrix {
		let d = this.v.Dimension();
		let v = new Matrix(1, d, new Float32Array(this.v.Flatten()));
		return Matrix.Identity(d).Plus(v.Multiply(v.Transposed()).Times(-2 / this.v.SqrNorm()));
	}
}

// Givens rotation can by used to vanish the value in a matrix at a specific position
// It is based on the following transform (f, g being given) :
// | c   s | . | f | = | r |
// | -s  c |   | g |   | 0 |
class GivensRotation {
	c: number;
	s: number;
	private matrix: Matrix;

	constructor(private index, f: number, g: number) {
		if (f == 0) {
			this.c = 0;
			this.s = 1;
		}
		else if (Math.abs(f) > Math.abs(g)) {
			let t = g / f;
			let tt = Math.sqrt(1 + t ** 2);
			this.c = 1 / tt;
			this.s = t / tt;
		}
		else {
			let t = f / g;
			let tt = Math.sqrt(1 + t ** 2);
			this.s = 1.0 / tt;
			this.c = t * this.s;
		}
	}

	Transposed(): GivensRotation {
		let t = new GivensRotation(this.index, 0, 0);
		t.c = this.c;
		t.s = -this.s;
		return t;
	}

	private Rotate(a: Vector): Vector {
		let v = a.Clone();
		v.Set(this.index, (this.c * a.Get(this.index)) + (this.s * a.Get(this.index+1)));
		v.Set(this.index + 1, (this.c * a.Get(this.index+1)) - (this.s * a.Get(this.index)));
		return v;
	}

	ApplyTo(matrix: Matrix, right: boolean = false) {
		for (let index = 0; index < matrix.width; index++) {
			if (right) {
				matrix.SetRowVector(index, this.Rotate(matrix.GetRowVector(index)));
			}
			else {
				matrix.SetColumnVector(index, this.Rotate(matrix.GetColumnVector(index)));
			}
		}
	}
}