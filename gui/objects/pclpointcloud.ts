/// <reference path="../../model/pointcloud.ts" />
/// <reference path="../../controler/actions/pointcloudactions.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/booleanproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />
/// <reference path="../../files/pclserializer.ts" />


//=================================================
// The PCLPointcloud provides an interface to interact with a point cloud
// - Show the point cloud
// - Perform actions on the point cloud
// - Get/set the point cloud properties
//=================================================
class PCLPointCloud extends PCLPrimitive implements Pickable {
	ransac: Ransac;
	fields: ScalarField[];
	currentfield: number;
	drawing: PointCloudDrawing;

	private static ScalarFieldPropertyName: string = 'Scalar fields';
	static DensityFieldName = 'Density';
	static NoiseFieldName = 'Noise	';

	constructor(public cloud: PointCloud = null) {
		super(NameProvider.GetName('PointCloud'));
		this.fields = [];
		this.currentfield = null;
		this.drawing = new PointCloudDrawing();
		if (!this.cloud) {
			this.cloud = new PointCloud();
		}
	}

	AddScalarField(field: string | ScalarField): ScalarField {
		let scalarfield;
		if (field instanceof ScalarField) {
			scalarfield = field;
		}
		else {
			scalarfield = new ScalarField(field as string);
			scalarfield.Reserve(this.cloud.Size());
		}
		this.fields.push(scalarfield);
		this.AddScaralFieldProperty(this.fields.length - 1);
		return scalarfield;
	}

	GetScalarField(name: string): ScalarField {
		for (let index = 0; index < this.fields.length; index++) {
			if (this.fields[index].name === name) {
				return this.fields[index];
			}
		}
		return null;
	}

	SetCurrentField(name: string, disableLighting: boolean = true): boolean {
		for (let index = 0; index < this.fields.length; index++) {
			if (this.fields[index].name === name) {
				this.currentfield = index;
				if (disableLighting) {
					this.lighting = false;
				}
				this.NotifyChange(this, ChangeType.Display | ChangeType.Properties | ChangeType.ColorScale);
				return true;
			}
		}
		this.currentfield = null;
		return false;
	}

	GetCurrentField(): ScalarField {
		if (this.currentfield !== null) {
			return this.fields[this.currentfield];
		}
		return null;
	}

	RayIntersection(ray: Ray): Picking {
		return new Picking(this);
	}

	GetPrimitiveBoundingBox(): BoundingBox {
		return this.cloud.boundingbox;
	}

	GetActions(delegate: ActionDelegate): Action[] {
		let cloud = this;
		let result: Action[] = super.GetActions(delegate);

		result.push(null);
		if (this.cloud.HasNormals()) {
			result.push(new ClearNormalsAction(this));
		}
		else {
			result.push(new ComputeNormalsAction(this));
		}
		result.push(new GaussianSphereAction(this));

		result.push(null);

		result.push(new ConnectedComponentsAction(this));
		result.push(new ComputeDensityAction(this));
		result.push(new ComputeNoiseAction(this));

		result.push(null);
		let ransac = false;
		if (cloud.ransac) {
			result.push(new ResetDetectionAction(this));
			ransac = true;
		}
		if (!(cloud.ransac && cloud.ransac.IsDone())) {
			result.push(new RansacDetectionAction(this));
			ransac = true;
		}

		if (ransac)
			result.push(null);
		result.push(new ExportPointCloudFileAction(this));

		return result;
	}

	TransformPrivitive(transform: Transform) {
		this.cloud.ApplyTransform(transform);
		this.InvalidateDrawing();
	}

	FillProperties() {
		super.FillProperties();
		if (this.properties) {
			let self = this;
			let points = new NumberProperty('Points', () => self.cloud.Size(), null);
			points.SetReadonly();
			this.properties.Push(points);

			if (this.fields.length) {
				let fieldsProperty = new PropertyGroup(PCLPointCloud.ScalarFieldPropertyName);
				for (let index = 0; index < this.fields.length; index++) {
					fieldsProperty.Add(this.GetScalarFieldProperty(index));
				}
				this.properties.Push(fieldsProperty);
			}
		}
	}

	AddScaralFieldProperty(index: number) {
		if (this.properties) {
			let fieldsProperty = this.properties.GetPropertyByName(PCLPointCloud.ScalarFieldPropertyName) as PropertyGroup;
			if (!fieldsProperty) {
				fieldsProperty = new PropertyGroup(PCLPointCloud.ScalarFieldPropertyName);
				this.properties.Push(fieldsProperty);
			}
			fieldsProperty.Add(this.GetScalarFieldProperty(index));
		}
	}

	private GetScalarFieldProperty(index: number): Property {
		let self = this;
		return new BooleanProperty(this.fields[index].name, () => (index === self.currentfield), (value: boolean) => {
			self.currentfield = value ? index : null;
			self.NotifyChange(self, ChangeType.ColorScale);
		});
	}


	DrawPrimitive(drawingContext: DrawingContext) {
		let field = this.currentfield !== null ? this.fields[this.currentfield] : null;

		this.drawing.FillBuffers(this.cloud, field, drawingContext);
		this.drawing.BindBuffers(this.lighting, !!field, drawingContext);
		this.drawing.Draw(drawingContext);
	}

	InvalidateDrawing() {
		this.drawing.Clear();
		this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
	}

	GetCSVData(): string {
		var result = 'x;y;z';
		if (this.cloud.HasNormals()) {
			result += ';nx;ny;nz';
		}
		for (let field = 0; field < this.fields.length; field++) {
			result += ';' + this.fields[field].name.replace(';', '_');
		}
		result += '\n';

		for (let index = 0; index < this.cloud.Size(); index++) {
			let point = this.cloud.GetPoint(index);
			result += point.Get(0) + ';' +
				point.Get(1) + ';' +
				point.Get(2);

			if (this.cloud.HasNormals()) {
				let normal = this.cloud.GetNormal(index);
				result += ';' + normal.Get(0) + ';' +
					normal.Get(1) + ';' +
					normal.Get(2);
			}

			for (let field = 0; field < this.fields.length; field++) {
				result += ';' + this.fields[field].GetValue(index);
			}
			result += '\n';
		}
		return result;
	}

	static SerializationID = 'POINTCLOUD';
	GetSerializationID(): string {
		return PCLPointCloud.SerializationID;
	}

	SerializePrimitive(serializer: PCLSerializer) {
		let self = this;
		serializer.PushParameter('points', (s) => {
			s.PushInt32(self.cloud.pointssize);
			for (let index = 0; index < self.cloud.pointssize; index++) {
				s.PushFloat32(self.cloud.points[index]);
			}
		});
		if (this.cloud.HasNormals()) {
			serializer.PushParameter('normals', (s) => {
				s.PushInt32(self.cloud.normalssize);
				for (let index = 0; index < self.cloud.normalssize; index++) {
					s.PushFloat32(self.cloud.normals[index]);
				}
			});
		}
		for (let index = 0; index < this.fields.length; index++) {
			let field = this.fields[index];
			serializer.PushParameter('scalarfield', (s) => {
				s.PushUILenghedString(field.name);
				s.PushInt32(field.Size());
				for (let ii = 0; ii < field.Size(); ii++) {
					s.PushFloat32(field.GetValue(ii));
				}
			});
		}
	}

	GetParsingHandler(): PCLObjectParsingHandler {
		return new PCLPointCloudParsingHandler();
	}
}

class PCLPointCloudParsingHandler extends PCLPrimitiveParsingHandler {
	points: Float32Array;
	normals: Float32Array;
	fields: ScalarField[];

	constructor() {
		super();
		this.fields = [];
	}

	ProcessPrimitiveParam(paramname: string, parser: PCLParser): boolean {
		switch (paramname) {
			case 'points':
				let nbpoints = parser.reader.GetNextInt32();
				this.points = new Float32Array(nbpoints);
				for (let index = 0; index < nbpoints; index++) {
					this.points[index] = parser.reader.GetNextFloat32();
				}
				return true;
			case 'normals':
				let nbnormals = parser.reader.GetNextInt32();
				this.normals = new Float32Array(nbnormals);
				for (let index = 0; index < nbnormals; index++) {
					this.normals[index] = parser.reader.GetNextFloat32();
				}
				return true;
			case 'scalarfield':
				let name = parser.reader.GetNextUILenghedString();
				let size = parser.reader.GetNextInt32();
				let field = new ScalarField(name);
				field.Reserve(size);
				for (let index = 0; index < size; index++) {
					field.PushValue(parser.reader.GetNextFloat32());
				}
				this.fields.push(field);
				return true;
		}
		return false;
	}

	FinalizePrimitive(): PCLPrimitive {
		let cloud = new PCLPointCloud(new PointCloud(this.points, this.normals));
		for (let index = 0; index < this.fields.length; index++) {
			cloud.AddScalarField(this.fields[index]);
		}
		return cloud;
	}
}

class PointCloudDrawing {
	glPointsBuffer: FloatArrayBuffer;
	glNormalsBuffer: FloatArrayBuffer;
	glScalarBuffer: FloatArrayBuffer;
	bufferedScalarField: ScalarField;
	cloudsize: number;

	constructor() {
		this.glNormalsBuffer = null;
		this.glPointsBuffer = null;
	}

	FillBuffers(cloud: PointCloud, field: ScalarField, ctx: DrawingContext) {
		this.cloudsize = cloud.Size();

		if (!this.glPointsBuffer) {
			this.glPointsBuffer = new FloatArrayBuffer(cloud.points, ctx, 3);
		}

		if (cloud.HasNormals() && !this.glNormalsBuffer) {
			this.glNormalsBuffer = new FloatArrayBuffer(cloud.normals, ctx, 3);
		}
		if (field && (!this.glScalarBuffer || this.bufferedScalarField !== field)) {
			this.glScalarBuffer = new FloatArrayBuffer(field.values, ctx, 1);
			this.bufferedScalarField = field;
			ctx.gl.uniform1f(ctx.minscalarvalue, field.Min());
			ctx.gl.uniform1f(ctx.maxscalarvalue, field.Max());
		}
	}

	BindBuffers(uselighting: boolean, usescalars: boolean, ctx: DrawingContext) {
		this.glPointsBuffer.BindAttribute(ctx.vertices);
		if (uselighting && this.glNormalsBuffer) {
			ctx.EnableNormals(true);
			this.glNormalsBuffer.BindAttribute(ctx.normals);
		}
		else {
			ctx.EnableNormals(false);
		}
		if (usescalars && this.glScalarBuffer) {
			ctx.EnableScalars(true);
			this.glScalarBuffer.BindAttribute(ctx.scalarvalue);
		}
		else {
			ctx.EnableScalars(false);
		}
	}

	Draw(ctx: DrawingContext) {
		ctx.gl.drawArrays(ctx.gl.POINTS, 0, this.cloudsize);
		ctx.EnableScalars(false);
	}

	Clear() {
		if (this.glPointsBuffer) {
			this.glPointsBuffer.Clear();
			this.glPointsBuffer = null;
		}
		if (this.glNormalsBuffer) {
			this.glNormalsBuffer.Clear();
			this.glNormalsBuffer = null;
		}
		if (this.glScalarBuffer) {
			this.glScalarBuffer.Clear();
			this.glScalarBuffer = null;
		}
	}
}