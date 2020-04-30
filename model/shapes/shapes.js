//Shape class
function Shape(shape)
{
	CADPrimitive.call(this, shape);
}

//Inheritance
Shape.prototype = Object.create(CADPrimitive.prototype);
Shape.prototype.constructor = Shape;

Shape.prototype.Draw = function(drawingContext)
{
	if(!this.mesh)
	{
		this.mesh = this.ComputeMesh(drawingContext.sampling);
	}
	this.DrawMesh(this.mesh, drawingContext);
}

Shape.prototype.DrawMesh = function(mesh, drawingContext)
{
	if(this.visible)
	{
		mesh.material = this.material;
		mesh.Draw(drawingContext);
		
		if(this.selected)
		{
			var box = this.GetBoundingBox();
			box.Draw(drawingContext);
		}
	}
}

Shape.prototype.GetActions = function(onDone)
{
	var shape = this;
	var result = [];
	if(this.ComputeMesh)
	{
		result.push({
			label : 'Create mesh',
			callback : function() {
				var dialog = new Dialog(
					function(properties)
					{
						var sampling;
						try
						{
							sampling = parseInt(properties.GetValue('Sampling'));
						}
						catch(exc)
						{
							return false;
						}
						var mesh = shape.ComputeMesh(sampling);
						onDone(mesh);
						return true;
					},
					function()
					{
						return true;
					}
				);
				dialog.InsertValue('Sampling', 30);
			}
		});
	}
	return result;
}