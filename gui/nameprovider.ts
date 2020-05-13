class NameProvider {
	static indices: Object = {};

	static GetName(key: string): string {
		if (!(key in this.indices)) {
			this.indices[key] = 0;
		}

		let name = key + ' ' + this.indices[key];
		this.indices[key]++;
		return name;
	}
}