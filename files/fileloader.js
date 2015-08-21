function LoadFile(file, loadedcallback)
{
	if (file) {
		var extension = file.name.split('.').pop();
		var progress = new ProgressBar();
		var reader = new FileReader();
		
		reader.onloadend = function(event) {
			
			progress.Delete();
			
			event = event || window.event;
			var fileContent = event.target.result;
			switch(extension)
			{
				case 'txt':
				case 'ply':
					if(fileContent)
					{
						loader = new PlyLoader(fileContent);
						function ResultCallback()
						{
							loadedcallback(loader.result);
						}
						loader.Load(ResultCallback);
					}
					break;
				default:
					alert('The file extension \"'+extension+'\" is not handled.');
					break;
			}
		}
		
		reader.onprogress = function(event)
		{
			progress.Update(event.loaded, event.total);
		}
		
		progress.Show();
		progress.SetMessage('Loading file : ' + file.name);
		reader.readAsArrayBuffer(file);
	}
}