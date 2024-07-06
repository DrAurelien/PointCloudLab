/// <reference path="binarystream.ts" />


class BinaryReader extends BinaryStream {
	private static Whitespaces : string[] = [' ', '\t'];
	private static Linebreaks : string[] = ['\n', '\r\n'];
	private static Allwhitespaces : string[] = (() =>{ return BinaryReader.Whitespaces.concat(BinaryReader.Linebreaks);})();

	constructor(buffer: ArrayBuffer) {
		super(buffer);
	}

	CountAsciiOccurences(asciichar: string): number {
		var count = 0;
		this.Reset();
		while (!this.Eof()) {
			if (this.GetNextAsciiStr(asciichar.length, false) == asciichar)
				count++;
			this.cursor++;
		}
		return count;
	}

	GetAsciiLine(): string {
		let result = this.GetAsciiUntil(BinaryReader.Linebreaks);
		this.Ignore(BinaryReader.Linebreaks);
		return result;
	}

	GetAsciiWord(stayOnSameLine: boolean = false): string {
		let result = this.GetAsciiUntil(BinaryReader.Allwhitespaces);
		this.Ignore(stayOnSameLine ? BinaryReader.Whitespaces : BinaryReader.Allwhitespaces);
		return result;
	}

	GetAsciiUntil(stops: string[]): string {
		let result = '';
		while (!this.Eof() && !this.GetNextMatchingAsciiStr(stops, false)) {
			result += this.GetNextAsciiChar();
		}
		return result;
	}

	IgnoreBytes(count: number) {
		this.cursor += count;
	}

	Ignore(words: string[]): number {
		let count = 0;
		let match = null;
		do {
			match = this.GetNextMatchingAsciiStr(words, true);
			if (match)
				count++;
		} while (match)
		return count;
	}

	IgnoreWhiteSpaces(includeLineBreaks: boolean = true): number
	{
		return this.Ignore(includeLineBreaks ? BinaryReader.Allwhitespaces : BinaryReader.Whitespaces);
	}

	GetNextAsciiStr(length: number = 1, move: boolean = true): string {
		let result = '';
		let cursor = this.cursor;
		for (let index = 0; result.length < length && !this.Eof(); index++) {
			result += this.GetNextAsciiChar(true);
		}
		if (!move)
			this.cursor = cursor;
		return result;
	}

	GetNextMatchingAsciiStr(words: string[], move: boolean = true): string {
		for (let index = 0; index < words.length; index++) {
			let word = words[index];
			let next = this.GetNextAsciiStr(word.length, false);
			if (next.toLowerCase() == word.toLowerCase()) {
				if (move)
					this.cursor += next.length;
				return next;
			}
		}
		return null;
	}

	GetNextAsciiChar(move: boolean = true): string {
		let result = String.fromCharCode(this.stream.getUint8(this.cursor));
		if (move)
			this.cursor++;
		return result;
	}

	GetNextString(length: number, move: boolean = true): string {
		let cursor = this.cursor;
		let result = '';
		for (let index = 0; index < length && !this.Eof(); index++) {
			result += this.GetNextAsciiChar(true);
		}
		if (!move) {
			this.cursor = cursor;
		}
		return result;
	}

	GetNextUInt8(move: boolean = true): number {
		let result = this.stream.getInt8(this.cursor);
		if (move)
			this.cursor++;
		return result;
	}

	GetNextInt32(move: boolean = true): number {
		var result = this.stream.getInt32(this.cursor, this.endianness == Endianness.LittleEndian);
		if (move)
			this.cursor += 4;
		return result;
	}

	GetNextFloat32(move: boolean = true): number {
		var result = this.stream.getFloat32(this.cursor, this.endianness == Endianness.LittleEndian);
		if (move)
			this.cursor += 4;
		return result;
	}

	GetNextUILenghedString(move: boolean = true): string {
		let cursor = this.cursor;
		let length = this.GetNextUInt8(true);
		let result = this.GetNextString(length, true);
		if (!move) {
			this.cursor = cursor;
		}
		return result;
	}
}