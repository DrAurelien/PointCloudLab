function ExportFile(filename, filecontent)
{
	var link = document.createElement('a');
	
	link.onclick = function()
	{
		var contentData = 'data:application/csv;charset=utf-8,' 
					   + encodeURIComponent(filecontent);
		this.href = contentData;
		this.target = '_blank';
		this.download = filename;
		if(this.parent)
		{
			this.parent.removeChild(this);
		}
	}
	link.click();
}