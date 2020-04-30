var FileExporter = (function () {
    function FileExporter() {
    }
    FileExporter.ExportFile = function (filename, filecontent, filetype) {
        var link = document.createElement('a');
        link.onclick = function () {
            var url = window.URL;
            var blob = new Blob([filecontent], { type: filetype });
            this.href = url.createObjectURL(blob);
            this.target = '_blank';
            this.download = filename;
            if (this.parent) {
                this.parent.removeChild(this);
            }
        };
        link.click();
    };
    return FileExporter;
}());
//# sourceMappingURL=fileexporter.js.map