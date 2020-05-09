/// <reference path="../control.ts" />
/// <reference path="property.ts" />
/// <reference path="propertygroup.ts" />


class Properties implements Control {
	public onChange: Function;

	constructor(private properties: Property[] = []) {
	}

	Push(property: Property): void {
		this.properties.push(property);
		property.owner = this;
	}

	GetSize(): number {
		return this.properties.length;
	}

	GetProperty(index: number): Property {
		return this.properties[index];
	}

	GetPropertyByName(propertyName: string): Property {
		for (let index = 0; index < this.properties.length; index++) {
			let property = this.properties[index];
			if (property.name == propertyName) {
				return property;
			}
		}
		return null;
	}

	GetValue(propertyName: string): any {
		let property = this.GetPropertyByName(propertyName);
		if (property) {
			return property.GetValue();
		}
		return null;
	}

	NotifyChange(property: Property) {
		if (this.onChange) {
			this.onChange();
		}
	}

	GetElement(): HTMLElement {
		var table = document.createElement('table');
		table.className = 'Properties';
		for (let index = 0; index < this.properties.length; index++) {
			let property = this.properties[index];
			let row = document.createElement('tr');
			row.className = 'Property';
			table.appendChild(row);

			let leftCol = document.createElement('td');
			leftCol.className = 'PropertyName';
			let leftColContent = document.createTextNode(property.name);
			leftCol.appendChild(leftColContent);
			row.appendChild(leftCol);

			if (property instanceof PropertyGroup) {
				leftCol.colSpan = 2;
				let row = document.createElement('tr');
				row.className = 'Property';
				table.appendChild(row);

				let col = document.createElement('td');
				col.colSpan = 2;
				col.className = 'PropertyCompound';
				col.appendChild(property.GetElement());
				row.appendChild(col);
			}
			else {
				let rightCol = document.createElement('td');
				rightCol.className = 'PropertyValue';
				rightCol.appendChild(property.GetElement());
				row.appendChild(rightCol);
			}
		}

		return table;
	}
}