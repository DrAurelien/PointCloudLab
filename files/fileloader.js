function LoadFile(file, loadedcallback)
{
	if (file) {
		var extension = file.name.split('.').pop();
		
		var reader = new FileReader();
		reader.onloadend = function(event) {
			event = event || window.event;
			var fileContent = event.target.result;
			switch(extension)
			{
				case 'txt':
				case 'ply':
					if(fileContent)
					{
						loadedcallback(PlyLoader(fileContent));
					}
					break;
				default:
					alert('The file extension \"'+extension+'\" is not handled.');
					break;
			}
		}
		reader.readAsText(file);
	}
}