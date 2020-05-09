/// <reference path="control.ts" />
/// <reference path="combobox.ts" />
/// <reference path="progressbar.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../files/csvloader.ts" />
/// <reference path="../../files/plyloader.ts" />


class FileOpener implements Control {
	constructor(public label: string, public filehandler: Function, private hintMessage?: string) {
	}

	LoadFile(file: File) {
		if (file) {
			let self = this;
			let progress = new ProgressBar();
			let reader = new FileReader();

			reader.onloadend = function () {
				progress.Delete();
				self.LoadFromContent(file.name, <ArrayBuffer>this.result);
			}

			reader.onprogress = function (event) {
				progress.Update(event.loaded, event.total);
			}

			progress.Show();
			progress.SetMessage('Loading file : ' + file.name);
			reader.readAsArrayBuffer(file);
		}
	}

	LoadFromContent(fileName: string, fileContent: ArrayBuffer) {
		let extension = fileName.split('.').pop();
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
			let self = this;
			loader.Load(() => self.filehandler(loader.result));
		}
	}

	GetElement(): HTMLElement {
		var self = this;
		let input: HTMLInputElement = document.createElement('input');
		input.type = 'File';
		input.className = 'FileOpener';
		input.multiple = false;
		input.onchange = function () {
			self.LoadFile(input.files[0]);
		}

		let combo = new ComboBox(this.label, [
			new SimpleAction('PLY Mesh', function () {
				input.accept = '.ply';
				input.click();
			}, 'Load a mesh object from a PLY file. Find more about the ply file format on http://paulbourke.net/dataformats/ply/'),
			new SimpleAction('CSV Point cloud', function () {
				input.accept = '.csv';
				input.click();
			}, 'Load a point cloud from a CSV file (a semi-colon-separated line for each point). The CSV header is mandatory : "x", "y" and "z" specify the points coordinates, while "nx", "ny" and "nz" specify the normals coordinates.')
		], this.hintMessage);

		let button = combo.GetElement();
		button.appendChild(input);
		return button;
	}
}