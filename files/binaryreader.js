var Endianness;
(function (Endianness) {
    Endianness[Endianness["BigEndian"] = 0] = "BigEndian";
    Endianness[Endianness["LittleEndian"] = 1] = "LittleEndian";
})(Endianness || (Endianness = {}));
var BinaryReader = /** @class */ (function () {
    function BinaryReader(buffer) {
        this.cursor = 0;
        this.stream = new DataView(buffer);
        this.endianness = Endianness.BigEndian;
        var tmp = new ArrayBuffer(2);
        new DataView(tmp).setInt16(0, 256, true);
        this.innerendianness = (new Int16Array(tmp)[0] === 256 ? Endianness.LittleEndian : Endianness.BigEndian);
    }
    BinaryReader.prototype.Reset = function () {
        this.cursor = 0;
    };
    BinaryReader.prototype.Eof = function () {
        return (this.cursor >= this.stream.byteLength) || (this.stream[this.cursor] == 3);
    };
    BinaryReader.prototype.CountAsciiOccurences = function (asciichar) {
        var count = 0;
        this.Reset();
        while (!this.Eof()) {
            if (this.GetNextAsciiChar() == asciichar) {
                count++;
            }
        }
        return count;
    };
    BinaryReader.prototype.GetAsciiLine = function () {
        return this.GetAsciiUntil(['\n']);
    };
    BinaryReader.prototype.GetAsciiWord = function (onSameLine) {
        var stops = [' '];
        if (onSameLine === false) {
            stops.push('\n');
        }
        return this.GetAsciiUntil(stops);
    };
    BinaryReader.prototype.GetAsciiUntil = function (stops) {
        var result = '';
        function Stop(test) {
            for (var index = 0; index < stops.length; index++) {
                if (test == stops[index]) {
                    return true;
                }
            }
            return false;
        }
        do {
            result += this.GetNextAsciiChar();
        } while (!this.Eof() && !Stop(this.GetCurrentAsciiChar()));
        while (!this.Eof() && Stop(this.GetCurrentAsciiChar())) {
            this.GetNextAsciiChar();
        }
        return result;
    };
    BinaryReader.prototype.GetNextAsciiChar = function () {
        return String.fromCharCode(this.stream.getUint8(this.cursor++));
    };
    BinaryReader.prototype.GetCurrentAsciiChar = function () {
        return String.fromCharCode(this.stream.getUint8(this.cursor));
    };
    BinaryReader.prototype.GetNextUInt8 = function () {
        var result = this.stream.getInt8(this.cursor);
        this.cursor++;
        return result;
    };
    BinaryReader.prototype.GetNextInt32 = function () {
        var result = this.stream.getInt32(this.cursor, this.endianness == Endianness.LittleEndian);
        this.cursor += 4;
        return result;
    };
    BinaryReader.prototype.GetNextFloat32 = function () {
        var result = this.stream.getFloat32(this.cursor, this.endianness == Endianness.LittleEndian);
        this.cursor += 4;
        return result;
    };
    return BinaryReader;
}());
