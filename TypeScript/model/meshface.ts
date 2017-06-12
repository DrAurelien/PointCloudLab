﻿class MeshFace {
	private normal: Vector;
	private boundingbox: BoundingBox;

	constructor(public indices: number[], public points: Vector[]) {
    }

    LineFaceIntersection(line: Ray): number {
        //Compute line / face intersection
        //solve line.from + t * line.dir
        let dd = this.Normal.Dot(this.points[0]);
        let nn = line.dir.Dot(this.Normal);
        if (Math.abs(nn) < 1e-6) {
            return null;
        }
        let tt = (dd - line.from.Dot(this.Normal)) / nn;

        let point = line.from.Plus(line.dir.Times(tt));

        //Check the point is inside the triangle
        for (let ii = 0; ii < 3; ii++) {
            let test = point.Minus(this.points[ii]).Cross(this.points[(ii + 1) % 3].Minus(this.points[ii]));
            if (test.Dot(this.Normal) > 0) {
                return null;
            }
        }
        return tt;
    }

	get Normal(): Vector {
		if (!this.normal) {
			this.normal = this.points[1].Minus(this.points[0]).Cross(this.points[2].Minus(this.points[0])).Normalized();
		}
		return this.normal;
	}

	get BoundingBox(): BoundingBox {
		if (!this.boundingbox) {
			this.boundingbox = new BoundingBox();
			for (let index = 0; index < this.points.length; index++) {
				this.boundingbox.Add(this.points[index]);
			}
		}
		return this.boundingbox;
	}

	IntersectBox(box: BoundingBox): boolean {
		//Separated axis theorem : search for a separation axis
		if (!this.BoundingBox.Intersect(box)) {
			return false;
		}

		//Todo : Normal cross edges ?

		return box.TestAxisSeparation(this.points[0], this.Normal);
	}
}