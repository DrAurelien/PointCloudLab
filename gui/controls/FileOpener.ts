/// <reference path="control.ts" />
/// <reference path="combobox.ts" />
/// <reference path="progressbar.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../files/csvloader.ts" />
/// <reference path="../../files/plyloader.ts" />
/// <reference path="../../files/pclloader.ts" />
/// <reference path="../../files/objloader.ts" />


class FileOpener extends Button {
	input: HTMLInputElement;

	constructor(public label: string, public filehandler: Function, hintMessage?: string) {
		super(new SimpleAction(label, () => this.UploadFile(), hintMessage));

		let self = this;
		this.input = document.createElement('input');
		this.input.type = 'File';
		this.input.className = 'FileOpener';
		this.input.multiple = false;
		this.input.onchange = function () {
			self.LoadFile(self.input.files[0]);
		}
	}

	private UploadFile() {
		this.input.value = null;
		this.input.accept = '.ply,.csv,.pcld,.obj';
		this.input.click();
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
			reader.onabort = function (event) {
				console.warn('File loading aborted');
			}
			reader.onloadstart = function (event) {
				console.log('Start loading file');
			}
			reader.onerror = function (event) {
				console.error('Error while loading file');
			}

			progress.Show();
			progress.SetMessage('Loading file : ' + file.name);
			reader.readAsArrayBuffer(file);
		}
	}

	LoadFromContent(fileName: string, fileContent: ArrayBuffer) {
		if (fileContent) {
			let extension = fileName.split('.').pop().toLocaleLowerCase();
			let loader: FileLoader = null;
			switch (extension) {
				case 'ply': loader = new PlyLoader(fileContent); break;
				case 'csv': loader = new CsvLoader(fileContent); break;
				case 'pcld': loader = new PCLLoader(fileContent); break;
				case 'obj': loader = new ObjLoader(fileContent); break;
				default:
					alert('The file extension \"' + extension + '\" is not handled.');
					break;
			}

			if (loader) {
				let self = this;
				loader.Load(
					(result: PCLNode) => { self.filehandler(result); },
					(error: string) => { alert(error); }
				);
			}
		}
	}
}