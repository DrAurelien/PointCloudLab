enum Endianness
{
	BigEndian,
	LittleEndian
}

class BinaryReader {
	cursor: number;
	stream: DataView;
	endianness: Endianness;
	private innerendianness: Endianness;

	constructor(buffer : ArrayBuffer) {
		this.cursor = 0;
		this.stream = new DataView(buffer);
		this.endianness = Endianness.BigEndian;

		var tmp = new ArrayBuffer(2);
		new DataView(tmp).setInt16(0, 256, true);
		this.innerendianness = (new Int16Array(tmp)[0] === 256 ? Endianness.LittleEndian : Endianness.BigEndian);
	}

	Reset() {
		this.cursor = 0;
	}

	Eof(): boolean {
		return (this.cursor >= this.stream.byteLength) || (this.stream[this.cursor] == 3);
	}

	CountAsciiOccurences(asciichar: string): number {
		var count = 0;
		this.Reset();
		while (!this.Eof()) {
			if (this.GetNextAsciiChar() == asciichar) {
				count++;
			}
		}
		return count;
	}

	GetAsciiLine(): string {
		return this.GetAsciiUntil(['\n']);
	}

	GetAsciiWord(onSameLine: boolean): string {
		var stops = [' '];
		if (onSameLine === false) {
			stops.push('\n');
		}
		return this.GetAsciiUntil(stops);
	}

	GetAsciiUntil(stops: string[]): string {
		let result = '';

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
		}
		while (!this.Eof() && !Stop(this.GetCurrentAsciiChar()))

		while (!this.Eof() && Stop(this.GetCurrentAsciiChar())) {
			this.GetNextAsciiChar();
		}

		return result;
	}

	GetNextAsciiChar() : string {
		return String.fromCharCode(this.stream.getUint8(this.cursor++));
	}

	GetCurrentAsciiChar(): string {
		return String.fromCharCode(this.stream.getUint8(this.cursor));
	}

	GetNextUInt8(): number {
		let result = this.stream.getInt8(this.cursor);
		this.cursor++;
		return result;
	}

	GetNextInt32(): number {
		var result = this.stream.getInt32(this.cursor, this.endianness == Endianness.LittleEndian);
		this.cursor += 4;
		return result;
	}

	GetNextFloat32(): number {
		var result = this.stream.getFloat32(this.cursor, this.endianness == Endianness.LittleEndian);
		this.cursor += 4;
		return result;
	}
}