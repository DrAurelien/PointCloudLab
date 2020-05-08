/// <reference path="../maths/vector.ts" />


interface Pickable {
}

class Picking {
    distance: number;

	constructor(public object: Pickable) {
        this.distance = null;
    }

    HasIntersection(): boolean {
        return this.distance !== null;
    }

    Add(distance: number): void {
        if (this.distance === null || this.distance > distance) {
            this.distance = distance;
        }
    }

    Compare(picking: Picking): number {
		if (this.HasIntersection() && picking.HasIntersection()) {
			if (this.distance < picking.distance) {
				return -1;
			}
			else if (this.distance > picking.distance) {
				return 1;
			}
			return 0;
		}
		else if (this.HasIntersection()) {
			return -1;
		}
		else if (picking.HasIntersection()) {
			return 1;
		}
		return 0;
    }
}

class Ray {
	constructor(public from: Vector, public dir: Vector) {
	}

	GetPoint(distance: number) {
		return this.from.Plus(this.dir.Times(distance));
	}
}