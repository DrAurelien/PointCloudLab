class Properties {
	private storage: Object;
	private current: Object;

	constructor() {
		this.storage = {};
		this.current = this.storage;
	}

	Select(key?: string): Properties {
		this.current = key ? this.current[key] : this.storage;
		return this;
	}

	Push(key: string, value: any): void {
		this.current[key] = value;
	}

	PushVector(key: string, value: Vector): void {
		let vec: Object = {};
		vec['X'] = value.Get(0);
		vec['Y'] = value.Get(1);
		vec['Z'] = value.Get(2);
		this.Push(key, vec);
	}

	Get(key: string): any {
		return this.current[key];
	}

	GetAsFloat(key: string): number {
		var result = null;
		try {
			let stored : string = '' + this.Get(key);
			result = parseFloat(stored);
			if (isNaN(result)) {
				return null;
			}
		}
		catch (exception) {
			return null;
		}
		return result;
	}

	GetAsVector(key: string): Vector {
		let restore = this.current;
		let result: Vector;
		this.Select(key);
		result = new Vector([this.GetAsFloat('X'), this.GetAsFloat('Y'), this.GetAsFloat('Z')]);
		for (let index = 0; index < 3; index++) {
			if (isNaN(result.Get(index))) {
				return null;
			}
		}
		this.current = restore;
		return result;
	}
}