function FileOpener(label, filehandler)
{
	var input = document.createElement('input');
	input.type = 'File';
	input.className = 'FileOpener';
	input.multiple = false;
	input.onchange = function() {
		LoadFile(this.files[0], filehandler);
	}
	
	var button = ComboBox(label, [
		{
			label : "PLY mesh",
			callback : function() {
				input.accept = ".ply";
				input.click();
			}
		}
	]);
	
	button.appendChild(input);
	
	return button;
}