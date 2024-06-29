/// <reference path="../maths/vector.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="binaryreader.ts" />


interface PCLSerializable {
	GetSerializationID(): string;
	Serialize(s: PCLSerializer);
	GetParsingHandler(): PCLObjectParsingHandler;
}

interface PCLSerializationHandler {
	(w: BinaryWriter);
}

class PCLSerializer {
	writer: BinaryWriter;

	static SectionPrefix = '>>> ';
	static StartObjectPrefix = 'New ';
	static EndObjectPrefix = 'End ';
	static ParameterPefix = '- ';
	static HeaderSection = 'HEADER';
	static ContentsSection = 'CONTENTS';
	static VersionParam = 'version';
	static BigEndian = 'bigendian';
	static LittleEndian = 'littleendian';
	static CurrentVersion : number = 2;

	constructor(buffersize) {
		this.writer = new BinaryWriter(buffersize);

		this.PushSection('HEADER');
		this.PushParameter(this.writer.endianness == Endianness.BigEndian ?
			PCLSerializer.BigEndian : PCLSerializer.LittleEndian);
		this.PushParameter('version', (s) => s.PushUInt8(PCLSerializer.CurrentVersion));
		this.PushSection('CONTENTS');
	}

	PushSection(name: string) {
		this.writer.PushString(PCLSerializer.SectionPrefix + name + '\n');
	}

	PushParameter(name: string, handler: PCLSerializationHandler = null) {
		this.writer.PushString(PCLSerializer.ParameterPefix + name + '\n');
		if (handler) {
			handler(this.writer);
			if (this.writer.lastvalue !== '\n') {
				this.writer.PushString('\n');
			}
		}
	}

	Start(s: PCLSerializable) {
		this.writer.PushString(PCLSerializer.StartObjectPrefix + s.GetSerializationID() + '\n');
	}

	End(s: PCLSerializable) {
		this.writer.PushString(PCLSerializer.EndObjectPrefix + s.GetSerializationID() + '\n');
	}

	GetBuffer(): ArrayBuffer {
		return this.writer.buffer;
	}

	GetBufferAsString(): string {
		let stream = this.writer.stream;
		let result = '';
		for (let index = 0; index < stream.byteLength; index++) {
			result += String.fromCharCode(stream.getUint8(index));
		}
		return result;
	}

	GetBufferSize(): number {
		return this.writer.cursor;
	}
}



enum PCLTokenType {
	SectionEntry,
	StartObject,
	EndObject,
	Parameter
}

class PCLToken {
	constructor(public type: PCLTokenType, public value: string) { }
}

interface PCLObjectParsingHandler {
	ProcessParam(paramname: string, parser: PCLParser): boolean;
	Finalize(): PCLSerializable;
}

interface PCLObjectParsingFactory {
	GetHandler(objecttype: string): PCLObjectParsingHandler;
}

class PCLParser {
	reader: BinaryReader;
	line: string;
	version: number;
	endianness: Endianness;

	static tokenmap: Object = null;

	constructor(buffer: ArrayBuffer | string, private factory: PCLObjectParsingFactory) {
		if (buffer instanceof ArrayBuffer) {
			this.reader = new BinaryReader(buffer as ArrayBuffer);
		}
		else {
			let strbuffer = buffer as string;
			let arraybuffer = new ArrayBuffer(strbuffer.length);
			let stream = new DataView(arraybuffer);
			for (let index = 0; index < strbuffer.length; index++) {
				stream.setUint8(index, strbuffer.charCodeAt(index));
			}
			this.reader = new BinaryReader(arraybuffer);
		}
		this.line ='';
	}

	private TryGetTokenValue(line: string, prefix: string): string {
		if (line.substring(0, prefix.length) === prefix) {
			return line.substring(prefix.length);
		}
		return null;
	}

	GetStringValue(): string {
		return this.reader.GetAsciiLine();
	}

	private static GetTokenMap() {
		if (!PCLParser.tokenmap) {
			PCLParser.tokenmap = {};
			PCLParser.tokenmap[PCLSerializer.SectionPrefix] = PCLTokenType.SectionEntry;
			PCLParser.tokenmap[PCLSerializer.StartObjectPrefix] = PCLTokenType.StartObject;
			PCLParser.tokenmap[PCLSerializer.EndObjectPrefix] = PCLTokenType.EndObject;
			PCLParser.tokenmap[PCLSerializer.ParameterPefix] = PCLTokenType.Parameter;
		}
		return PCLParser.tokenmap;
	}

	protected GetNextToken(): PCLToken {
		if (this.reader.Eof()) {
			this.Error('unexpected end of file');
		} 

		this.reader.Ignore(['\n']);

		this.line = this.reader.GetAsciiLine();

		let tokenmap = PCLParser.GetTokenMap();

		let value: string;
		for (let tokenprfix in tokenmap) {
			if (value = this.TryGetTokenValue(this.line, tokenprfix)) {
				return new PCLToken(tokenmap[tokenprfix], value);
			}
		}

		this.Error('unable to parse token');
		return null;
	}

	Done(): boolean {
		this.reader.Ignore(['\n']);
		return this.reader.Eof();
	}

	ProcessHeader() {
		let token = this.GetNextToken();
		if (token.type !== PCLTokenType.SectionEntry || token.value !== PCLSerializer.HeaderSection) {
			this.Error('header section was extected');
		}

		while ((token = this.GetNextToken()) && (token.type === PCLTokenType.Parameter)) {
			switch (token.value) {
				case PCLSerializer.VersionParam:
					this.version = this.reader.GetNextUInt8();
					break;
				case PCLSerializer.BigEndian:
					this.endianness = Endianness.BigEndian;
					break;
				case PCLSerializer.LittleEndian:
					this.endianness = Endianness.LittleEndian;
					break;
				default:
					this.Error('unexpected parameter "' + token.value + '" in header section');
			}
		}
		if (!(token.type === PCLTokenType.SectionEntry && token.value === PCLSerializer.ContentsSection)) {
			this.Error('contents section was expected');
		}
	};

	ProcessNextObject(): PCLSerializable {
		let token: PCLToken;

		token = this.GetNextToken();
		if (token.type !== PCLTokenType.StartObject) {
			this.Error('object declaration was expected');
		}

		let objecttype = token.value;
		let handler = this.factory.GetHandler(objecttype);

		if (!handler) {
			this.Error('unsupported object type "' + objecttype + '"');
		}

		while ((token = this.GetNextToken()) && (token.type === PCLTokenType.Parameter)) {
			if (!handler.ProcessParam(token.value, this)) {
				this.Error('unexpected parameter "' + token.value + '"');
			}
		}

		if (token.type !== PCLTokenType.EndObject || token.value !== objecttype) {
			this.Error('end of object "' + objecttype + '" was expected');
		}

		return handler.Finalize();
	}

	Error(message: string) {
		throw 'PCL Parsing error : ' + message + '\n"' + this.line + '"';
	}
}