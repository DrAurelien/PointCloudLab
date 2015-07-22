// Object handling shapes identifers reservation, so that each new shape has a unic identifier
var ShapesIntentifiers = 
{
	Sphere : 1,
	Cylinder : 1,
	GetIdentifier : function(shape)
	{
		for(var identifier in this)
		{
			if(identifier == shape)
			{
				shape += "-"+this[identifier];
				this[identifier]++;
				return shape;
			}
		}
		throw 'Cannot generate identifier for shape "'+identifier+'"';
	}
}

//Shape class
function Shape(shape)
{
	this.name = ShapesIntentifiers.GetIdentifier(shape);
	this.material = new Material([0.3, 0.75, 0.3]);
	this.selected = false;
}

Shape.prototype.GetProperties = function()
{
	return {
		Name : this.name,
		Geometry : this.GetGeometry(),
		Material : this.material.GetProperties()
	};
}

//Returns a property defining the "vector" parameter
Shape.prototype.MakeVectorProperty = function(vector)
{
	return {
		X : vector.Get(0),
		Y : vector.Get(1),
		Z : vector.Get(2),
	};
}

//Returns a vector defined by the "property" parameter (null if property does not define a valid vector)
Shape.prototype.ParseVectorProperty = function(property)
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

Shape.prototype.ParseRealProperty = function(property)
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
Shape.prototype.SetProperties = function(properties)
{
	try
	{
		if('Name' in properties)
		{
			this.name = properties.Name;
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

Shape.prototype.DrawUnitShape = function(unitShape, drawingContext)
{
	unitShape.Sample(drawingContext.sampling, drawingContext.gl);
	
	this.material.InitializeLightingModel(drawingContext);
	
	drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, unitShape.pointsBuffer);
	drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
	if(unitShape.normalsBuffer)
	{
		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, unitShape.normalsBuffer);
		drawingContext.gl.vertexAttribPointer(drawingContext.normals, 3, drawingContext.gl.FLOAT, false, 0, 0);
	}
	
	if(drawingContext.rendering.Point())
	{
		drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, unitShape.points.length/3);
	}
	
	if(drawingContext.rendering.Surface())
	{
		var sizeOfUnisgnedShort = 2;
		drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, unitShape.indexBuffer);
		for(var index=0; index<unitShape.elements.length; index++)
		{
			var element = unitShape.elements[index];
			drawingContext.gl.drawElements(element.type, element.count, drawingContext.gl.UNSIGNED_SHORT, sizeOfUnisgnedShort*element.from);
		}
	}
	
	if(this.selected)
	{
		var box = this.GetBoundingBox();
		box.Draw(drawingContext);
	}
}
