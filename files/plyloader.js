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
var PlyDefinition = /** @class */ (function () {
    function PlyDefinition(name, type, params) {
        this.name = name;
        this.type = type;
        this.params = params;
    }
    return PlyDefinition;
}());
var PlyElement = /** @class */ (function () {
    function PlyElement(name, count) {
        this.name = name;
        this.count = count;
        this.definition = [];
        this.items = [];
    }
    PlyElement.prototype.PushDefinitionProperty = function (name, type, params) {
        //Check the property has not already been defined
        for (var index = 0; index < this.definition.length; index++) {
            if (this.definition[index].name == name) {
                throw 'the property \"' + name + '\" already exists for element \"' + this.name + '\"';
            }
        }
        this.definition.push(new PlyDefinition(name, type, params));
    };
    PlyElement.prototype.GetNextValue = function (reader, format, type) {
        if (reader.Eof()) {
            throw 'reached end of file while parsing PLY items';
        }
        switch (format) {
            case 'ascii':
                {
                    var value = reader.GetAsciiWord(true);
                    if (value == '') {
                        throw 'reached end of line while parsing PLY item (incomplete item specification with regard to defintion of ' + this.name + ')';
                    }
                    switch (type) {
                        case 'uchar':
                        case 'int':
                            return parseInt(value);
                        case 'float':
                            return parseFloat(value);
                    }
                    break;
                }
            case 'binary':
                {
                    switch (type) {
                        case 'uchar':
                        case 'uint8':
                            return reader.GetNextUInt8();
                        case 'int':
                        case 'int32':
                            return reader.GetNextInt32();
                        case 'float':
                        case 'float32':
                            return reader.GetNextFloat32();
                    }
                    break;
                }
        }
        return null;
    };
    PlyElement.prototype.ParseItem = function (reader, format) {
        var storedItem = {};
        for (var index = 0; index < this.definition.length; index++) {
            if (this.definition[index].type == 'list') {
                var length = this.GetNextValue(reader, format, this.definition[index].params[0]);
                var values = new Array(length);
                for (var cursor = 0; cursor < length; cursor++) {
                    values[cursor] = this.GetNextValue(reader, format, this.definition[index].params[1]);
                }
                storedItem[this.definition[index].name] = values;
            }
            else {
                storedItem[this.definition[index].name] = this.GetNextValue(reader, format, this.definition[index].type);
            }
        }
        return storedItem;
    };
    PlyElement.prototype.PushItem = function (reader, format) {
        var expected;
        var found;
        if (this.definition.length == 0) {
            throw 'no definition provided for element \"' + this.name + '\"';
        }
        this.items.push(this.ParseItem(reader, format));
        if (format == 'ascii') {
            reader.GetAsciiLine();
        }
    };
    PlyElement.prototype.IsFilled = function () {
        return (this.count == this.items.length);
    };
    PlyElement.prototype.GetItem = function (index) {
        return this.items[index];
    };
    PlyElement.prototype.NbItems = function () {
        return this.items.length;
    };
    return PlyElement;
}());
//////////////////////////////////////
// Elements collection handler
//////////////////////////////////////
var PlyElements = /** @class */ (function () {
    function PlyElements() {
        this.elements = [];
        this.current = 0;
    }
    PlyElements.prototype.PushElement = function (name, count) {
        this.elements.push(new PlyElement(name, count));
        this.current = this.elements.length - 1;
    };
    PlyElements.prototype.GetCurrent = function () {
        if (this.current < this.elements.length) {
            return this.elements[this.current];
        }
        return null;
    };
    PlyElements.prototype.GetElement = function (name) {
        for (var index = 0; index < this.elements.length; index++) {
            if (this.elements[index].name == name) {
                return this.elements[index];
            }
        }
        return null;
    };
    PlyElements.prototype.ResetCurrent = function () {
        this.current = 0;
    };
    PlyElements.prototype.NbElements = function () {
        return this.elements.length;
    };
    PlyElements.prototype.PushItem = function (reader, format) {
        var currentElement = null;
        while ((currentElement = this.GetCurrent()) != null && currentElement.IsFilled()) {
            this.current++;
        }
        if (currentElement == null) {
            throw 'all the elements have been filled with items.';
        }
        currentElement.PushItem(reader, format);
    };
    return PlyElements;
}());
//////////////////////////////////////////
// PLY File Loader
//////////////////////////////////////////
var PlyLoader = /** @class */ (function () {
    function PlyLoader(content) {
        this.Load = function (onloaded) {
            function Error(message) {
                throw 'PLY ERROR : ' + message;
            }
            //Firt line shoul be 'PLY'
            if (this.reader.Eof() || this.reader.GetAsciiLine().toLowerCase() != 'ply') {
                Error('this is not a valid PLY file (line 1)');
            }
            //Second line indicates the PLY format
            if (!this.reader.Eof()) {
                var format = this.reader.GetAsciiLine().split(' ');
                if (format.length == 3 || format[0].toLowerCase() != 'format') {
                    format = format[1].toLowerCase();
                    if (format == 'binary_big_endian') {
                        format = 'binary';
                        this.reader.endianness = Endianness.BigEndian;
                    }
                    else if (format == 'binary_little_endian') {
                        format = 'binary';
                        this.reader.endianness = Endianness.LittleEndian;
                    }
                    else if (format != 'ascii') {
                        Error('unsuported PLY format "' + format + '" (line 2)');
                    }
                }
                else {
                    Error('invalid ply format specification (line 2)');
                }
            }
            else {
                Error('this is not a valid PLY file (line 2)');
            }
            //Then should be the header
            var inHeader = true;
            do {
                if (this.reader.Eof()) {
                    Error('unexpected end of file while parsing header');
                }
                var currentLine = this.reader.GetAsciiLine().split(' ');
                switch (currentLine[0].toLowerCase()) {
                    case 'element':
                        if (currentLine.length == 3) {
                            this.elements.PushElement(currentLine[1].toLowerCase(), //name
                            parseInt(currentLine[2]) //count
                            );
                        }
                        else {
                            Error("element definition format error");
                        }
                        break;
                    case 'property':
                        try {
                            var currentElement = this.elements.GetCurrent();
                            if (currentLine) {
                                if (currentLine.length > 2) {
                                    currentElement.PushDefinitionProperty(currentLine[currentLine.length - 1].toLowerCase(), //name
                                    currentLine[1].toLowerCase(), //type
                                    (currentLine.length > 3) ? currentLine.slice(2, -1) : null);
                                }
                                else {
                                    Error("property definition format error");
                                }
                            }
                            else {
                                Error('unexpected property, while no element has been introduced');
                            }
                        }
                        catch (exception) {
                            Error(exception);
                        }
                        break;
                    case 'comment':
                    case 'obj_info':
                        //ignore
                        break;
                    case 'end_header':
                        inHeader = false;
                        break;
                    default:
                        Error('unexpected header line');
                }
            } while (inHeader);
            if (this.elements.NbElements() == 0) {
                Error('no element definition has been found in file header');
            }
            //Read PLY body content
            this.elements.ResetCurrent();
            var loader = new ItemsLoader(this.reader, this.elements, format);
            loader
                .SetNext(new CloudBuilder(this.elements))
                .SetNext(new MeshBuilder(this.elements))
                .SetNext(new Finalizer(this))
                .SetNext(function (f) { return onloaded(f.result); });
            loader.Start();
        };
        this.reader = new BinaryReader(content);
        this.elements = new PlyElements();
        this.result = null;
    }
    return PlyLoader;
}());
//////////////////////////////////////////
// PLY elements loading process
//////////////////////////////////////////
var ItemsLoader = /** @class */ (function (_super) {
    __extends(ItemsLoader, _super);
    function ItemsLoader(reader, elements, format) {
        var _this = _super.call(this, 'Parsing PLY content') || this;
        _this.reader = reader;
        _this.elements = elements;
        _this.format = format;
        return _this;
    }
    ItemsLoader.prototype.Step = function () {
        try {
            this.elements.PushItem(this.reader, this.format);
        }
        catch (exception) {
            Error(exception);
        }
    };
    Object.defineProperty(ItemsLoader.prototype, "Done", {
        get: function () { return this.reader.Eof(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ItemsLoader.prototype, "Current", {
        get: function () { return this.reader.stream.byteOffset; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ItemsLoader.prototype, "Target", {
        get: function () { return this.reader.stream.byteLength; },
        enumerable: true,
        configurable: true
    });
    return ItemsLoader;
}(LongProcess));
//////////////////////////////////////////
// Build point cloud from loaded ply vertices
//////////////////////////////////////////
var CloudBuilder = /** @class */ (function (_super) {
    __extends(CloudBuilder, _super);
    function CloudBuilder(elements) {
        var _this = _super.call(this, 0, 'Loading PLY vertices') || this;
        _this.elements = elements;
        return _this;
    }
    CloudBuilder.prototype.Initialize = function (caller) {
        this.vertices = this.elements.GetElement('vertex');
        if (this.vertices) {
            this.nbsteps = this.vertices.NbItems();
            this.cloud = new PointCloud();
            this.cloud.Reserve(this.nbsteps);
        }
    };
    CloudBuilder.prototype.Iterate = function (step) {
        var vertex = this.vertices.GetItem(step);
        this.cloud.PushPoint(new Vector([vertex.x, vertex.y, vertex.z]));
    };
    return CloudBuilder;
}(IterativeLongProcess));
//////////////////////////////////////////
// Build mesh from loaded ply faces, if any
//////////////////////////////////////////
var MeshBuilder = /** @class */ (function (_super) {
    __extends(MeshBuilder, _super);
    function MeshBuilder(elements) {
        var _this = _super.call(this, 0, 'Loading PLY mesh') || this;
        _this.elements = elements;
        return _this;
    }
    MeshBuilder.prototype.Initialize = function (caller) {
        this.faces = this.elements.GetElement('face');
        if (this.faces) {
            if (!caller.cloud)
                throw "faces defined without vertices";
            this.nbsteps = this.faces.NbItems();
            this.result = new Mesh(caller.cloud);
            this.result.Reserve(this.nbsteps);
        }
    };
    MeshBuilder.prototype.Iterate = function (step) {
        var face = this.faces.GetItem(step);
        this.result.PushFace(face.vertex_indices);
    };
    return MeshBuilder;
}(IterativeLongProcess));
//////////////////////////////////////////
//  Finalize the result
//////////////////////////////////////////
var Finalizer = /** @class */ (function (_super) {
    __extends(Finalizer, _super);
    function Finalizer(loader) {
        var _this = _super.call(this) || this;
        _this.loader = loader;
        return _this;
    }
    Finalizer.prototype.Initialize = function (caller) {
        this.result = caller.result;
    };
    Finalizer.prototype.Run = function (ondone) {
        this.loader.result = this.result;
        if (this.result instanceof Mesh) {
            this.result.ComputeNormals(function (m) {
                m.ComputeOctree(ondone);
                return true;
            });
        }
        else {
            ondone();
        }
    };
    return Finalizer;
}(Process));
//# sourceMappingURL=plyloader.js.map