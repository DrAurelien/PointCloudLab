class PropertyGroup extends Property {
	public properties: Properties;

	constructor(name: string, properties?: Properties, handler: PropertyChangeHandler = null) {
		super(name, handler);

		//Forward change notifications
		this.properties = properties || new Properties();
		this.properties.onChange = () => this.NotifyChange();
	}

	Add(property: Property) {
		this.properties.Push(property);
	}

	GetElement(): HTMLElement {
		return this.properties.GetElement();
	}

	GetValue(): Object {
		let result = {};
		let nbProperties = this.properties.GetSize();
		for (let index = 0; index < nbProperties; index++)
		{
			let property = this.properties.GetProperty(index);
			result[property.name] = property.GetValue();
		}
		return result;
	}
}