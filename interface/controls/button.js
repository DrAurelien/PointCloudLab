function Button(label, callback)
{
	var button = document.createElement('div');
	button.className = 'Button';
	var buttonLabel = document.createTextNode(label);
	button.appendChild(buttonLabel);
	
	if(callback)
	{
		button.onclick = callback;
	}
	
	return button;
}