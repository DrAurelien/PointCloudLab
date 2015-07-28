function FileOpener(label, filehandler)
{
	var button = document.createElement('div');
	button.className = 'FileOpener';
	button.appendChild(document.createTextNode(label));
	
	var input = document.createElement('input');
	input.type = 'File';
	input.className = 'FileOpener';
	input.multiple = false;
	input.onchange = function() {LoadFile(this.files[0], filehandler); }
	
	button.onclick = function(event) {	input.click(); }
	button.appendChild(input);
	
	return button;
}