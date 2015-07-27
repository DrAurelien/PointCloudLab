var Scene =
{
	objects : [],
	
	Draw : function(drawingContext)
	{
		for(index=0; index<this.objects.length; index++)
		{
			this.objects[index].Draw(drawingContext);
		}
	},
	
	Select : function(element)
	{
		for(index=0; index<this.objects.length; index++)
		{
			this.objects[index].selected = (this.objects[index] == element);
		}
	}
};