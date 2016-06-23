function LinesIntersection(a, b)
{
	var d = a.direction.Dot(b.direction);
	var sqrLenA = a.direction.SqrNorm();
	var sqrLenB = b.direction.SqrNorm();

	var s = ((sqrLenA*sqrLenB)-(d*d));
	if(s<=1.0e-12)
	{
		//Aligned axes
		return a.point.Plus(b.point).Times(0.5);
	}
	
	var delta = a.point.Minus(b.point);
	var t1 = delta.Dot(b.direction.Times(d).Minus(a.direction.Times(sqrLenB))) / s;
	var t2 = delta.Dot(b.direction.Times(sqrLenA).Minus(a.direction.Times(d))) / s;

	var r1 = a.point.Plus(a.direction.Times(t1));
	var r2 = b.point.Plus(b.direction.Times(t2));
	
	return r1.Plus(r2).Times(0.5);
}