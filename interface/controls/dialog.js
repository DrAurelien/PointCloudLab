function Dialog(onAccept, onCancel)
{
	this.window = document.createElement('div');
	this.window.className = 'Dialog';
	
	var table = document.createElement('table');
	table.className = 'DialogContent';
	this.window.appendChild(table);
	
	var row = table.insertRow(0);
	var cell = row.insertCell();
	cell.colSpan = 2;
	
	var dialog = this;
	function ApplyAndClose(callback)
	{
		return function()
		{
			if(callback && !callback(dialog))
			{
				return false;
			}
			if(dialog.window.parentNode)
			{
				dialog.window.parentNode.removeChild(dialog.window);
			}
			return true;
		};
	}
	
	var toolbar = Toolbar([
		Button('Ok', ApplyAndClose(onAccept)),
		Button('Cancel', ApplyAndClose(onCancel))
	]);
	cell.appendChild(toolbar);
	
	document.body.appendChild(this.window);
}

Dialog.prototype.InsertItem = function(title, control)
{
	var table = this.window.childNodes[0];
	var row = table.insertRow(table.rows.length - 1);
	var titleCell = row.insertCell();
	titleCell.appendChild(document.createTextNode(title));
	if(control)
	{
		var contentCell = row.insertCell();
		contentCell.appendChild(control);
	}
	else
	{
		titleCell.colSpan = 2;
	}
	return row;
}

Dialog.prototype.InsertTitle = function(title, defaultValue)
{
	var row = this.InsertItem(title);
	var cell = row.cells[0];
	cell.style.fontWeight = 'bold';
	cell.style.textDecoration = 'underline';
	return row;
}

Dialog.prototype.InsertValue = function(title, defaultValue)
{
	var valueControl = document.createElement('input');
	valueControl.type = 'text';
	valueControl.width=20;
	valueControl.value = defaultValue;
	return this.InsertItem(title, valueControl);
}

Dialog.prototype.InsertCheckBox = function(title, defaultValue)
{
	var valueControl = document.createElement('input');
	valueControl.type = 'checkbox';
	valueControl.checked = defaultValue?true:false;
	return this.InsertItem(title, valueControl);
}

Dialog.prototype.GetValue = function(title)
{
	var table = this.window.childNodes[0];
	for(var index=0; index<table.rows.length; index++)
	{
		var row = table.rows[index];
		var rowTitle = row.cells[0].innerText;
		if(rowTitle == title)
		{
			var valueInput = row.cells[1].childNodes[0]
			if(valueInput.type == 'text')
				return valueInput.value;
			else if(valueInput.type == 'checkbox')
				return valueInput.checked;
		}
	}
	return null;
}