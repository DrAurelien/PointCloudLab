/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../../files/pclserializer.ts" />


//=================================================
// The PCLScalar field extends the scalar field by providing
// - a name
// - color settings for display prupose (color scale)
// - a range to be displayed
//=================================================
class PCLScalarField extends ScalarField implements PCLSerializable {
	displaymin: number;
	displaymax: number;
	colormin: number[];
	colormax: number[];
	onChange: Function;

	static DensityFieldName = 'Density';
	static NoiseFieldName = 'Noise';

	constructor(public name: string, values?: Float32Array) {
		super(values);
		this.colormin = [0, 0, 1];
		this.colormax = [1, 0, 0];
		this.displaymin = null;
		this.displaymax = null;
	}

	NotifyChange() {
		if (this.onChange) {
			this.onChange();
		}
	}

	GetDisplayMin(): number {
		return this.displaymin === null ? this.Min() : this.displaymin;
	}

	SetDisplayMin(v: number) {
		this.displaymin = v;
		this.NotifyChange();
	}

	GetDisplayMax(): number {
		return this.displaymax === null ? this.Max() : this.displaymax;
	}

	SetDisplayMax(v: number) {
		this.displaymax = v;
		this.NotifyChange();
	}

	static SerializationID = 'SCALARFIELD';
	GetSerializationID(): string {
		return PCLScalarField.SerializationID;
	}

	SetColorMin(c: number[]) {
		this.colormin = c;
		this.NotifyChange();
	}

	SetColorMax(c: number[]) {
		this.colormax = c;
		this.NotifyChange();
	}

	Serialize(serializer: PCLSerializer) {
		serializer.Start(this);
		let self = this;
		serializer.PushParameter('name', (s) => {
			s.PushString(self.name);
		});
		if (this.displaymin) {
			serializer.PushParameter('displaymin', (s) => {
				s.PushFloat32(this.displaymin);
			});
		}
		if (this.displaymax) {
			serializer.PushParameter('displaymax', (s) => {
				s.PushFloat32(this.displaymax);
			});
		}
		serializer.PushParameter('colormin', (s) => {
			s.PushFloat32(this.colormin[0]);
			s.PushFloat32(this.colormin[1]);
			s.PushFloat32(this.colormin[2]);
		});
		serializer.PushParameter('colormax', (s) => {
			s.PushFloat32(this.colormax[0]);
			s.PushFloat32(this.colormax[1]);
			s.PushFloat32(this.colormax[2]);
		});
		serializer.PushParameter('values', (s) => {
			s.PushInt32(self.Size());
			for (let index = 0; index < self.Size(); index++) {
				s.PushFloat32(self.GetValue(index));
			}
		});
		serializer.End(this);
	}

	GetParsingHandler(): PCLObjectParsingHandler {
		return new PCLScalarFieldParsingHandler();
	}
}

class PCLScalarFieldParsingHandler implements PCLObjectParsingHandler {
	name: string;
	values: Float32Array;
	displaymin: number;
	displaymax: number;
	colormin: number[];
	colormax: number[];

	constructor() {
	}

	ProcessParam(paramname: string, parser: PCLParser): boolean {
		switch (paramname) {
			case 'name':
				this.name = parser.GetStringValue();
				return true;
			case 'displaymin':
				this.displaymin = parser.reader.GetNextFloat32();
				return true;
			case 'displaymax':
				this.displaymax = parser.reader.GetNextFloat32();
				return true;
			case 'colormin':
				this.colormin = [
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				];
				return true;
			case 'colormax':
				this.colormax =[
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32(),
					parser.reader.GetNextFloat32()
				];
				return true;
			case 'values':
				let nbvalues = parser.reader.GetNextInt32();
				this.values = new Float32Array(nbvalues);
				for (let index = 0; index < nbvalues; index++) {
					this.values[index] = parser.reader.GetNextFloat32();
				}
				return true;
		}
		return false;
	}

	Finalize(): PCLSerializable {
		let scalarfield = new PCLScalarField(this.name, this.values);
		scalarfield.colormin = this.colormin;
		scalarfield.colormax = this.colormax;
		if (this.displaymin) {
			scalarfield.displaymin = this.displaymin;
		}
		if (this.displaymax) {
			scalarfield.displaymax = this.displaymax;
		}
		return scalarfield;
	}
}