//////////////////////////////////////
// PLY element
//////////////////////////////////////

function PlyElement(name, count)
{
	this.name = name;
	this.count = count;
	this.definition = [];
	this.items = [];
}

PlyElement.prototype.PushDefinitionProperty = function(name, type, params)
{
	//Check the property has not already been defined
	for(var index=0; index<this.definition.length; index++)
	{
		if(this.definition[index].name == name)
		{
			throw 'the property \"' + name + '\" already exists for element \"' + this.name + '\"';
		}
	}
	this.definition.push({
		name : name,
		type : type,
		params : params});
}

PlyElement.prototype.CastValue = function(value, defIndex)
{
	var type = this.definition[defIndex].type;
	if(type == 'list')
	{
		type = this.definition[defIndex].params[1];
	}
	switch(type)
	{
		case 'float':
			return parseFloat(value);
			break;
		case 'int':
			return parseInt(value);
			break;
		default:
			return value;
	}
}

PlyElement.prototype.PrepareItem = function(item)
{
	var itemIndex = 0;
	var storedItem = {};
	for(var index=0; storedItem!= null && index<this.definition.length; index++)
	{
		if(itemIndex<item.length)
		{
			if(this.definition[index].type == 'list')
			{
				var length = parseInt(item[itemIndex++]);
				if(itemIndex+length<=item.length)
				{
					var values = new Array(length);
					for(var cursor = 0; cursor<length; cursor++)
					{
						values[cursor] = this.CastValue(item[itemIndex++], index)
					}
					storedItem[this.definition[index].name] = values;
				}
				else
				{
					storedItem = null;
				}
			}
			else
			{
				storedItem[this.definition[index].name] = this.CastValue(item[itemIndex++], index);
			}
		}
		else
		{
			storedItem = null;
		}
	}
	if(itemIndex != item.length)
	{
			storedItem = null;
	}
	
	if(storedItem == null)
	{
		throw 'inconsistent item : expecting ' + itemIndex + ' properties for element \"' + this.name + '\", found '+item.length;	
	}
	
	return storedItem;
}

PlyElement.prototype.PushItem = function(item)
{
	var expected;
	var found;
	
	if(this.definition.length == 0)
	{
		throw 'no definition provided for element \"' + this.name + '\"';
	}
	
	this.items.push(this.PrepareItem(item));
}

PlyElement.prototype.IsFilled = function()
{
	return (this.count == this.items.length);
}

PlyElement.prototype.GetItem = function(index)
{
	return this.items[index];
}

PlyElement.prototype.NbItems = function(itemsindex)
{
	return this.items.length;
}

//////////////////////////////////////
// Elements collection handler
//////////////////////////////////////
function PlyElements()
{
	this.elements = [];
	this.current = 0;
}

PlyElements.prototype.PushElement = function(name, count)
{
	this.elements.push(new PlyElement(name, count));
	this.current = this.elements.length-1;
}

PlyElements.prototype.GetCurrent = function()
{
	if(this.current < this.elements.length)
	{
		return this.elements[this.current];
	}
	return null;
}

PlyElements.prototype.GetElement = function(name)
{
	for(var index=0; index<this.elements.length; index++)
	{
		if(this.elements[index].name == name)
		{
			return this.elements[index];
		}
	}
	return null;
}

PlyElements.prototype.ResetCurrent = function()
{
	this.current = 0;
}

PlyElements.prototype.NbElements = function()
{
	return this.elements.length;
}

PlyElements.prototype.PushItem = function(item)
{
	var currentElement = null;
	while((currentElement = this.GetCurrent()) != null && currentElement.IsFilled())
	{
		this.current++;
	}
	if(currentElement == null)
	{
		throw 'all the elements have been filled with items.'
	}
	currentElement.PushItem(item);
}

//////////////////////////////////////////
// PLY File Loader
//////////////////////////////////////////
function PlyLoader(content)
{
	this.lines = content.split('\n');
	this.lineindex = 0;
	this.elements = new PlyElements();
	this.result = null;
}

PlyLoader.prototype.Load = function(onloaded)
{	
	function Error(message)
	{
		throw 'PLY ERROR [@ line '+this.lineindex+'] : ' + message;
	}
	
	//Firt line shoul be 'PLY'
	if(this.lines.length < 2 || this.lines[this.lineindex++].toLowerCase() != 'ply')
	{
		Error('this is not a valid PLY file');
	}
	
	//Second line indicates the PLY format
	var format = this.lines[this.lineindex++].split(' ');
	if(format[1].toLowerCase() != 'ascii')
	{
		Error('non ASCII ply files are not supported');
	}
	
	//Then should be the header
	var inHeader = true;
	do
	{
		if(this.lineindex >= this.lines.length)
		{
			Error('unexpected end of file while parsing header');
		}
		var currentLine = this.lines[this.lineindex++].split(' ');
		switch(currentLine[0].toLowerCase())
		{
			case 'element':
				if(currentLine.length == 3)
				{
					this.elements.PushElement(
						currentLine[1].toLowerCase(), //name
						parseInt(currentLine[2]) //count
					);
				}
				else{
					Error("element definition format error");
				}
				break;
			case 'property':
				try {
					var currentElement = this.elements.GetCurrent();
					if(currentLine)
					{
						if(currentLine.length>2)
						{
							currentElement.PushDefinitionProperty(
								currentLine[currentLine.length-1].toLowerCase(), //name
								currentLine[1].toLowerCase(), //type
								(currentLine.length>3)?currentLine.slice(2,-1): null
							);
						}
						else{
							Error("property definition format error");
						}
					}
					else
					{
						Error('unexpected property, while no element has been introduced');
					}
				}
				catch(exception) { Error(exception); }
				break;
			case 'comment':
				//ignore
				break;
			case 'end_header':
				inHeader = false;
				break;
			default :
				Error('unexpected header line');
		}
	}while(inHeader);
	
	if(this.elements.NbElements() == 0)
	{
		Error('no element definition has been found in file header');
	}
	
	//Read PLY body content
	
	var self = this;
	function LoadItems()
	{
		if(self.lineindex>=self.lines.length)
		{
			return null;
		}
		var line = self.lines[self.lineindex++].trim();
		//ignore blank this.lines
		if(line != "")
		{
			var currentItem = line.split(' ');
			try {
				self.elements.PushItem(currentItem);
			}
			catch( exception ) { Error(exception); }
		}
		
		return {current : self.lineindex, total : self.lines.length};
	}

	function ComputeNormals()
	{
		self.result.ComputeNormals();
		if(onloaded)
		{
			onloaded();
		}
	}

	function BuildMesh()
	{
		var faces = self.elements.GetElement('face');
		if(faces)
		{
			if(!self.result)
			{
				Error("faces defined without vertices");
			}
			self.result = new Mesh(self.result);
			self.result.Reserve(faces.NbItems());
			var index=0;
			
			//Load mesh faces from faces list
			function PushFace()
			{
				if(index>=faces.NbItems())
				{
					return null;
				}
				var face = faces.GetItem(index++);
				self.result.PushFace(face.vertex_indices);
				
				return {current : index, total : faces.NbItems()};
			}
			
			LongProcess('Loading PLY mesh (step 3/3)', PushFace, ComputeNormals);
		}
	}

	function BuildCloud()
	{
		var vertices = self.elements.GetElement('vertex');
		if(vertices)
		{
			self.result = new PointCloud();
			self.result.Reserve(vertices.NbItems());
			var index = 0;
			
			//Load point cloud from vertices list
			function PushVertex()
			{
				if(index>=vertices.NbItems())
				{
					return null;
				}
				
				var vertex = vertices.GetItem(index++);
				self.result.PushPoint(new Vector([
					vertex.x,
					vertex.y,
					vertex.z
				]));
				
				return {current : index, total : vertices.NbItems()};
			}
			
			LongProcess('Loading PLY vertices (step 2 / 3)', PushVertex, BuildMesh);
		}
	}

	this.elements.ResetCurrent();
	LongProcess('Parsing PLY content (step 1 / 3)', LoadItems, BuildCloud);
}