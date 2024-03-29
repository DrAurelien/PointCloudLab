﻿/// <reference path="fileloader.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="../model/pointcloud.ts" />
/// <reference path="../model/mesh.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />
/// <reference path="../gui/objects/pclmesh.ts" />


enum PLYFormat {
	Ascii,
	Binary
}


class PlyDefinition {
	constructor(public name: string, public type: string, public params: any) {
	}
}

class PlyElement {
	private definition: PlyDefinition[];
	private items: any[];

	constructor(public name: string, public count: number) {
		this.definition = [];
		this.items = [];
	}

	PushDefinitionProperty(name: string, type: string, params: any) {
		//Check the property has not already been defined
		for (let index = 0; index < this.definition.length; index++) {
			if (this.definition[index].name == name) {
				throw 'the property \"' + name + '\" already exists for element \"' + this.name + '\"';
			}
		}
		this.definition.push(new PlyDefinition(name, type, params));
	}

	GetNextValue(reader: BinaryReader, format: PLYFormat, type: string): number {
		if (reader.Eof()) {
			throw 'reached end of file while parsing PLY items';
		}

		switch (format) {
			case PLYFormat.Ascii:
				{
					let value = reader.GetAsciiWord(true);
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
			case PLYFormat.Binary:
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

	ParseItem(reader: BinaryReader, format: PLYFormat): any {
		let storedItem = {};
		for (let index = 0; index < this.definition.length; index++) {
			if (this.definition[index].type == 'list') {
				let length = this.GetNextValue(reader, format, this.definition[index].params[0]);
				let values = new Array(length);
				for (let cursor = 0; cursor < length; cursor++) {
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

	PushItem(reader: BinaryReader, format: PLYFormat) {
		let expected;
		let found;

		if (this.definition.length == 0) {
			throw 'no definition provided for element \"' + this.name + '\"';
		}

		this.items.push(this.ParseItem(reader, format));
		if (format == PLYFormat.Ascii) {
			reader.GetAsciiLine();
		}
	}

	IsFilled(): boolean {
		return (this.count == this.items.length);
	}

	GetItem(index: number): any {
		return this.items[index];
	}

	NbItems(): number {
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
		for (let index = 0; index < this.elements.length; index++) {
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

	PushItem(reader: BinaryReader, format: PLYFormat) {
		let currentElement: PlyElement = null;
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
class PlyLoader extends FileLoader {
	private reader: BinaryReader;
	private elements: PlyElements;

	constructor(content: ArrayBuffer) {
		super();
		this.reader = new BinaryReader(content);
		this.elements = new PlyElements();
	}

	Load(onloaded: FileLoaderResultHandler, onerror: FileLoaderErrorHandler) {
		function Error(message) {
			throw 'PLY ERROR : ' + message;
		}

		try {
			//Firt line shoul be 'PLY'
			if (this.reader.Eof() || this.reader.GetAsciiLine().toLowerCase() != 'ply') {
				Error('this is not a valid PLY file (line 1)');
			}

			//Second line indicates the PLY format
			let format: PLYFormat;
			if (!this.reader.Eof()) {
				let parts = this.reader.GetAsciiLine().split(' ');
				if (parts.length == 3 || parts[0].toLowerCase() != 'format') {
					let formatstr = parts[1].toLowerCase();
					if (formatstr === 'binary_big_endian') {
						format = PLYFormat.Binary;
						this.reader.endianness = Endianness.BigEndian;
					}
					else if (formatstr === 'binary_little_endian') {
						format = PLYFormat.Binary;
						this.reader.endianness = Endianness.LittleEndian;
					}
					else if (formatstr === 'ascii') {
						format = PLYFormat.Ascii;
					}
					else {
						Error('unsuported PLY format "' + formatstr + '" (line 2)');
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
			let inHeader = true;
			do {
				if (this.reader.Eof()) {
					Error('unexpected end of file while parsing header');
				}
				let currentLine = this.reader.GetAsciiLine().split(' ');
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
							let currentElement = this.elements.GetCurrent();
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
			this.elements.ResetCurrent();
			let loader = new ItemsLoader(this.reader, this.elements, format);
			loader
				.SetNext(new CloudBuilder(this.elements))
				.SetNext(new MeshBuilder(this.elements))
				.SetNext(new Finalizer())
				.SetNext((f: Finalizer) => onloaded(f.result));
				loader.Start();
		}
		catch (error) {
			onerror(error);
		}
	}
}


//////////////////////////////////////////
// PLY elements loading process
//////////////////////////////////////////
class ItemsLoader extends LongProcess {
	constructor(private reader: BinaryReader, private elements: PlyElements, private format: PLYFormat) {
		super('Parsing PLY content');
	}

	Step() {
		try {
			this.elements.PushItem(this.reader, this.format);
		}
		catch (exception) { Error(exception); }
	}
	get Done(): boolean { return this.reader.Eof(); }
	get Current() { return this.reader.stream.byteOffset; }
	get Target() { return this.reader.stream.byteLength; }
}


//////////////////////////////////////////
// Build point cloud from loaded ply vertices
//////////////////////////////////////////
class CloudBuilder extends IterativeLongProcess {
	private vertices: PlyElement;
	public cloud: PointCloud;

	constructor(private elements: PlyElements) {
		super(0, 'Loading PLY vertices');
	}

	Initialize(caller: ItemsLoader) {
		this.vertices = this.elements.GetElement('vertex');
		if (this.vertices) {
			this.nbsteps = this.vertices.NbItems();
			this.cloud = new PointCloud();
			this.cloud.Reserve(this.nbsteps);
		}
	}

	Iterate(step: number) {
		let vertex = this.vertices.GetItem(step);
		this.cloud.PushPoint(new Vector([vertex.x, vertex.y, vertex.z]));
	}
}

//////////////////////////////////////////
// Build mesh from loaded ply faces, if any
//////////////////////////////////////////
class MeshBuilder extends IterativeLongProcess {
	private faces: PlyElement;
	public result: Mesh | PCLPointCloud;

	constructor(private elements: PlyElements) {
		super(0, 'Loading PLY mesh');
	}

	Initialize(caller: CloudBuilder) {
		this.faces = this.elements.GetElement('face');
		if (this.faces) {
			if (!caller.cloud)
				throw "faces defined without vertices";
			this.nbsteps = this.faces.NbItems();
			this.result = new Mesh(caller.cloud);
			this.result.Reserve(this.nbsteps);
		}
		else {
			this.result = new PCLPointCloud(caller.cloud);
		}
	}

	Iterate(step: number) {
		let face = this.faces.GetItem(step);
		let mesh = this.result as Mesh;
		mesh.PushFace(face.vertex_indices);
	}
}

//////////////////////////////////////////
//  Finalize the result
//////////////////////////////////////////
class Finalizer extends Process {
	public result: PCLMesh | PCLPointCloud;

	constructor() {
		super();
	}

	Initialize(caller: MeshBuilder) {
		if (caller.result instanceof Mesh) {
			this.result = new PCLMesh(caller.result as Mesh);
		}
		else {
			this.result = caller.result as PCLPointCloud;
		}
	}

	Run(ondone: Function) {
		if (this.result instanceof PCLMesh) {
			let mesh = (this.result as PCLMesh).mesh;
			mesh.ComputeNormals((m: Mesh) => {
				m.ComputeOctree(ondone);
				return true;
			});
		}
		else {
			ondone();
		}
	}
}