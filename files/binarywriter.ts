/// <reference path="binarystream.ts" />


class BinaryWriter extends BinaryStream {

	constructor(size: number) {
		super(size ? new ArrayBuffer(size) : null);
	}


	PushUInt8(value: number) {
		if (this.stream) {
			this.stream.setUint8(this.cursor, value);
		}
		this.cursor++;
	}

	PushInt32(value: number) {
		if (this.stream) {
			this.stream.setInt32(this.cursor, value, this.endianness == Endianness.LittleEndian);
		}
		this.cursor += 4;
	}

	PushFloat32(value: number) {
		if (this.stream) {
			this.stream.setFloat32(this.cursor, value, this.endianness == Endianness.LittleEndian);
		}
		this.cursor += 4;
	}

	PushString(value: string) {
		for (let index = 0; index < value.length; index++) {
			if (this.stream) {
				this.stream.setUint8(this.cursor, value.charCodeAt(index));
			}
			this.cursor ++;
		}
	}

	PushUILenghedString(value: string) {
		this.PushUInt8(value.length);
		this.PushString(value);
	}
}