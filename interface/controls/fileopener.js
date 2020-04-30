var FileOpener = (function () {
    function FileOpener(label, filehandler, hintMessage) {
        this.label = label;
        this.filehandler = filehandler;
        this.hintMessage = hintMessage;
    }
    FileOpener.prototype.LoadFile = function (file) {
        if (file) {
            var self_1 = this;
            var extension_1 = file.name.split('.').pop();
            var progress_1 = new ProgressBar();
            var reader = new FileReader();
            reader.onloadend = function () {
                progress_1.Delete();
                var fileContent = this.result;
                var loader = null;
                switch (extension_1) {
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
                        alert('The file extension \"' + extension_1 + '\" is not handled.');
                        break;
                }
                if (loader) {
                    function ResultCallback() {
                        self_1.filehandler(loader.result);
                    }
                    loader.Load(ResultCallback);
                }
            };
            reader.onprogress = function (event) {
                progress_1.Update(event.loaded, event.total);
            };
            progress_1.Show();
            progress_1.SetMessage('Loading file : ' + file.name);
            reader.readAsArrayBuffer(file);
        }
    };
    FileOpener.prototype.GetElement = function () {
        var self = this;
        var input = document.createElement('input');
        input.type = 'File';
        input.className = 'FileOpener';
        input.multiple = false;
        input.onchange = function () {
            self.LoadFile(this.files[0]);
        };
        var combo = new ComboBox(this.label, [
            new Action('PLY Mesh', function () {
                input.accept = '.ply';
                input.click();
            }, 'Load a mesh object from a PLY file. Find more about the ply file format on http://paulbourke.net/dataformats/ply/'),
            new Action('CSV Point cloud', function () {
                input.accept = '.csv';
                input.click();
            }, 'Load a point cloud from a CSV file (a semi-colon-separated line for each point). The CSV header is mandatory : "x", "y" and "z" specify the points coordinates, while "nx", "ny" and "nz" specify the normals coordinates.')
        ], this.hintMessage);
        var button = combo.GetElement();
        button.appendChild(input);
        return button;
    };
    return FileOpener;
}());
//# sourceMappingURL=fileopener.js.map