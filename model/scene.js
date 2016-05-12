var Scene =
{
	objects : [],
	
	Draw : function(drawingContext)
	{
		for(index=0; index<this.objects.length; index++)
		{
			if(this.objects[index].visible)
			{
				this.objects[index].Draw(drawingContext);
			}
		}
	},
	
	Select : function(element)
	{
		for(index=0; index<this.objects.length; index++)
		{
			this.objects[index].selected = (this.objects[index] == element);
		}
	},
	
	GetIndex : function(element)
	{
		for(index=0; index<this.objects.length; index++)
		{
			if(this.objects[index] === element)
				return index;
		}
		return -1;
	},
	
	Remove : function(element)
	{
		var index = this.GetIndex(element);
		if(index >= 0)
		{
			this.objects.splice(index, 1);
		}
	}
};