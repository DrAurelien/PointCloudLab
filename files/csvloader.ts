﻿/// <reference path="fileloader.ts" />
/// <reference path="../tools/longprocess.ts" />


class CsvLoader extends FileLoader {
	parser: CSVParser;

	constructor(content: ArrayBuffer) {
		super();
		this.parser = new CSVParser(content);
		this.result = null;
	}

	Load(ondone: Function) {
		let self = this;
		this.result = new PointCloud();
		this.parser.SetNext((p: CSVParser) => {
			self.result = p.cloud;
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
	public lineseparator: string;
	public cloud: PointCloud;
	private fields: ScalarField[];

	static PointCoordinates = ['x', 'y', 'z'];
	static NormalCoordinates = ['nx', 'ny', 'nz'];

	constructor(content: ArrayBuffer) {
		super(0, 'Parsing CSV file content');
		this.separator = ';';
		this.lineseparator = '\n';
		this.reader = new BinaryReader(content);
	}

	Initialize(caller: Process) {
		this.header = null;
		this.rawheader = null;
		this.headermapping = null;
		this.done = false;

		this.cloud = new PointCloud();
		this.nbsteps = this.reader.CountAsciiOccurences(this.lineseparator);
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
				if (point) {
					this.cloud.PushPoint(point);
					var normal = this.GetVector(line, CSVParser.NormalCoordinates);
					if (normal) {
						this.cloud.PushNormal(normal);
					}
					for(let index = 0; index < this.cloud.fields.length; index++) {
						let field = this.cloud.fields[index];
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
					this.cloud.AddScalarField(key).Reserve(this.nbsteps);
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
		var line = this.reader.GetAsciiUntil([this.lineseparator]);
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
			if (value) {
				result.push(value);
			}
			else {
				return null;
			}
		}
		return new Vector(result);
	}
}