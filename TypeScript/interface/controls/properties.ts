class Properties implements Control {
	constructor(private storage: Object = {}) {
		this.storage = this.storage || {};
	}

	Push(key: string, value: any): void {
		this.storage[key] = value;
	}

	PushVector(key: string, value: Vector): void {
		let vec: Object = {};
		vec['X'] = value.Get(0);
		vec['Y'] = value.Get(1);
		vec['Z'] = value.Get(2);
		this.Push(key, vec);
	}

	PushProperties(key: string, value: Properties): void {
		this.Push(key, value.storage);
	}

	Get(key: string): any {
		return this.storage[key];
	}

	GetAsFloat(key: string): number {
		var result = null;
		try {
			let stored: string = '' + this.Get(key);
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
		let result: Vector;
		let vecProperties = this.GetAsProperties(key);
		result = new Vector([vecProperties.GetAsFloat('X'), vecProperties.GetAsFloat('Y'), vecProperties.GetAsFloat('Z')]);
		for (let index = 0; index < 3; index++) {
			if (isNaN(result.Get(index))) {
				return null;
			}
		}
		return result;
	}

	GetAsProperties(key: string): Properties {
		let result = new Properties(this.storage[key]);
		return result;
	}

	private static OjectToTable(properties: Object): HTMLTableElement {
		var table = document.createElement('table');
		table.className = 'Properties';
		for (var property in properties) {
			var row = document.createElement('tr');
			row.className = 'Property';

			var leftCol = document.createElement('td');
			leftCol.className = 'PropertyName';
			var leftColContent = document.createTextNode(property);
			leftCol.appendChild(leftColContent);
			row.appendChild(leftCol);

			var rightCol = document.createElement('td');
			var rightColContent;
			if (properties[property] instanceof Object) {
				rightCol.className = 'PropertyComplexValue';
				rightColContent = Properties.OjectToTable(properties[property]);
			}
			else {
				rightCol.className = 'PropertyValue';
				rightColContent = document.createElement('input');
				rightColContent.type = 'text';
				rightColContent.width = 20;
				rightColContent.className = 'PropertyValue';
				rightColContent.value = properties[property];
			}
			rightCol.appendChild(rightColContent);
			row.appendChild(rightCol);

			table.appendChild(row);
		}

		return table;
	}

	GetElement(): HTMLElement {
		return Properties.OjectToTable(this.storage);
	}
}