//Drawable unit box at (0,0,0)
var UnitBoundingBoxPoints =
{
	points : [],
	indices : [],
	pointsBuffer : null,
	indexBuffer : null,
	elements : [],
	
	Inititalize : function(glContext)
	{
		if(this.points.length == 0)
		{
			this.points = [
				-0.5, -0.5, -0.5,
				-0.5, 0.5, -0.5,
				0.5, 0.5, -0.5,
				0.5, -0.5, -0.5,
				-0.5, -0.5, 0.5,
				-0.5, 0.5, 0.5,
				0.5, 0.5, 0.5,
				0.5, -0.5, 0.5];
			
			this.indices = [
				0, 1, 2, 3,
				4, 5, 6, 7,
				0, 4,
				1, 5,
				2, 6,
				3, 7
			];
			
			this.elements = [
				{from : 0, count : 4, type : glContext.LINE_LOOP},
				{from : 4, count : 4, type : glContext.LINE_LOOP},
				{from : 8, count : 2, type : glContext.LINES},
				{from : 10, count : 2, type : glContext.LINES},
				{from : 12, count : 2, type : glContext.LINES},
				{from : 14, count : 2, type : glContext.LINES}
			];
			
			//Create webgl buffers
			this.pointsBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ARRAY_BUFFER, this.pointsBuffer);
			glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.points), glContext.STATIC_DRAW);
			//indices buffer
			this.indexBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), glContext.STATIC_DRAW);

		}
	}
}

function BoundingBox()
{
	this.min = null;
	this.max = null;
}

BoundingBox.prototype.Set = function(center, size)
{
	var halfSize = size.Times(0.5);
	this.min = center.Minus(halfSize);
	this.max = center.Plus(halfSize);
}

BoundingBox.prototype.GetCenter = function()
{
	return this.min.Plus(this.max).Times(0.5);
}

BoundingBox.prototype.GetSize = function()
{
	return this.max.Minus(this.min);
}

BoundingBox.prototype.Add = function(p)
{
	if(this.min == null || this.max == null)
	{
		this.min = new Vector(p.Flatten());
		this.max = new Vector(p.Flatten());
	}
	else
	{
		for(var index=0; index<p.Dimension(); index++)
		{
			this.min.Set(index, Math.min(this.min.Get(index), p.Get(index)));
			this.max.Set(index, Math.max(this.max.Get(index), p.Get(index)));
		}
	}
}

BoundingBox.prototype.Draw = function(drawingContext)
{
	drawingContext.EnableNormals(false);
	UnitBoundingBoxPoints.Inititalize(drawingContext.gl);
	
	var material = new Material([1.0, 1.0, 0.0]);
	material.InitializeLightingModel(drawingContext);
	
	var size = this.GetSize();
	var center = this.GetCenter();
	var shapetransform = IdentityMatrix(4);
	for(var index=0; index<3; index++)
	{
		shapetransform.SetValue(index, index, size.Get(index));
		shapetransform.SetValue(index, 3, center.Get(index));
	}
	
	drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, drawingContext.gl.FALSE, new Float32Array(shapetransform.values));
	
	drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, UnitBoundingBoxPoints.pointsBuffer);
	drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
	drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, UnitBoundingBoxPoints.indexBuffer);
	var sizeOfUnisgnedShort = 2;
	for(var index=0; index<UnitBoundingBoxPoints.elements.length; index++)
	{
		var element = UnitBoundingBoxPoints.elements[index];
		drawingContext.gl.drawElements(element.type, element.count, drawingContext.gl.UNSIGNED_SHORT, sizeOfUnisgnedShort*element.from);
	}
}