/// <reference path="../../model/pointcloud.ts" />
/// <reference path="../../controler/actions/pointcloudactions.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/booleanproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />


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

	static DensityFieldName = 'Density';

	constructor(public cloud: PointCloud = null) {
		super(NameProvider.GetName('PointCloud'));
		this.fields = [];
		this.currentfield = null;
		this.drawing = new PointCloudDrawing();
		if (!this.cloud) {
			this.cloud = new PointCloud();
		}
	}

	AddScalarField(name: string) {
		let field = new ScalarField(name);
		this.fields.push(field);
		return field;
	}

	GetScalarField(name: string): ScalarField {
		for (let index = 0; index < this.fields.length; index++) {
			if (this.fields[index].name === name) {
				return this.fields[index];
			}
		}
		return null;
	}

	SetCurrentField(name: string): boolean {
		for (let index = 0; index < this.fields.length; index++) {
			if (this.fields[index].name === name) {
				this.currentfield = index;
				return true;
			}
		}
		this.currentfield = null;
		return false;
	}

	RayIntersection(ray: Ray): Picking {
		return new Picking(this);
	}

	GetBoundingBox(): BoundingBox {
		return this.cloud.boundingbox;
	}

	GetActions(delegate: ActionDelegate, onDone: PCLNodeHandler): Action[] {
		let cloud = this;
		let result: Action[] = super.GetActions(delegate, onDone);

		result.push(null);
		if (this.cloud.HasNormals()) {
			result.push(new ClearNormalsAction(this, onDone));
		}
		else {
			result.push(new ComputeNormalsAction(this, onDone));
		}
		result.push(new GaussianSphereAction(this, onDone));

		result.push(null);

		result.push(new ConnectedComponentsAction(this, onDone));
		result.push(new ComputeDensityAction(this, onDone));

		result.push(null);
		let ransac = false;
		if (cloud.ransac) {
			result.push(new ResetDetectionAction(this, onDone));
			ransac = true;
		}
		if (!(cloud.ransac && cloud.ransac.IsDone())) {
			result.push(new RansacDetectionAction(this, onDone));
			ransac = true;
		}

		if (ransac)
			result.push(null);
		result.push(new ExportPointCloudFileAction(this, onDone));

		return result;
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();

		let self = this;
		let normals = new BooleanProperty('Lighting', this.drawing.lighting, (b: boolean) => { self.drawing.lighting = b });
		properties.Push(normals);

		let points = new NumberProperty('Points', this.cloud.Size(), null);
		points.SetReadonly();
		properties.Push(points);

		if (this.fields.length) {
			let fields = new PropertyGroup('Scalar fields');
			for (let index = 0; index < this.fields.length; index++) {
				fields.Add(this.GetScalarFieldProperty(index));
			}
			properties.Push(fields);
		}

		return properties;
	}

	private GetScalarFieldProperty(index: number): Property {
		let self = this;
		return new BooleanProperty(this.fields[index].name, index === this.currentfield, (value: boolean) => {
			self.currentfield = value ? index : null;
		});
	}


	DrawPrimitive(drawingContext: DrawingContext) {
		let field = this.currentfield !== null ? this.fields[this.currentfield] : null;

		this.drawing.Prepare(this.cloud, field, drawingContext);

		this.drawing.Draw(this.cloud, drawingContext);
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
}

class PointCloudDrawing {
	glPointsBuffer: FloatBuffer;
	glNormalsBuffer: FloatBuffer;
	glScalarBuffer: FloatBuffer;
	bufferedScalarField: ScalarField;
	lighting: boolean;

	constructor() {
		this.glNormalsBuffer = null;
		this.glPointsBuffer = null;
		this.lighting = true;
	}

	Prepare(cloud: PointCloud, field: ScalarField, ctx: DrawingContext) {
		var shapetransform = Matrix.Identity(4);
		ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, new Float32Array(shapetransform.values));

		if (!this.glPointsBuffer) {
			this.glPointsBuffer = new FloatBuffer(cloud.points, ctx, 3);
		}
		this.glPointsBuffer.Bind(ctx.vertices);

		if (cloud.HasNormals() && this.lighting) {
			ctx.EnableNormals(true);
			if (!this.glNormalsBuffer) {
				this.glNormalsBuffer = new FloatBuffer(cloud.normals, ctx, 3);
			}
			this.glNormalsBuffer.Bind(ctx.normals);
		}
		else {
			ctx.EnableNormals(false);
		}

		if (field) {
			ctx.EnableScalars(true);
			if (!this.glScalarBuffer || this.bufferedScalarField !== field) {
				this.glScalarBuffer = new FloatBuffer(field.values, ctx, 1);
				this.bufferedScalarField = field;
				ctx.gl.uniform1f(ctx.minscalarvalue, field.Min());
				ctx.gl.uniform1f(ctx.maxscalarvalue, field.Max());
			}
			this.glScalarBuffer.Bind(ctx.scalarvalue);
		}
		else {
			ctx.EnableScalars(false);
		}
	}

	Draw(cloud: PointCloud, ctx: DrawingContext) {
		ctx.gl.drawArrays(ctx.gl.POINTS, 0, cloud.Size());
		ctx.EnableScalars(false);
	}
}