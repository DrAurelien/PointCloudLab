enum Endianness {
	BigEndian,
	LittleEndian
}

class BinaryStream {
	cursor: number;
	stream: DataView;
	endianness: Endianness;

	constructor(public buffer: ArrayBuffer) {
		this.cursor = 0;
		this.stream = buffer ? new DataView(buffer) : null;

		var tmp = new ArrayBuffer(2);
		new DataView(tmp).setInt16(0, 256, true);
		this.endianness = (new Int16Array(tmp)[0] === 256 ? Endianness.LittleEndian : Endianness.BigEndian);
	}

	Reset() {
		this.cursor = 0;
	}

	Eof(): boolean {
		return (this.cursor >= this.stream.byteLength) || (this.stream[this.cursor] == 3);
	}
}