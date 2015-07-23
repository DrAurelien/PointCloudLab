function Matrix(width, height, values)
{
	this.width = width;
	this.height = height;
	this.values = values;
}

Matrix.prototype.FlatIndex = function(row, col)
{
	//Column-Major flat storage
	return row + col*this.width;
}

Matrix.prototype.SetValue = function(row, col, value)
{
	this.values[this.FlatIndex(row, col)] = value;
}

Matrix.prototype.GetValue = function(row, col)
{
	return this.values[this.FlatIndex(row, col)];
}

Matrix.prototype.Times = function(s)
{
	var result = new Array(this.width*this.height);
	for(var index=0; index<this.values.length; index++)
	{
		result[index] = this.values[index] * s;
	}
	return new Matrix(this.width, this.height, result);
}

Matrix.prototype.Multiply = function(m)
{
	if(this.width != m.height)
	{
		throw 'Cannot multiply matrices whose dimension do not match';
	}
	var result = NullMatrix(m.width, this.height);
	for(var ii=0; ii<this.height; ii++)
	{
		for(var jj=0; jj<m.width; jj++)
		{
			var value = 0;
			for(var kk=0; kk<this.width; kk++)
			{
				value += this.GetValue(ii, kk) * m.GetValue(kk, jj);
			}
			result.SetValue(ii, jj, value);
		}
	}
	return result;
}

Matrix.prototype.Transposed = function()
{
	var transposed = NullMatrix(this.height, this.width);
	for(var ii=0; ii<this.height; ii++)
	{
		for(var jj=0; jj<this.width; jj++)
		{
			transposed.SetValue(jj, ii, this.GetValue(ii, jj));
		}
	}
	return transposed;
}

Matrix.prototype.MultiplyRow = function(row, scalar)
{
	for(var index=0; index<this.width; index++)
	{
		this.SetValue(row, index, scalar*this.GetValue(row, index));
	}
}

//Set targetrow += row*scalar
Matrix.prototype.CombineRows = function(targetrow, row, scalar)
{
	for(var index=0; index<this.width; index++)
	{
		this.SetValue(targetrow, index,
			this.GetValue(targetrow, index)+
			scalar*this.GetValue(row, index));
	}
}

Matrix.prototype.SwapRows = function(srcrow, destrow)
{
	for(var index=0; index<this.width; index++)
	{
		var tmp = this.GetValue(srcrow, index);
		this.SetValue(srcrow, index, this.GetValue(destrow, index));
		this.SetValue(destrow, index, tmp);
	}
}

Matrix.prototype.GetLeadingValueIndex = function(row)
{
	for(var index=0; index<this.width; index++)
	{
		if(this.SetValue(row, index)>0)
			return index;
	}
	return null;
}

Matrix.prototype.IsRowEchelon = function()
{
	for(var index=0; index<this.height; index++)
	{
		var leadingIndex = this.GetLeadingValueIndex(index);
		for(var row=index; row<this.height; row++)
		{
			if(this.GetValue(row, leadingIndex) != 0)
			{
				return false;
			}
		}
	}
	return true;
}

Matrix.prototype.IsRowReduced = function()
{
	for(var index=0; index<this.height; index++)
	{
		var leadingIndex = this.GetLeadingValueIndex(index);
		for(var row=0; row<this.height; row++)
		{
			if(this.GetValue(row, leadingIndex) != 0)
			{
				return false;
			}
		}
	}
	return true;
}

Matrix.prototype.Inverted = function()
{
	if(this.width != this.height)
	{
		throw "Cannot invert non square matrices";
	}
	
	var left = new Matrix(this.width, this.height, new Array(this.width*this.height));
	var right = new Matrix(this.width, this.height, new Array(this.width*this.height));
	for(var ii=0; ii<this.height; ii++)
	{
		for(var jj=0; jj<this.width; jj++)
		{
			right.SetValue(ii, jj, ii==jj?1.0:0.0);
			left.SetValue(ii, jj, this.GetValue(ii, jj));
		}
	}
	
	//Gauss-Jordan Pivot
	while(!left.IsRowEchelon())
	{
		//Get Leading row
		leftmostLeading = 0;
		leadingIndex = left.GetLeadingValueIndex(0)
		for(var index=1; index<left.height; left++)
		{
			var leading = left.GetLeadingValueIndex(index);
			if(leadingIndex==null || leading<leadingIndex)
			{
				leftmostLeading = index;
				leadingIndex = index;
			}
		}
		
		//TODO : swap and combine until row echelon
	}
	while(!left.IsRowReduced())
	{
		//TODO : swap and combine until row reduced
	}
	//TODO : multiply each line to make left identity
	return right;
}

Matrix.prototype.Log = function()
{
	console.log('Matrix ' + this.height + ' x ' + this.width + ' : ');
	for(var ii=0; ii<this.height; ii++)
	{
		var line = '| ';
		for(var jj=0; jj<this.width; jj++)
		{
			line += this.GetValue(ii, jj) + ((jj+1<this.width)?'; ':'');
		}
		line += ' |';
		console.log(line);
	}
}

///////////////////////////////////////
// Builders
///////////////////////////////////////
function NullMatrix(width, height)
{
	var values = new Array(width*height);
	for(var index=0; index<values.length; index++)
	{
		values[index] = 0.0;
	}
	return new Matrix(width, height, values);
}

function IdentityMatrix(dimension)
{
	var result = NullMatrix(dimension, dimension);
	for(var index=0; index<dimension; index++)
	{
		result.SetValue(index, index, 1.0);
	}
	return result;
}

///////////////////////////////////////
// Uniform matrices for geometry
///////////////////////////////////////

function TranslationMatrix(v)
{
	var result = new IdentityMatrix(4);
	for(var index=0; index<3; index++)
	{
		result.SetValue(index, 3, v.Get(index));
	}
	return result;
}

function RotationMatrix(axis, angle)
{
	var result = IdentityMatrix(4);
	var c = Math.cos(angle);
	var s = Math.sin(angle);
	var x = axis.Get(0);
	var y = axis.Get(1);
	var z = axis.Get(2);
	
	result.SetValue(0, 0, x*x+(1-(x*x))*c);
	result.SetValue(0, 1, x*y*(1-c)-z*s);
	result.SetValue(0, 2, x*z*(1-c)+y*s);
	
	result.SetValue(1, 0, x*y*(1-c)+z*s);
	result.SetValue(1, 1, y*y+(1-(y*y))*c);
	result.SetValue(1, 2, y*z*(1-c)-x*s);
	
	result.SetValue(2, 0, x*z*(1-c)-y*s);
	result.SetValue(2, 1, y*z*(1-c)+x*s);
	result.SetValue(2, 2, z*z+(1-(z*z))*c);
	
	return result;
}