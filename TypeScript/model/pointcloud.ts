class PointCloud extends CADPrimitive {
	points: number[];
	pointssize: number;
	normals: number[];
	normalssize: number;
	glPointsBuffer: WebGLBuffer;
	glNormalsBuffer: WebGLBuffer;
	tree: KDTree = null;
	ransac: Object;

	constructor() {
		super(NameProvider.GetName('PointCloud'));
		this.points = [];
		this.pointssize = 0;
		this.normals = [];
		this.normalssize = 0;
		this.boundingbox = new BoundingBox();
		this.glPointsBuffer = null;
		this.glNormalsBuffer = null;
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

		if (this.HasNormals()) {
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
	}

	Draw(drawingContext: DrawingContext) {
		this.material.InitializeLightingModel(drawingContext);

		this.PrepareRendering(drawingContext);

		drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, this.Size());

		if (this.selected && this.pointssize > 0) {
			this.boundingbox.Draw(drawingContext);
		}
	}

	KNearestNeighbours = function (queryPoint, k) {
		if (!this.tree) {
			console.log('Computing KD-Tree for point cloud "' + this.name + '"');
			this.tree = new KDTree(this);
		}

		var knn = new KNearestNeighbours(k);
		this.tree.FindNearestNeighbours(queryPoint, knn);
		return knn.Neighbours();
	}

	RayIntersection(ray: Ray): number[] {
		return [];
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

	HarmonizeNormal(index: number, k: number, done: boolean[]) {
		if (!done[index]) {
			var point = this.GetPoint(index);
			var normal = this.GetNormal(index);
			var knn = this.KNearestNeighbours(point, k + 1);

			var votes =
				{
					pros: 0,
					cons: 0
				};

			for (var ii = 0; ii < knn.length; ii++) {
				if (done[knn[ii].index]) {
					var nnormal = this.GetNormal(knn[ii].index);
					var s = nnormal.Dot(normal);
					if (s < 0) {
						votes.cons++;
					}
					else {
						votes.pros++;
					}
				}
			}
			if (votes.pros < votes.cons) {
				this.InvertNormal(index);
			}
			done[index] = true;
		}
	}

	ComputeNormals = function (k, onDone) {
		if (!k) {
			k = 30;
		}

		var cloud = this;

		function Harmonize() {
			var index = 0;
			var done = new Array(cloud.Size());
			for (var ii = 0; ii < cloud.Size(); ii++) {
				done[ii] = false;
			}

			LongProcess.Run('Harmonizing normals (' + cloud.Size() + ' data points)', function () {
				if (index >= cloud.Size()) {
					return null;
				}
				cloud.HarmonizeNormal(index, k, done);
				index++;
				return { current: index, total: cloud.Size() };
			},
				onDone
			);
		}

		function Compute() {
			var index = 0;
			if (cloud.normals.length != cloud.points.length) {
				cloud.normals = new Array(cloud.points.length);
			}
			cloud.ClearNormals();

			LongProcess.Run('Computing normals (' + cloud.Size() + ' data points)', function () {
				if (index >= cloud.Size()) {
					return null;
				}
				var normal = cloud.ComputeNormal(index, k);
				cloud.PushNormal(normal);
				index++;
				return { current: index, total: cloud.Size() };
			},
				Harmonize
			);
		}

		Compute();
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
		result += '\n';

		for (var index = 0; index < this.Size(); index++) {
			var point = this.GetPoint(index);
			result += point.Get(0) + ';' +
				point.Get(1) + ';' +
				point.Get(2);

			if (this.HasNormals()) {
				var normal = this.GetNormal(index);
				result += ';' + normal.Get(0) + ';' +
					normal.Get(1) + ';' +
					normal.Get(2);
			}
			result += '\n';
		}
		return result;
	}

	GetActions(onDone: Function): Action[] {
		let cloud = this;
		let result : Action[] = [];

		function gaussianSpehereCallback() {
			var gsphere = cloud.GaussianSphere();
			if (onDone)
				onDone(gsphere);
		}

		function clearNormalCallback() {
			cloud.ClearNormals();
			if (onDone)
				onDone();
		}

		function resetDetectionCallback() {
			cloud.ransac = null;
			if (onDone)
				onDone();
		}
		
		if (this.HasNormals()) {
			result.push(new Action('Gaussian sphere', gaussianSpehereCallback));
			result.push(new Action('Clear normals', clearNormalCallback));

			if (cloud.ransac) {
				result.push(new Action('Reset detection', resetDetectionCallback));
			}
		}
			/*
			if (!(cloud.ransac && cloud.ransac.IsDone())) {
				result.push(new Action('Detect ' + (cloud.ransac ? 'another' : 'a') + ' shape', () => {
						if (!cloud.ransac) {
							cloud.ransac = new Ransac(cloud);
							var dialog = new Dialog(
								function (properties) {
									try {
										cloud.ransac.nbFailure = parseInt(properties.GetValue('Failures'));
										cloud.ransac.noise = parseFloat(properties.GetValue('Noise'));
									}
									catch (exc) {
										return false;
									}
									var generators = [];
									if (properties.GetValue('Planes')) {
										generators.push(RansacPlane);
									}
									if (properties.GetValue('Spheres')) {
										generators.push(RansacSphere);
									}
									if (properties.GetValue('Cylinders')) {
										generators.push(RansacCylinder);
									}
									cloud.ransac.SetGenerators(generators);

									cloud.ransac.FindBestFittingShape(onDone);
									return true;
								},
								function () {
									cloud.ransac = null;
									return true;
								}
							);
							dialog.InsertValue('Failures', cloud.ransac.nbFailure);
							dialog.InsertValue('Noise', cloud.ransac.noise);
							dialog.InsertTitle('Shapes to detect');
							dialog.InsertCheckBox('Planes', true);
							dialog.InsertCheckBox('Spheres', true);
							dialog.InsertCheckBox('Cylinders', true);
						}
						else {
							cloud.ransac.FindBestFittingShape(onDone);
						}
					}
				});
			}
		}
		else {
			result.push({
				label: 'Compute normals',
				callback: function () { cloud.ComputeNormals(0, onDone) }
			});
		}

		result.push({
			label: 'Export',
			callback: function () { ExportFile(cloud.name + '.csv', cloud.GetCSVData(), 'text/csv'); }
		});*/

		return result;
	}
}
