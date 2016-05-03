//Shape class
function Shape(shape)
{
	CADPrimitive.call(this, shape);
}

//Inheritance
Shape.prototype = Object.create(CADPrimitive.prototype);
Shape.prototype.constructor = Shape;


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

Shape.prototype.DrawUnitShape = function(unitShape, drawingContext)
{
	if(this.visible)
	{
		unitShape.Sample(drawingContext.sampling, drawingContext.gl);
		
		this.material.InitializeLightingModel(drawingContext);
		
		//Surface points
		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, unitShape.pointsBuffer);
		drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
		
		//For lighting model
		if(unitShape.normalsBuffer)
		{
			drawingContext.EnableNormals(true);
			drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, unitShape.normalsBuffer);
			drawingContext.gl.vertexAttribPointer(drawingContext.normals, 3, drawingContext.gl.FLOAT, false, 0, 0);
		}
		else
		{
			drawingContext.EnableNormals(false);
		}
		
		//Points-based rendering
		if(drawingContext.rendering.Point())
		{
			drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, unitShape.points.length/3);
		}
		
		//Surface rendering
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
}
