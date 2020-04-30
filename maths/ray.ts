class Ray {
    constructor(public from: Vector, public dir: Vector) {
    }

	GetPoint(distance: number) {
		return this.from.Plus(this.dir.Times(distance));
	}
}