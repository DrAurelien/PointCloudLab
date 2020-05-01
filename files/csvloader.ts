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
	header: Object;
	headermapping: Object;
	done: boolean;
	public separator: string;
	public lineseparator: string;
	public cloud: PointCloud;

	constructor(content: ArrayBuffer) {
		super(0, 'Parsing CSV file content');
		this.separator = ';';
		this.lineseparator = '\n';
		this.reader = new BinaryReader(content);
	}

	Initialize(caller: Process) {
		this.header = null;
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
				var point = this.GetVector(line, ['x', 'y', 'z']);
				if (point) {
					this.cloud.PushPoint(point);
					var normal = this.GetVector(line, ['nx', 'ny', 'nz']);
					if (normal) {
						this.cloud.PushNormal(normal);
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
				this.header[key] = index;
			}
		}
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

	GetVector(line: string[], data: string[]): Vector {
		var result = [];
		for (var index = 0; index < data.length; index++) {
			var key = data[index];
			if (key in this.header) {
				key = this.header[key];
				try {
					var value = parseFloat(line[key]);
					result.push(value);
				}
				catch (e) {
					result = null;
				}
			}
			else {
				result = null;
			}

			if (!result) {
				return null;
			}
		}
		return new Vector(result);
	}
}