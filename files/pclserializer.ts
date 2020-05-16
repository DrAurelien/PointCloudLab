/// <reference path="../maths/vector.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="binaryreader.ts" />


interface PCLSerializable {
	GetSerializationID(): string;
	Serialize(s: PCLSerializer);
}

interface PCLSerializationHandler {
	(w: BinaryWriter);
}

class PCLSerializer {
	writer: BinaryWriter;
	constructor(buffersize) {
		this.writer = new BinaryWriter(buffersize);

		this.writer.PushString('>>>HEADER\n');
		this.PushParameter(this.writer.endianness == Endianness.BigEndian ? 'bigendian' : 'littleendian');
		this.PushParameter('version', (s) => s.PushUInt8(1));
		this.writer.PushString('>>>CONTENTS\n');
	}

	PushParameter(name: string, handler: PCLSerializationHandler = null) {
		this.writer.PushString('-' + name + '\n');
		if (handler) {
			handler(this.writer);
			this.writer.PushString('\n');
		}
	}

	Start(s: PCLSerializable) {
		this.writer.PushString('New ' + s.GetSerializationID() + '\n');
	}

	End(s: PCLSerializable) {
		this.writer.PushString('End ' + s.GetSerializationID() + '\n');
	}

	GetBuffer(): ArrayBuffer {
		return this.writer.buffer;
	}

	GetBufferSize(): number {
		return this.writer.cursor;
	}
}

interface PCLParsingHandler {
	(param: string, r: BinaryReader);
}

class PCLParser {
	reader: BinaryReader;
	line: number;

	constructor(buffer: ArrayBuffer) {
		this.reader = new BinaryReader(buffer);
		this.line = 0;
	}

	GetParameter(name: string, handler: PCLParsingHandler) {
		let param = this.reader.GetAsciiUntil(['\n']);
		this.line++;
		handler(param, this.reader);
		if (this.reader.Ignore(['\n']) == 0) {
			Error('expected line feed not found')
		}
	}

	Error(message: string) {
		throw 'PCL Parsing error (line ' + this.line + ') : ' + message;
	}
}