function Matrix(width, height, values)
{
	this.width = width;
	this.height = height;
	this.values = new Array(values.length);
	for(var index=0; index<values.length; index++)
	{
		this.values[index] = values[index];
	}
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

Matrix.prototype.GetColumnVector = function(col)
{
	var values = new Array(this.height);
	for(var index=0; index<this.height; index++)
	{
		values[index] = this.GetValue(index, col);
	}
	return new Vector(values);
}

Matrix.prototype.GetRowVector = function(row)
{
	var values = new Array(this.width);
	for(var index=0; index<this.width; index++)
	{
		values[index] = this.GetValue(row, index);
	}
	return new Vector(values);
}

Matrix.prototype.IsDiagonnal = function(error)
{
	for(var ii=0; ii<this.height; ii++)
	{
		for(var jj=0; jj<this.width; jj++)
		{
			if(ii != jj && Math.abs(this.GetValue(ii, jj)) > error)
			{
				return false;
			}
		}
	}
	return true;
}

Matrix.prototype.LUDecomposition = function()
{
	if(this.width != this.height)
	{
		throw 'Cannot compute LU decomposition for non square matrix';
	}
	
	var LU =
	{
		matrix : NullMatrix(this.width, this.height),
		factor : 1.0,
		swaps : new Array(this.width),
		//Mostly for debug purpose
		GetL : function()
		{
			var result = NullMatrix(this.matrix.width, this.matrix.height);
			for(var ii=0; ii<this.matrix.heigth; ii++)
			{
				result.SetValue(ii, ii, 1.0);
				for(var jj=0; jj<ii; jj++)
				{
					result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
				}
			}
			return result;
		},
		GetU : function()
		{
			var result = NullMatrix(this.matrix.width, this.matrix.height);
			for(var ii=0; ii<this.matrix.heigth; ii++)
			{
				for(var jj=ii; jj<=this.matrix.width; jj++)
				{
					result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
				}
			}
			return result;
		}
	};
	
	for(var ii=0; ii<this.height; ii++)
	{
		for(var jj=0; jj<this.width; jj++)
		{
			LU.matrix.SetValue(ii, jj, this.GetValue(ii, jj));
		}
	}
	
	//Search for the greatest element of each line
	var scale = new Array(LU.matrix.width);
	for(var ii=0; ii<LU.matrix.height; ii++)
	{
		var maxval = 0;
		for(var jj=0; jj<LU.matrix.width; jj++)
		{
			var val = Math.abs(LU.matrix.GetValue(ii, jj));
			if(val > maxval)
			{
				maxval = val;
			}
		}
		if(maxval < 0.000001)
		{
			throw 'Cannot perform LU decomposition of a singular matrix';
		}
		scale[ii] = 1.0/maxval;
	}
	
	//Main loop
	for(var kk=0; kk<LU.matrix.width; kk++)
	{
		//Search for the largest pivot
		var maxval = 0.0;
		var maxindex = kk;
		for(var ii=kk; ii<LU.matrix.height; ii++)
		{
			var val = scale[ii] * Math.abs(LU.matrix.GetValue(ii, kk));
			if(val > maxval)
			{
				maxindex = ii;
				maxval = val;
			}
		}
		//Swap row so that current row has the best pivot
		if(kk != maxindex)
		{
			for(var jj=0; jj<this.width; jj++)
			{
				var tmp = LU.matrix.GetValue(maxindex, jj);
				LU.matrix.SetValue(maxindex, jj, LU.matrix.GetValue(kk, jj));
				LU.matrix.SetValue(kk, jj, tmp);
			}
			var tmp = scale[maxindex];
			scale[maxindex] = scale[kk];
			scale[kk] = tmp;
			//Swap changes parity of the scale factore
			LU.factor = -LU.factor;
		}
		LU.swaps[kk] = maxindex;
		
		for(var ii=kk+1; ii<this.height; ii++)
		{
			var val = LU.matrix.GetValue(ii, kk) / LU.matrix.GetValue(kk, kk);
			LU.matrix.SetValue(ii, kk, val);
			for(var jj=kk+1; jj<this.width; jj++)
			{
				LU.matrix.SetValue(ii, jj, LU.matrix.GetValue(ii, jj) - val * LU.matrix.GetValue(kk, jj));
			}
		}
	}
	
	return LU;
}

//Solve THIS * X = rightHand (rightHand being a matrix)
Matrix.prototype.LUSolve = function(rightHand)
{
	if(rightHand.width != 1 || rightHand.height != this.width)
	{
		throw 'Cannot solve equations system, due to inconsistent dimensions';
	}
	
	var solution = NullMatrix(rightHand.width, rightHand.height);
	for(var ii=0; ii<rightHand.height; ii++)
	{
		solution.SetValue(ii, 0, rightHand.GetValue(ii, 0));
	}
	
	var LU = this.LUDecomposition();
	
	//Solve L * Y = rightHand
	var kk = 0;
	for(var ii=0; ii<rightHand.height; ii++)
	{
		var sum = solution.GetValue(LU.swaps[ii], 0);
		solution.SetValue(LU.swaps[ii], 0, solution.GetValue(ii, 0));
		if(kk != 0)
		{
			for(var jj=kk-1 ; jj<ii; jj++)
			{
				sum -= LU.matrix.GetValue(ii, jj)*solution.GetValue(jj,0);
			}
		}
		else if(sum != 0)
		{
			kk = ii+1;
		}
		solution.SetValue(ii, 0, sum);
	}
	//Solve U * X = Y
	for(var ii=rightHand.height-1; ii>=0; ii--)
	{
		var sum = solution.GetValue(ii, 0);
		for(var jj=ii+1; jj<rightHand.height; jj++)
		{
			sum -= LU.matrix.GetValue(ii, jj)*solution.GetValue(jj,0);
		}
		solution.SetValue(ii, 0, sum / LU.matrix.GetValue(ii, ii));
	}
	return solution;
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

Matrix.prototype.QRDecomposition = function()
{
	//Naive method :
	//https://en.wikipedia.org/wiki/QR_decomposition
	if(this.width != this.height)
	{
		return null;
	}
	
	var QR =
	{
		Q : NullMatrix(this.width, this.width),
		R : NullMatrix(this.width, this.width)
	};
	
	function Projection(e, a)
	{
		return e.Times(e.Dot(a) / e.Dot(e));
	}
	
	var vects = [];
	var normalized = [];
	for(var ii=0; ii<this.width; ii++)
	{
		var vec = this.GetColumnVector(ii);
		var current = vec;
		if(ii > 0)
		{
			//Compute vec - sum[jj<ii](proj(vects[jj], vec))
			for(var jj = 0; jj<ii; jj++)
			{
				var proj = vects[jj].Times( vects[jj].Dot(vec) / vects[jj].Dot(vects[jj]) );
				current = current.Minus(proj);
			}
		}
		vects.push( current );
		
		current = current.Normalized()
		normalized.push(current);
		for(var jj=0; jj<vec.Dimension(); jj++)
		{
			QR.Q.SetValue(jj, ii, current.Get(jj));
			if(jj<=ii)
			{
				QR.R.SetValue(jj, ii, normalized[jj].Dot(vec));
			}
		}
	}
	
	return QR;
}


Matrix.prototype.EigenDecomposition = function()
{
	if(this.width != this.height)
	{
		return null;
	}
	
	var matrix = this;
	var eigenVectors = IdentityMatrix(this.width);
	for(var index = 0; index <= 100; index++)
	{
		var QR = matrix.QRDecomposition();
		matrix = QR.R.Multiply(QR.Q);
		eigenVectors = eigenVectors.Multiply(QR.Q);
		
		if(matrix.IsDiagonnal(1.0e-8))
		{
			var result = [];
			
			for(var ii=0; ii<this.width; ii++)
			{
				result.push({
					eigenValue : matrix.GetValue(ii, ii),
					eigenVector : eigenVectors.GetColumnVector(ii)
				});
			}
			
			function Compare(a, b)
			{
				return (a.eigenValue < b.eigenValue) ? -1 : ((a.eigenValue > b.eigenValue) ? 1 : 0);
			}
			result = result.sort(Compare);
			
			return result;
		}
	}
	return null;
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