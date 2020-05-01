class FileExporter {
	static ExportFile(filename: string, filecontent: string, filetype: string) {
		let link: HTMLAnchorElement = document.createElement('a');

		link.onclick = function () {
			var url = window.URL;
			var blob = new Blob([filecontent], { type: filetype });
			link.href = url.createObjectURL(blob);
			link.target = '_blank';
			link.download = filename;
			if (link.parentElement) {
				link.parentElement.removeChild(link);
			}
		}
		link.click();
	}
}