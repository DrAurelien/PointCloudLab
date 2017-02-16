class FileOpener implements Control {
	constructor(public label: string, public filehandler: Function) {
	}

	LoadFile(file: File) {
		if (file) {
			let self = this;
			let extension = file.name.split('.').pop();
			let progress = new ProgressBar();
			let reader = new FileReader();

			reader.onloadend = function () {
				progress.Delete();

				let fileContent = this.result;
				let loader: FileLoader = null;
				switch (extension) {
					case 'ply':
						if (fileContent) {
							loader = new PlyLoader(fileContent);
						}
						break;
					case 'csv':
						if (fileContent) {
							loader = new CsvLoader(fileContent);
						}
						break;
					default:
						alert('The file extension \"' + extension + '\" is not handled.');
						break;
				}

				if (loader) {
					function ResultCallback() {
						self.filehandler(loader.result);
					}
					loader.Load(ResultCallback);
				}
			}

			reader.onprogress = function (event) {
				progress.Update(event.loaded, event.total);
			}

			progress.Show();
			progress.SetMessage('Loading file : ' + file.name);
			reader.readAsArrayBuffer(file);
		}
	}

	GetElement(): HTMLElement {
		var self = this;
		let input: HTMLInputElement = document.createElement('input');
		input.type = 'File';
		input.className = 'FileOpener';
		input.multiple = false;
		input.onchange = function () {
			self.LoadFile(this.files[0]);
		}

		let combo = new ComboBox(this.label, [
			new Action('PLY Mesh', function () {
				input.accept = '.ply';
				input.click();
			}),
			new Action('CSV Point cloud', function () {
				input.accept = '.csv';
				input.click();
			})
		]);

		let button = combo.GetElement();
		button.appendChild(input);
		return button;
	}
}