﻿class PlyDefinition {
	constructor(public name: string, public type: string, public params: any) {
	}
}

class PlyElement {
	private definition: PlyDefinition[];
	private items: Object[];

	constructor(public name: string, public count: number) {
		this.definition = [];
		this.items = [];
	}

	PushDefinitionProperty(name: string, type: string, params: any) {
		//Check the property has not already been defined
		for (var index = 0; index < this.definition.length; index++) {
			if (this.definition[index].name == name) {
				throw 'the property \"' + name + '\" already exists for element \"' + this.name + '\"';
			}
		}
		this.definition.push(new PlyDefinition(name, type, params));
	}

	GetNextValue(reader: BinaryReader, format: string, type: string): number {
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
	}

	ParseItem(reader: BinaryReader, format: string): Object {
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
	}

	PushItem(reader: BinaryReader, format: string) {
		var expected;
		var found;

		if (this.definition.length == 0) {
			throw 'no definition provided for element \"' + this.name + '\"';
		}

		this.items.push(this.ParseItem(reader, format));
		if (format == 'ascii') {
			while (!reader.Eof() && reader.GetCurrentAsciiChar() == '\n') {
				reader.GetNextAsciiChar();
			}
		}
	}

	IsFilled(): boolean {
		return (this.count == this.items.length);
	}

	GetItem(index: number): Object {
		return this.items[index];
	}

	NbItems(itemsindex: number): number {
		return this.items.length;
	}
}

//////////////////////////////////////
// Elements collection handler
//////////////////////////////////////
class PlyElements {
	public elements: PlyElement[];
	public current: number;

	constructor() {
		this.elements = [];
		this.current = 0;
	}

	PushElement(name: string, count: number) {
		this.elements.push(new PlyElement(name, count));
		this.current = this.elements.length - 1;
	}

	GetCurrent(): PlyElement {
		if (this.current < this.elements.length) {
			return this.elements[this.current];
		}
		return null;
	}

	GetElement(name: string): PlyElement {
		for (var index = 0; index < this.elements.length; index++) {
			if (this.elements[index].name == name) {
				return this.elements[index];
			}
		}
		return null;
	}

	ResetCurrent() {
		this.current = 0;
	}

	NbElements(): number {
		return this.elements.length;
	}

	PushItem(reader: BinaryReader, format: string) {
		var currentElement = null;
		while ((currentElement = this.GetCurrent()) != null && currentElement.IsFilled()) {
			this.current++;
		}
		if (currentElement == null) {
			throw 'all the elements have been filled with items.'
		}
		currentElement.PushItem(reader, format);
	}
}

//////////////////////////////////////////
// PLY File Loader
//////////////////////////////////////////
class PlyLoader {
	private reader: BinaryReader;
	private elements: PlyElements;
	public result: CADNode;

	constructor(content: ArrayBuffer) {
		this.reader = new BinaryReader(content);
		this.elements = new PlyElements();
		this.result = null;
	}

	Load = function (onloaded: Function) {
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
						this.elements.PushElement(
							currentLine[1].toLowerCase(), //name
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
								currentElement.PushDefinitionProperty(
									currentLine[currentLine.length - 1].toLowerCase(), //name
									currentLine[1].toLowerCase(), //type
									(currentLine.length > 3) ? currentLine.slice(2, -1) : null
								);
							}
							else {
								Error("property definition format error");
							}
						}
						else {
							Error('unexpected property, while no element has been introduced');
						}
					}
					catch (exception) { Error(exception); }
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
		var self = this;
		function LoadItems() {
			if (self.reader.Eof()) {
				return null;
			}

			try {
				self.elements.PushItem(self.reader, format);
			}
			catch (exception) { Error(exception); }

			return { current: self.reader.cursor, total: self.reader.stream.length };
		}

		function ComputeNormals() {
			self.result.ComputeNormals();
			if (self.result instanceof Mesh) {
				(<Mesh>self.result).ComputeOctree(onloaded);
			}
			else if (onloaded) {
				onloaded();
			}
		}

		function BuildMesh() {
			var faces = self.elements.GetElement('face');
			if (faces) {
				if (!self.result) {
					Error("faces defined without vertices");
				}
				self.result = new Mesh(self.result);
				self.result.Reserve(faces.NbItems());
				var index = 0;

				//Load mesh faces from faces list
				function PushFace() {
					if (index >= faces.NbItems()) {
						return null;
					}
					var face = faces.GetItem(index++);
					self.result.PushFace(face.vertex_indices);

					return { current: index, total: faces.NbItems() };
				}

				LongProcess.Run('Loading PLY mesh (step 3/3)', PushFace, ComputeNormals);
			}
		}

		function BuildCloud() {
			var vertices = self.elements.GetElement('vertex');
			if (vertices) {
				self.result = new PointCloud();
				self.result.Reserve(vertices.NbItems());
				var index = 0;

				//Load point cloud from vertices list
				function PushVertex() {
					if (index >= vertices.NbItems()) {
						return null;
					}

					var vertex = vertices.GetItem(index++);
					self.result.PushPoint(new Vector([
						vertex.x,
						vertex.y,
						vertex.z
					]));

					return { current: index, total: vertices.NbItems() };
				}

				LongProcess.Run('Loading PLY vertices (step 2 / 3)', PushVertex, BuildMesh);
			}
		}

		this.elements.ResetCurrent();
		LongProcess.Run('Parsing PLY content (step 1 / 3)', LoadItems, BuildCloud);
	}
}