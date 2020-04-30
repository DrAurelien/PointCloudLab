class VectorProperty extends PropertyGroup {
	constructor(name: string, private vector: Vector, private normalize: boolean = false, handler: PropertyChangeHandler = null) {
		super(name, null, handler);

		let self = this;
		this.Add(new NumberProperty('X', vector.Get(0), (x) => self.UpdateValue(0, x)));
		this.Add(new NumberProperty('Y', vector.Get(1), (y) => self.UpdateValue(1, y)));
		this.Add(new NumberProperty('Z', vector.Get(2), (z) => self.UpdateValue(2, z)));
	}

	private UpdateValue(index, value) {
		this.vector.Set(index, value);
		if (this.normalize) {
			this.vector.Normalize();
		}
	}

	GetValue(): Vector {
		return new Vector([
			this.properties.GetValue('X'),
			this.properties.GetValue('Y'),
			this.properties.GetValue('Z')
		]);
	}
}