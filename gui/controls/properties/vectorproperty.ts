/// <reference path="property.ts" />
/// <reference path="propertygroup.ts" />
/// <reference path="propertywithvalue.ts" />
/// <reference path="numberproperty.ts" />
/// <reference path="../../../maths/vector.ts" />


class VectorProperty extends PropertyGroup {
	constructor(name: string, private vector: PropertyValueProvider<Vector>, private normalize: boolean = false, handler: PropertyChangeHandler = null) {
		super(name, null, null);

		let self = this;
		this.Add(new NumberProperty('X', () => vector().Get(0), (x) => self.UpdateValue(0, x)));
		this.Add(new NumberProperty('Y', () => vector().Get(1), (y) => self.UpdateValue(1, y)));
		this.Add(new NumberProperty('Z', () => vector().Get(2), (z) => self.UpdateValue(2, z)));
		//The change handler might be invoked curing the construction, above. Wait for the whole thing to be ready, before the change handler is set
		this.changeHandler = handler;
	}

	private UpdateValue(index, value) {
		let vect = this.vector();
		vect.Set(index, value);
		if (this.normalize) {
			vect.Normalize();
			this.properties.Refresh();
		}
		this.NotifyChange();
	}

	GetValue(): Vector {
		return new Vector([
			this.properties.GetValue('X'),
			this.properties.GetValue('Y'),
			this.properties.GetValue('Z')
		]);
	}
}