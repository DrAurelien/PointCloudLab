/// <reference path="binarystream.ts" />


class BinaryWriter extends BinaryStream {
	static BlockSize = 4096;

	constructor() {
		super(new ArrayBuffer(BinaryWriter.BlockSize));
	}

	private IncreaseSizeIfNeeded(increment: number) {
		if (this.cursor + increment >= this.buffer.byteLength) {
			let newbuffer = new ArrayBuffer(this.buffer.byteLength + BinaryWriter.BlockSize);
			for (let index = 0; index < this.buffer.byteLength; index++) {
				newbuffer[index] = this.buffer[index];
			}
			this.buffer = newbuffer;
		}
	}

	PushUInt8(value: number) {
		this.IncreaseSizeIfNeeded(1);
		this.stream.setUint8(this.cursor, value);
		this.cursor++;
	}

	PushInt32(value: number) {
		this.IncreaseSizeIfNeeded(4);
		this.stream.setInt32(this.cursor, value, this.endianness == Endianness.LittleEndian);
		this.cursor += 4;
	}

	PushFloat32(value: number) {
		this.IncreaseSizeIfNeeded(4);
		this.stream.setFloat32(this.cursor, value, this.endianness == Endianness.LittleEndian);
		this.cursor += 4;
	}

	PushString(value: string) {
		this.IncreaseSizeIfNeeded(value.length);
		for (let index = 0; index < value.length; index++) {
			this.stream.setUint8(this.cursor, value.charCodeAt(index));
			this.cursor ++;
		}
	}

	PushUILenghedString(value: string) {
		this.PushUInt8(value.length);
		this.PushString(value);
	}
}