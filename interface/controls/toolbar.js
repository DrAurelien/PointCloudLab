function Toolbar(controls)
{
	var container = document.createElement('table');
	container.width = '100%';
	var containerRow = document.createElement('tr');
	container.appendChild(containerRow);
	
	for(var index=0; index<controls.length; index++)
	{
		var containerCell = document.createElement('td');
		containerRow.appendChild(containerCell);
		containerCell.appendChild(controls[index]);
	}
	
	var toolbar = document.createElement('div');
	toolbar.appendChild(container);
	
	return toolbar;
}