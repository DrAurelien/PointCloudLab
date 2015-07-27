function PlyLoader(content)
{
	var lines = content.split('\n');
	var index = 0;
	var elements = [];
	
	//Firt line shoul be 'PLY'
	if(lines.length < 2 || lines[index++].toLowerCase() != 'ply')
	{
		throw 'PLY ERROR : This is not a real PLY file';
	}
	
	//Second line indicates the PLY format
	var format = lines[index++].split(' ');
	if(format[1].toLowerCase() != 'ascii')
	{
		throw 'PLY ERROR : Non ASCII ply files are not supported';
	}
	
	//Then should be the header
	var inHeader = true;
	do
	{
		if(index >= lines.length)
		{
			throw 'PLY ERROR : unexpected end of file while parsing header';
		}
		var currentLine = lines[index++].split(' ');
		switch(currentLine[0].toLowerCase())
		{
			case 'element':
				elements.push({
					name : currentLine[1].toLowerCase(),
					count : parseInt(currentLine[2]),
					definition : [],
					list : []
				});
				break;
			case 'property':
				if(elements.length == 0)
				{
					throw 'PLY ERROR : unexpected property at line ' + index;
				}
				var currentElementDefinition = elements[elements.length];
				currentElementDefinition.push({
					name : currentLine[2].toLowerCase(),
					type : currentLine[1].toLowerCase()
				});
				break;
			case 'comment':
				//ignore
				break;
			case 'end_header':
				inHeader = false;
				break;
			default :
				throw 'PLY ERROR : unexpected header line at line ' + index;
		}
	}while(inHeader);
	
	if(elements.length == 0)
	{
		throw 'PLY ERROR : No element definition has been found in file header';
	}
	
	var currentElementIndex = 0;
	var currentElement = elements[0];
	while(index<lines.length)
	{
		var currentItem = lines[index++].split(' ');
		if(currentItem.length != currentElement.definition.length)
		{
			throw 'PLY ERROR : inconsistent element at line '+index+' (expecting '+currentElement.definition.length+' properties for element '+currentElementIndex+', found '+currentItem.length+')';
		}
		if(currentElement.list.length==currentElement.count)
		{
			if(currentElementIndex >= elements.length)
			{
				throw 'PLY ERROR : too many elements regarding header definition (starting from line '+index+')';
			}
			currentElement = elements[currentElementIndex++];
		}
	}
	
	var result = null;
	for(var index=0; index<elements.length; index++)
	{
		if(element.name == 'vertex')
		{
			result = new PointCloud();
			
			//Load vertex definition
			var definition = {};
			for(var cursor = 0; cursor<element.defintion.length; cursor++)
			{
				defintion[element.defintion[cursor]] = cursor;
			}
			if(!('x' in definition) || !('y' in definition) || !('z' in definition))
			{
				throw 'PLY ERROR : incomplete defintion of vertex element';
			}
			
			//Load point cloud from vertices list
			for(var cursor = 0; cursor<element.list.length; cursor++)
			{
				result.PushPoint(new Vector([
					element.list[cursor][definition.x],
					element.list[cursor][definition.y],
					element.list[cursor][definition.z]
				]));
			}
		}
	}
	
	return result;
}