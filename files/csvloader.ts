/// <reference path="fileloader.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />


class CsvLoader extends FileLoader {
	parser: CSVParser;

	constructor(content: ArrayBuffer) {
		super();
		this.parser = new CSVParser(content);
		this.result = null;
	}

	Load(ondone: Function) {
		let self = this;
		this.parser.SetNext((p: CSVParser) => {
			self.result = p.pclcloud;
			ondone();
		});
		this.parser.Start();
	}
}

class CSVParser extends IterativeLongProcess {
	reader: BinaryReader;
	rawheader: string[];
	header: Object;
	headermapping: Object;
	done: boolean;
	public separator: string;
	public pclcloud: PCLPointCloud;

	static PointCoordinates = ['x', 'y', 'z'];
	static NormalCoordinates = ['nx', 'ny', 'nz'];

	constructor(content: ArrayBuffer) {
		super(0, 'Parsing CSV file content');
		this.separator = ';';
		this.reader = new BinaryReader(content);
	}

	Initialize(caller: Process) {
		this.header = null;
		this.rawheader = null;
		this.headermapping = null;
		this.done = false;

		this.pclcloud = new PCLPointCloud();
		this.nbsteps = this.reader.CountAsciiOccurences('\n');
		this.pclcloud.cloud.Reserve(this.nbsteps);
		this.reader.Reset();
	}

	Iterate(step: number) {
		var line = this.ParseCurrentLine();
		if (line) {
			if (!this.header) {
				this.SetHeader(line);
			}
			else {
				var point = this.GetVector(line, CSVParser.PointCoordinates);
				let cloud = this.pclcloud.cloud;
				let fields = this.pclcloud.fields;
				if (point) {
					cloud.PushPoint(point);
					var normal = this.GetVector(line, CSVParser.NormalCoordinates);
					if (normal) {
						cloud.PushNormal(normal);
					}
					for(let index = 0; index < fields.length; index++) {
						let field = fields[index];
						field.PushValue(this.GetValue(line, field.name));
					}
				}
			}
		}
		else {
			this.done = true;
		}
	}

	get Done() { return this.done; }

	SetHeader(line: string[]) {
		this.header = {};
		this.rawheader = line;
		for (let index = 0; index < line.length; index++) {
			var key = line[index];
			if (this.headermapping) {
				if (key in this.headermapping) {
					key = this.headermapping[key];
				}
				else {
					console.warn('Cannot map "' + key + '" to a valid data, given the specified CSV mapping');
					key = null;
				}
			}
			if (key) {
				let ciKey = key.toLocaleLowerCase();
				this.header[ciKey] = index;
				if (!this.IsCoordinate(ciKey)) {
					this.pclcloud.AddScalarField(key).Reserve(this.nbsteps);
				}
			}
		}
	}

	IsCoordinate(key: string): boolean {
		let coords = CSVParser.PointCoordinates.concat(CSVParser.NormalCoordinates);
		for (let index = 0; index < coords.length; index++) {
			if (key == coords[index]) {
				return true;
			}
		}
		return false;
	}

	ParseCurrentLine(): string[] {
		if (this.reader.Eof()) {
			return null;
		}
		var line = this.reader.GetAsciiLine();
		if (line) {
			return line.split(this.separator);
		}
		return null;
	}

	GetValue(line: string[], key: string): number {
		let ciKey = key.toLocaleLowerCase();
		if (ciKey in this.header) {
			let index = this.header[ciKey];
			try {
				return parseFloat(line[index]);
			}
			catch (e) {
			}
		}
		return null;
	}

	GetVector(line: string[], data: string[]): Vector {
		let result = [];
		for (let index = 0; index < data.length; index++) {
			let value = this.GetValue(line, data[index]);
			if (value !== null) {
				result.push(value);
			}
			else {
				return null;
			}
		}
		return new Vector(result);
	}
}