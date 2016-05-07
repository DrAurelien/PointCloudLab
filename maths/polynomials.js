//Coefs are given from lowest degree to higher degree
function Polynomial(coefs)
{
	this.coefficients = coefs;
}

Polynomial.prototype.Degree = function()
{
	return coefficients.length;
}

Polynomial.prototype.Evaluate = function(x)
{
	var result = 0;
	var yy = 1;
	for(var index=0; index<this.coefficients.length; index++)
	{
		result += yy * this.coefficients[index];
		yy *= x;
	}
	return result;
}

Polynomial.prototype.Derivate = function()
{
	var coefs = [];
	for(var index=1; index<this.coefficients; index++)
	{
		coefs.push(index*this.coefficients[index]);
	}
	
	return new Polynomial(coefs);
}

Polynomial.prototype.FindRealRoots = function()
{
	var result = [];
	
	//TODO (Laguerre's method ?)
	
	return result;
}