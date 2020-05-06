﻿class PointCloud extends CADPrimitive {
	points: number[];
	pointssize: number;
	normals: number[];
	normalssize: number;
	glPointsBuffer: WebGLBuffer;
	glNormalsBuffer: WebGLBuffer;
	tree: KDTree = null;
	ransac: Ransac;
	fields: ScalarField[];
	currentfield: number;
	shownormals: boolean;

	static DensityFieldName = 'Density';

	constructor() {
		super(NameProvider.GetName('PointCloud'));
		this.points = [];
		this.pointssize = 0;
		this.normals = [];
		this.normalssize = 0;
		this.fields = [];
		this.boundingbox = new BoundingBox();
		this.glPointsBuffer = null;
		this.glNormalsBuffer = null;
		this.currentfield = null;
		this.shownormals = true;
	}

	PushPoint(p: Vector): void {
		if (this.pointssize + p.Dimension() > this.points.length) {
			//Not optimal (Reserve should be called before callin PushPoint)
			this.Reserve(this.points.length + p.Dimension());
		}

		for (var index = 0; index < p.Dimension(); index++) {
			this.points[this.pointssize++] = p.Get(index);
		}
		this.boundingbox.Add(p);
		this.tree = null;
	}

	Reserve(capacity: number) {
		var points = new Array(3 * capacity);
		for (var index = 0; index < this.pointssize; index++) {
			points[index] = this.points[index];
		}
		this.points = points;

		var normals = new Array(3 * capacity);
		for (var index = 0; index < this.normalssize; index++) {
			normals[index] = this.normals[index];
		}
		this.normals = normals;
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

	GetPoint(i: number): Vector {
		var index = 3 * i;
		return new Vector([
			this.points[index],
			this.points[index + 1],
			this.points[index + 2]]);
	}

	GetPointCoordinate(i: number, j: number): number {
		return this.points[3 * i + j]
	}

	Size(): number {
		return this.pointssize / 3;
	}

	PushNormal(n: Vector): void {
		if (this.normalssize + n.Dimension() > this.normals.length) {
			//Not optimal (Reserve should be called before callin PushPoint)
			this.Reserve(this.normals.length + n.Dimension());
		}

		for (var index = 0; index < n.Dimension(); index++) {
			this.normals[this.normalssize++] = n.Get(index);
		}
	}

	GetNormal(i: number): Vector {
		var index = 3 * i;
		return new Vector([
			this.normals[index],
			this.normals[index + 1],
			this.normals[index + 2]]);
	}

	InvertNormal(i: number): void {
		for (let index = 0; index < 3; index++) {
			this.normals[3 * i + index] = -this.normals[3 * i + index];
		}
	}

	HasNormals(): boolean {
		return (this.normalssize == this.pointssize);
	}

	ClearNormals(): void {
		this.normalssize = 0;
	}

	PrepareRendering(drawingContext: DrawingContext) {
		var shapetransform = Matrix.Identity(4);
		drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));

		if (!this.glPointsBuffer) {
			this.glPointsBuffer = drawingContext.gl.createBuffer();
			drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
			drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.points), drawingContext.gl.STATIC_DRAW);
		}
		drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
		drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);

		if (this.HasNormals() && this.shownormals) {
			drawingContext.EnableNormals(true);
			if (!this.glNormalsBuffer) {
				this.glNormalsBuffer = drawingContext.gl.createBuffer();
				drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glNormalsBuffer);
				drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.normals), drawingContext.gl.STATIC_DRAW);
			}
			drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glNormalsBuffer);
			drawingContext.gl.vertexAttribPointer(drawingContext.normals, 3, drawingContext.gl.FLOAT, false, 0, 0);
		}
		else {
			drawingContext.EnableNormals(false);
		}

		if (this.currentfield !== null) {
			this.fields[this.currentfield].PrepareRendering(drawingContext);
		}
		else {
			ScalarField.ClearRendering(drawingContext);
		}
	}

	Draw(drawingContext: DrawingContext) {
		if (this.visible) {
			this.material.InitializeLightingModel(drawingContext);

			this.PrepareRendering(drawingContext);

			drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, this.Size());

			ScalarField.ClearRendering(drawingContext);

			if (this.selected && this.pointssize > 0) {
				this.boundingbox.Draw(drawingContext);
			}
		}
	}

	KNearestNeighbours = function (queryPoint: Vector, k: number) {
		if (!this.tree) {
			console.log('Computing KD-Tree for point cloud "' + this.name + '"');
			this.tree = new KDTree(this);
		}

		var knn = new KNearestNeighbours(k);
		this.tree.FindNearestNeighbours(queryPoint, knn);
		return knn.Neighbours();
	}

	RayIntersection(ray: Ray): Picking {
		return new Picking(this);
	}

	ComputeNormal(index: number, k: number): Vector {
		//Get the K-nearest neighbours (including the query point)
		var point = this.GetPoint(index);
		let knn = this.KNearestNeighbours(point, k + 1);

		//Compute the covariance matrix
		var covariance = Matrix.Null(3, 3);
		var center = new Vector([0, 0, 0]);
		for (var ii = 0; ii < knn.length; ii++) {
			if (knn[ii].index != index) {
				center = center.Plus(this.GetPoint(knn[ii].index));
			}
		}
		center = center.Times(1 / (knn.length - 1));
		for (var kk = 0; kk < knn.length; kk++) {
			if (knn[kk].index != index) {
				var vec = this.GetPoint(knn[kk].index).Minus(center);
				for (var ii = 0; ii < 3; ii++) {
					for (var jj = 0; jj < 3; jj++) {
						covariance.SetValue(ii, jj,
							covariance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj))
						);
					}
				}
			}
		}

		//The normal is the eigenvector having the smallest eigenvalue in the covariance matrix
		for (var ii = 0; ii < 3; ii++) {
			//Check no column is null in the covariance matrix
			if (covariance.GetColumnVector(ii).SqrNorm() <= 1.0e-12) {
				var result = new Vector([0, 0, 0]);
				result.Set(ii, 1);
				return result;
			}
		}
		var eigen = new EigenDecomposition(covariance);
		if (eigen) {
			return eigen[0].eigenVector.Normalized();
		}

		return null;
	}

	ComputeConnectedComponents(k: number, onDone: CADNodeHandler) {
		k = k || 30;
		let builder = new PCDProcessing.ConnecterComponentsBuilder(this, k);
		builder.SetNext((b: PCDProcessing.ConnecterComponentsBuilder) => onDone(b.result));
		builder.Start();
	}

	ComputeDensity(k: number, onDone: Function) {
		k = k || 30;
		let density = new PCDProcessing.DensityComputer(this, k);
		density.SetNext(() => onDone());
		density.Start();

	}

	ComputeNormals(k: number, ondone: Function) {
		k = k || 30;
		let ncomputer = new PCDProcessing.NormalsComputer(this, k);
		let nharmonizer = new PCDProcessing.NormalsHarmonizer(this, k);
		ncomputer.SetNext(nharmonizer).SetNext(() => ondone());
		ncomputer.Start();
	}

	GaussianSphere(): PointCloud {
		var gsphere = new PointCloud();
		gsphere.Reserve(this.Size());
		for (var index = 0; index < this.Size(); index++) {
			gsphere.PushPoint(this.GetNormal(index));
		}
		return gsphere;
	}

	GetCSVData(): string {
		var result = 'x;y;z';
		if (this.HasNormals()) {
			result += ';nx;ny;nz';
		}
		for (let field = 0; field < this.fields.length; field++) {
			result += ';' + this.fields[field].name.replace(';', '_');
		}
		result += '\n';

		for (let index = 0; index < this.Size(); index++) {
			let point = this.GetPoint(index);
			result += point.Get(0) + ';' +
				point.Get(1) + ';' +
				point.Get(2);

			if (this.HasNormals()) {
				let normal = this.GetNormal(index);
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

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let cloud = this;
		let result: Action[] = super.GetActions(dataHandler, onDone);

		result.push(null);
		if (this.HasNormals()) {
			result.push(new ClearNormalsAction(cloud, onDone));
		}
		else {
			result.push(new ComputeNormalsAction(cloud, onDone));
		}
		result.push(new GaussianSphereAction(cloud, onDone));

		result.push(null);

		result.push(new ConnectedComponentsAction(cloud, onDone));
		result.push(new ComputeDensityAction(cloud, onDone));

		result.push(null);
		let ransac = false;
		if (cloud.ransac) {
			result.push(new ResetDetectionAction(cloud, onDone));
			ransac = true;
		}
		if (!(cloud.ransac && cloud.ransac.IsDone())) {
			result.push(new RansacDetectionAction(cloud, onDone));
			ransac = true;
		}

		if (ransac)
			result.push(null);
		result.push(new ExportPointCloudFileAction(cloud, onDone));

		return result;
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();

		let self = this;
		let normals = new BooleanProperty('Lighting', this.shownormals, (b: boolean) => { self.shownormals = b });
		properties.Push(normals);

		let points = new NumberProperty('Points', this.Size(), null);
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
			ScalarField.InvalidateBufferedField();
		});
	}
}

namespace PCDProcessing {
	export class NormalsComputer extends IterativeLongProcess {
		constructor(private cloud: PointCloud, private k: number) {
			super(cloud.Size(), 'Computing normals (' + cloud.Size() + ' data points)');
		}

		Initialize() {
			if (this.cloud.normals.length != this.cloud.points.length) {
				this.cloud.normals = new Array(this.cloud.points.length);
			}
			this.cloud.ClearNormals();
		}

		Iterate(step: number) {
			var normal = this.cloud.ComputeNormal(step, this.k);
			this.cloud.PushNormal(normal);
		}
	};

	export class NormalsHarmonizer extends RegionGrowthProcess {
		constructor(cloud: PointCloud, k: number) {
			super(cloud, k, 'Harmonizing normals (' + cloud.Size() + ' data points)');
		}

		ProcessPoint(cloud: PointCloud, index: number, knn: Neighbour[], region: number) {
			//Search for the neighbor whose normal orientation has been decided,
			//and whose normal is the most aligned with the current one
			let ss = 0;
			let normal = cloud.GetNormal(index);
			for (var ii = 0; ii < knn.length; ii++) {
				let nnindex = knn[ii].index;
				if (this.Status(nnindex) === RegionGrowthStatus.processed) {
					let nnormal = cloud.GetNormal(nnindex);
					let s = nnormal.Dot(normal);
					if (Math.abs(s) > Math.abs(ss))
						ss = s;
				}
			}
			if (ss < 0)
				cloud.InvertNormal(index);
		}
	};

	export class ConnecterComponentsBuilder extends RegionGrowthProcess {
		result: CADGroup;

		constructor(cloud: PointCloud, k: number) {
			super(cloud, k, 'Computing connected components');

			this.result = new CADGroup(cloud.name + ' - ' + k + '-connected components');
		}

		ProcessPoint(cloud: PointCloud, index: number, knn: Neighbour[], region: number) {
			if (region >= this.result.children.length)
				this.result.Add(new PointCloud());
			let component = <PointCloud>this.result.children[region];
			component.PushPoint(cloud.GetPoint(index));
			if (cloud.HasNormals())
				component.PushNormal(cloud.GetNormal(index));
		}
	}

	export class DensityComputer extends IterativeLongProcess {
		scalarfield: ScalarField;

		constructor(private cloud: PointCloud, private k: number) {
			super(cloud.Size(), 'Computing points density');
		}

		Initialize() {
			this.scalarfield = this.cloud.AddScalarField(PointCloud.DensityFieldName);
		}

		Finalize() {
			this.cloud.SetCurrentField(PointCloud.DensityFieldName);
		}

		Iterate(step: number) {
			let nbh = this.cloud.KNearestNeighbours(this.cloud.GetPoint(step), this.k + 1);
			let ballSqrRadius = nbh.pop().distance;
			this.scalarfield.PushValue(this.k / Math.sqrt(ballSqrRadius));
		}
	}
}