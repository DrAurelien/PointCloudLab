/// <reference path="../control.ts" />
/// <reference path="property.ts" />
/// <reference path="propertygroup.ts" />


//==========================================
// Provides a way to get a list of propeties as a displayable table
//==========================================
class Properties implements Control {
	public onChange: Function;
	private element: HTMLTableElement;

	constructor(private properties: Property[] = []) {
	}

	Push(property: Property): void {
		this.properties.push(property);
		property.owner = this;
		if (this.element) {
			this.AddPropertyElement(property);
		}
		this.NotifyChange(property);
	}

	Refresh() {
		for (let index = 0; index < this.properties.length; index++) {
			this.properties[index].Refresh();
		}
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
		this.element = document.createElement('table');
		this.element.className = 'Properties';
		for (let index = 0; index < this.properties.length; index++) {
			this.AddPropertyElement(this.properties[index]);
		}
		return this.element;
	}

	private AddPropertyElement(property: Property) {
		let row = document.createElement('tr');
		row.className = 'Property';
		this.element.appendChild(row);

		let leftCol = document.createElement('td');
		leftCol.className = 'PropertyName';
		let leftColContent = document.createTextNode(property.name);
		leftCol.appendChild(leftColContent);
		row.appendChild(leftCol);

		if (property instanceof PropertyGroup) {
			leftCol.colSpan = 2;
			let row = document.createElement('tr');
			row.className = 'Property';
			this.element.appendChild(row);

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
}