function CsvLoader(content)
{
	this.cursor = 0;
	this.reader = new BinaryReader(content);
	this.header = null;
	this.separator = ';';
	this.lineseparator = '\n';
	this.headermapping = null;
	this.result = null;
}

CsvLoader.prototype.Load = function(ondone)
{
	this.result = new PointCloud();
	var self = this;
	var index = 0;
	var total = this.reader.CountAsciiOccurences(this.lineseparator);
	
	this.reader.Reset();
	LongProcess('Parsing CSV file content', function() {	
			var line = self.ParseCurrentLine();
			if(!line)
			{
				return null;
			}
		
			if(!self.header)
			{
				self.SetHeader(line);
			}
			else
			{
				var point = self.GetVector(line, ['x', 'y', 'z']);
				if(point)
				{
					self.result.PushPoint(point);
					var normal = self.GetVector(line, ['nx', 'ny', 'nz']);
					if(normal)
					{
						self.result.PushNormal(normal);
					}
				}
			}
			index++;
			
			return {current : index, total : total};
		},
		ondone
	);
}

CsvLoader.prototype.SetHeader = function(line)
{
	this.header = {};
	for(var index=0; index<line.length; index++)
	{
		var key = line[index];
		if(this.headermapping)
		{
			if(key in this.headermapping)
			{
				key = this.headermapping[key];
			}
			else
			{
				console.warn('Cannot map "' + key + '" to a valid data, given the specified CSV mapping');
				key = null;
			}
		}
		if(key)
		{
			this.header[key] = index;
		}
	}
}

CsvLoader.prototype.GetVector = function(line, data)
{
	var result = [];
	for(var index=0; index<data.length; index++)
	{
		var key = data[index];
		if(key in this.header)
		{
			key = this.header[key];
			try
			{
				var value = parseFloat(line[key]);
				result.push(value);
			}
			catch(e)
			{
				result = null;
			}
		}
		else
		{
			result = null;
		}
		
		if(!result)
		{
			return null;
		}
	}
	return new Vector(result);
}

CsvLoader.prototype.ParseCurrentLine = function()
{
	if(this.reader.Eof())
	{
		return null;
	}
	var line = this.reader.GetAsciiUntil([this.lineseparator]);
	if(line)
	{
		return line.split(this.separator);
	}
	return null;
}