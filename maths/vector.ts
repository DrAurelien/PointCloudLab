﻿enum SphericalRepresentation
{
	AzimuthColatitude, // Theta ranges from 0=Z to pi=-Z
	AzimuthLatitude //Theta range from -pi/2=-Z to pi/2=Z
}

class Vector {
	coordinates: number[];

	constructor(coords) {
		this.coordinates = new Array(coords.length);
		for (var index = 0; index < coords.length; index++) {
			this.coordinates[index] = coords[index];
		}
	}

	Flatten(): number[] {
		return this.coordinates;
	}

	Clone(): Vector {
		return new Vector(this.coordinates.slice());
	}

	Dimension(): number {
		return this.coordinates.length;
	}

	Get(index: number): number {
		return this.coordinates[index];
	}

	isNaN(): boolean {
		for (var index = 0; index < this.coordinates.length; index++) {
			if (isNaN(this.coordinates[index])) {
				return true;
			}
		}
		return false;
	}

	Set(index: number, value: number): void {
		this.coordinates[index] = value;
	}

	//Sum of two vectors
	Plus(v: Vector): Vector {
		if (this.coordinates.length != v.coordinates.length) {
			throw 'Cannot add vectors with different dimensions'
		}
		let result: number[] = new Array(this.coordinates.length);
		for (let index: number = 0; index < this.coordinates.length; index++) {
			result[index] = this.coordinates[index] + v.coordinates[index];
		}
		return new Vector(result);
	}

	//Sum in place
	Add(v: Vector) {
		if (this.coordinates.length != v.coordinates.length) {
			throw 'Cannot add vectors with different dimensions'
		}
		for (let index: number = 0; index < this.coordinates.length; index++) {
			this.coordinates[index] += v.coordinates[index];
		}
	}

	//Product of two vectors
	Multiply(v: Vector): Vector {
		if (this.coordinates.length != v.coordinates.length) {
			throw 'Cannot multiply vectors with different dimensions'
		}
		let result: number[] = new Array(this.coordinates.length);
		for (let index: number = 0; index < this.coordinates.length; index++) {
			result[index] = this.coordinates[index] * v.coordinates[index];
		}
		return new Vector(result);
	}

	//Difference between two vectors
	Minus(v: Vector): Vector {
		if (this.coordinates.length != v.coordinates.length) {
			throw 'Cannot compute difference between vectors with different dimensions'
		}
		let result: number[] = new Array(this.coordinates.length);
		for (let index: number = 0; index < this.coordinates.length; index++) {
			result[index] = this.coordinates[index] - v.coordinates[index];
		}
		return new Vector(result);
	}

	//Multiply a vector by a scalar
	Times(s: number): Vector {
		let result: number[] = new Array(this.coordinates.length);
		for (let index: number = 0; index < this.coordinates.length; index++) {
			result[index] = this.coordinates[index] * s;
		}
		return new Vector(result);
	}

	//Dot product
	Dot(v: Vector): number {
		if (this.coordinates.length != v.coordinates.length) {
			throw 'Cannot compute difference between vectors with different dimensions'
		}
		let result: number = 0;
		for (let index: number = 0; index < this.coordinates.length; index++) {
			result += this.coordinates[index] * v.coordinates[index];
		}
		return result;
	}

	//Cross product (only for 3D vectors)
	Cross(v: Vector): Vector {
		if (this.coordinates.length != 3) {
			throw 'Cross product only hold for 3D vectors';
		}
		return new Vector([
			this.coordinates[1] * v.coordinates[2] - this.coordinates[2] * v.coordinates[1],
			this.coordinates[2] * v.coordinates[0] - this.coordinates[0] * v.coordinates[2],
			this.coordinates[0] * v.coordinates[1] - this.coordinates[1] * v.coordinates[0]
		]);
	}

	//Returns a vector orthogonnal to this one
	GetOrthogonnal(): Vector {
		let mindir: number = 0;
		let coords: number[] = [];
		for (let index: number = 0; index < this.coordinates.length; index++) {
			if (Math.abs(this.coordinates[index]) < Math.abs(this.coordinates[mindir])) {
				mindir = index;
			}
			coords.push(0.0);
		}
		let tmp: Vector = new Vector(coords);
		tmp.Set(mindir, 1.0);
		return this.Cross(tmp).Normalized();
	}

	//Comptute squared norm
	SqrNorm(): number {
		return this.Dot(this);
	}

	//Compute norm
	Norm(): number {
		return Math.sqrt(this.SqrNorm());
	}

	//Normalize current vector
	Normalized(): Vector {
		return this.Times(1 / this.Norm());
	}

	Normalize() {
		let norm = this.Norm();
		for (let index: number = 0; index < this.coordinates.length; index++) {
			this.coordinates[index] /= norm;
		}
	}

	Log = function () {
		let message: string = '| ';
		for (let index: number = 0; index < this.coordinates.length; index++) {
			message += this.coordinates[index] + ((index + 1 < this.coordinates.length) ? '; ' : '');
		}
		message += ' |';
		console.log(message);
	}

	static Null(d: number): Vector {
		let v = new Array(d);
		for (let index = 0; index < d; index++) {
			v[index] = 0;
		}
		return new Vector(v);
	}

	static Spherical(phi: number, theta: number, radius: number) : Vector
	{
		return new Vector([phi, theta, radius]);
	}

	// Transforms spherical coordinates to cartesian coordinates [phi, theta, length]
	// phi is the azimut (angle to X)
	// theta is the latitude/colatitude (angle to Z - depending on the specified representation)
	// length is the vector length
	static SphericalToCartesian(spherical: Vector, representation: SphericalRepresentation = SphericalRepresentation.AzimuthColatitude) : Vector
	{
		let phi = spherical.Get(0);
		let theta = spherical.Get(1);
		let radius = spherical.Get(2);
		switch(representation)
		{
			case SphericalRepresentation.AzimuthColatitude:	
				return new Vector(
					[
						Math.cos(phi) * Math.sin(theta),
						Math.sin(phi) * Math.sin(theta),
						Math.cos(theta)
					]
				).Times(radius);
			case SphericalRepresentation.AzimuthLatitude:
				return new Vector(
					[
						Math.cos(phi) * Math.cos(theta),
						Math.sin(phi) * Math.cos(theta),
						-Math.sin(theta)
					]
				).Times(radius);
			default:
				throw "Erroneous spherical representation";
		}
	}

	static CartesianToSpherical(cartesian: Vector, representation: SphericalRepresentation = SphericalRepresentation.AzimuthColatitude) : Vector
	{
		let norm = cartesian.Norm();
		let theta = 0.;
		let phi = 0.;
		if(norm > 1e-6)
		{
			switch(representation)
			{
				case SphericalRepresentation.AzimuthColatitude:
					theta = Math.acos(cartesian.Get(2) / norm);
					if(theta > 1e-8)
						phi = Math.asin((cartesian.Get(1) / norm) / Math.sin(theta));
					break;
				case SphericalRepresentation.AzimuthLatitude:
					theta = Math.acos(cartesian.Get(2) / norm);
					if(theta > 1e-8)
						phi = Math.asin((cartesian.Get(1) / norm) / Math.sin(theta));
					break;
				default:
					throw "Erroneous spherical representation";
			}
		}
		return Vector.Spherical(phi, theta, norm);
	}
}