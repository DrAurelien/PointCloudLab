var FileExporter = /** @class */ (function () {
    function FileExporter() {
    }
    FileExporter.ExportFile = function (filename, filecontent, filetype) {
        var link = document.createElement('a');
        link.onclick = function () {
            var url = window.URL;
            var blob = new Blob([filecontent], { type: filetype });
            link.href = url.createObjectURL(blob);
            link.target = '_blank';
            link.download = filename;
            if (link.parentElement) {
                link.parentElement.removeChild(link);
            }
        };
        link.click();
    };
    return FileExporter;
}());
