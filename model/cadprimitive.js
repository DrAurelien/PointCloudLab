// Object handling CADPrimitives identifers reservation, so that each new CADPrimitive has a unic identifier
var Identifiers = 
{
	GetIdentifier : function(primitive)
	{
		if(primitive in this)
		{
			this[primitive]++;
		}
		else
		{
			this[primitive] = 1;
		}
		return primitive+"-"+this[primitive];
	}
}

//CADPrimitive class
function CADPrimitive(primitive)
{
	this.name = Identifiers.GetIdentifier(primitive);
	this.material = new Material([0.3, 0.75, 0.3]);
	this.selected = false;
	this.visible = true;
}

CADPrimitive.prototype.GetProperties = function()
{
	var properties = {
		Name : this.name,
		Visible : this.visible?"1":"0",
		Material : this.material.GetProperties()
	};
	var geometry = this.GetGeometry();
	if(geometry)
	{
		properties.Geometry = geometry;
	}
	return properties;
}

CADPrimitive.prototype.GetActions = function(onDone)
{
	return [];
}

//Returns a property defining the "vector" parameter
CADPrimitive.prototype.MakeVectorProperty = function(vector)
{
	return {
		X : vector.Get(0),
		Y : vector.Get(1),
		Z : vector.Get(2),
	};
}

//Returns a vector defined by the "property" parameter (null if property does not define a valid vector)
CADPrimitive.prototype.ParseVectorProperty = function(property)
{
	var result = null;
	try
	{
		result = new Vector([
				parseFloat(property.X),
				parseFloat(property.Y),
				parseFloat(property.Z)
		]);	
		for(var index=0; index<3; index++)
		{
			if(isNaN(result.Get(index)))
			{
				return null;
			}
		}
	}
	catch(exception)
	{
		return null;
	}
	return result;
}

CADPrimitive.prototype.ParseRealProperty = function(property)
{
	var result = null;
	try
	{
		result = parseFloat(property);
		if(isNaN(result))
		{
			return null;
		}
	}
	catch(exception)
	{
		return null;
	}
	return result;
}

//Update
CADPrimitive.prototype.SetProperties = function(properties)
{
	try
	{
		if('Name' in properties)
		{
			this.name = properties.Name;
		}
		
		if('Visible' in properties)
		{
			this.visible = (properties.Visible)=="1";
		}
		
		if('Geometry' in properties)
		{
			if(!this.SetGeometry(properties.Geometry))
			{
				return false;
			}
		}
		
		if('Material' in properties)
		{
			if(!this.material.SetProperties(properties.Material))
			{
				return false;
			}
		}
	}
	catch(exception)
	{
		return false;
	}
	return true;
};

CADPrimitive.prototype.SetGeometry = function(properties)
{
}

CADPrimitive.prototype.GetGeometry = function()
{
	return null;
}
