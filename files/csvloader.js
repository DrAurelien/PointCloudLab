var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CsvLoader = /** @class */ (function (_super) {
    __extends(CsvLoader, _super);
    function CsvLoader(content) {
        var _this = _super.call(this) || this;
        _this.parser = new CSVParser(content);
        _this.result = null;
        return _this;
    }
    CsvLoader.prototype.Load = function (ondone) {
        var self = this;
        this.result = new PointCloud();
        this.parser.SetNext(function (p) {
            self.result = p.cloud;
            ondone();
        });
        this.parser.Start();
    };
    return CsvLoader;
}(FileLoader));
var CSVParser = /** @class */ (function (_super) {
    __extends(CSVParser, _super);
    function CSVParser(content) {
        var _this = _super.call(this, 0, 'Parsing CSV file content') || this;
        _this.separator = ';';
        _this.lineseparator = '\n';
        _this.reader = new BinaryReader(content);
        return _this;
    }
    CSVParser.prototype.Initialize = function (caller) {
        this.header = null;
        this.headermapping = null;
        this.done = false;
        this.cloud = new PointCloud();
        this.nbsteps = this.reader.CountAsciiOccurences(this.lineseparator);
        this.reader.Reset();
    };
    CSVParser.prototype.Iterate = function (step) {
        var line = this.ParseCurrentLine();
        if (line) {
            if (!this.header) {
                this.SetHeader(line);
            }
            else {
                var point = this.GetVector(line, ['x', 'y', 'z']);
                if (point) {
                    this.cloud.PushPoint(point);
                    var normal = this.GetVector(line, ['nx', 'ny', 'nz']);
                    if (normal) {
                        this.cloud.PushNormal(normal);
                    }
                }
            }
        }
        else {
            this.done = true;
        }
    };
    Object.defineProperty(CSVParser.prototype, "Done", {
        get: function () { return this.done; },
        enumerable: true,
        configurable: true
    });
    CSVParser.prototype.SetHeader = function (line) {
        this.header = {};
        for (var index = 0; index < line.length; index++) {
            var key = line[index];
            if (this.headermapping) {
                if (key in this.headermapping) {
                    key = this.headermapping[key];
                }
                else {
                    console.warn('Cannot map "' + key + '" to a valid data, given the specified CSV mapping');
                    key = null;
                }
            }
            if (key) {
                this.header[key] = index;
            }
        }
    };
    CSVParser.prototype.ParseCurrentLine = function () {
        if (this.reader.Eof()) {
            return null;
        }
        var line = this.reader.GetAsciiUntil([this.lineseparator]);
        if (line) {
            return line.split(this.separator);
        }
        return null;
    };
    CSVParser.prototype.GetVector = function (line, data) {
        var result = [];
        for (var index = 0; index < data.length; index++) {
            var key = data[index];
            if (key in this.header) {
                key = this.header[key];
                try {
                    var value = parseFloat(line[key]);
                    result.push(value);
                }
                catch (e) {
                    result = null;
                }
            }
            else {
                result = null;
            }
            if (!result) {
                return null;
            }
        }
        return new Vector(result);
    };
    return CSVParser;
}(IterativeLongProcess));
