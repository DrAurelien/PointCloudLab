class Light extends Sphere {
	constructor(center: Vector, owner: LightsContainer) {
		super(center, 0.01, null);
		this.owner = owner;
		if (this.owner) {
			this.owner.Add(this);
		}
		this.material.baseColor = [1.0, 1.0, 1.0];
	}

	public get Position(): Vector {
		return this.center;
	}

	public get Color(): number[] {
		return this.material.baseColor;
	}
}