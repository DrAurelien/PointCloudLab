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
            if (this.GetNextAsciiStr(asciichar.length, false) == asciichar)
                count++;
            this.cursor++;
        }
        return count;
    };
    BinaryReader.prototype.GetAsciiLine = function () {
        return this.GetAsciiUntil(['\r\n', '\n']);
    };
    BinaryReader.prototype.GetAsciiWord = function (onSameLine) {
        var stops = [' '];
        if (onSameLine === false) {
            stops.push('\n');
            stops.push('\r\n');
        }
        return this.GetAsciiUntil(stops);
    };
    BinaryReader.prototype.GetAsciiUntil = function (stops) {
        var result = '';
        while (!this.Eof() && this.Ignore(stops) == 0) {
            result += this.GetNextAsciiChar();
        }
        return result;
    };
    BinaryReader.prototype.Ignore = function (words) {
        var count = 0;
        var match = null;
        do {
            match = this.GetNextMatchingAsciiStr(words, true);
            if (match)
                count++;
        } while (match);
        return count;
    };
    BinaryReader.prototype.GetNextAsciiStr = function (length, move) {
        if (length === void 0) { length = 1; }
        if (move === void 0) { move = true; }
        var result = '';
        var cursor = this.cursor;
        for (var index = 0; result.length < length && !this.Eof(); index++) {
            result += this.GetNextAsciiChar(true);
        }
        if (!move)
            this.cursor = cursor;
        return result;
    };
    BinaryReader.prototype.GetNextMatchingAsciiStr = function (words, move) {
        if (move === void 0) { move = true; }
        for (var index = 0; index < words.length; index++) {
            var word = words[index];
            var next = this.GetNextAsciiStr(word.length, false);
            if (next.toLowerCase() == word.toLowerCase()) {
                if (move)
                    this.cursor += next.length;
                return next;
            }
        }
        return null;
    };
    BinaryReader.prototype.GetNextAsciiChar = function (move) {
        if (move === void 0) { move = true; }
        var result = String.fromCharCode(this.stream.getUint8(this.cursor));
        if (move)
            this.cursor++;
        return result;
    };
    BinaryReader.prototype.GetNextUInt8 = function (move) {
        if (move === void 0) { move = true; }
        var result = this.stream.getInt8(this.cursor);
        if (move)
            this.cursor++;
        return result;
    };
    BinaryReader.prototype.GetNextInt32 = function (move) {
        if (move === void 0) { move = true; }
        var result = this.stream.getInt32(this.cursor, this.endianness == Endianness.LittleEndian);
        if (move)
            this.cursor += 4;
        return result;
    };
    BinaryReader.prototype.GetNextFloat32 = function (move) {
        if (move === void 0) { move = true; }
        var result = this.stream.getFloat32(this.cursor, this.endianness == Endianness.LittleEndian);
        if (move)
            this.cursor += 4;
        return result;
    };
    return BinaryReader;
}());
//# sourceMappingURL=binaryreader.js.map