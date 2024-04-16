class Interval
{
	min : number;
	max : number;

	constructor()
	{
		this.min = null;
		this.max = null;
	}

	Add(n: number)
	{
		if(this.min === null || n < this.min)
			this.min = n;
		if(this.max === null || n > this.max)
			this.max = n;
	}

	IsValid() : boolean
	{
		return this.min !== null && this.max !== null;
	}
}