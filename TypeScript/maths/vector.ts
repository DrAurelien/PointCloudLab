class Vector {
    coordinates: number[];

    constructor(coords) {
        this.coordinates = new Array(coords.length);
        for (var index = 0; index < coords.length; index++) {
            this.coordinates[index] = coords[index];
        }
    }

    Flatten() : number[] {
        return this.coordinates;
    }

    Dimension() : number {
        return this.coordinates.length;
    }

    Get = function (index : number) : number {
        return this.coordinates[index];
    }

    Set = function (index : number, value : number) : void {
        this.coordinates[index] = value;
    }

    //Sum of two vectors
    Plus(v : Vector) : Vector {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot add vectors with different dimensions'
        }
        let result : number[] = new Array(this.coordinates.length);
        for (let index : number = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] + v.coordinates[index];
        }
        return new Vector(result);
    }

    //Difference between two vectors
    Minus(v : Vector) : Vector {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot compute difference between vectors with different dimensions'
        }
        let result : number[] = new Array(this.coordinates.length);
        for (let index : number = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] - v.coordinates[index];
        }
        return new Vector(result);
    }

    //Multiply a vector by a scalar
    Times(s : number) : Vector {
        let result : number[] = new Array(this.coordinates.length);
        for (let index : number = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] * s;
        }
        return new Vector(result);
    }

    //Dot product
    Dot(v : Vector) : number {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot compute difference between vectors with different dimensions'
        }
        let result : number = 0;
        for (let index : number = 0; index < this.coordinates.length; index++) {
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
    GetOrthogonnal() : Vector {
        let mindir : number = 0;
        let coords : number[] = [];
        for (let index : number = 0; index < this.coordinates.length; index++) {
            if (Math.abs(this.coordinates[index]) < Math.abs(this.coordinates[mindir])) {
                mindir = index;
            }
            coords.push(0.0);
        }
        let tmp : Vector = new Vector(coords);
        tmp.Set(mindir, 1.0);
        return this.Cross(tmp).Normalized();
    }

    //Comptute squared norm
    SqrNorm() : number {
        return this.Dot(this);
    }

    //Compute norm
    Norm() : number {
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
        let message : string = '| ';
        for (let index :number = 0; index < this.coordinates.length; index++) {
            message += this.coordinates[index] + ((index + 1 < this.coordinates.length) ? '; ' : '');
        }
        message += ' |';
        console.log(message);
    }
}