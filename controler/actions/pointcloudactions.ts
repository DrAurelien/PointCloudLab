/// <reference path="action.ts" />
/// <reference path="../../tools/longprocess.ts" />
/// <reference path="../../model/pointcloud.ts" />
/// <reference path="../../model/scalarfield.ts" />
/// <reference path="../../model/ransac.ts" />
/// <reference path="../../model/regiongrowth.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../gui/objects/pclpointcloud.ts" />
/// <reference path="../../gui/objects/pclscalarfield.ts" />
/// <reference path="../../gui/objects/pclshapewrapper.ts" />
/// <reference path="../../gui/controls/dialog.ts" />
/// <reference path="../../files/fileexporter.ts" />


//===================================================
// Generic actions
//===================================================
abstract class PCLCloudAction extends Action {
	constructor(private cloud: PCLPointCloud, message: string, hint: string = null) {
		super(message, hint);
	}

	GetPCLCloud(): PCLPointCloud {
		return this.cloud;
	}

	GetCloud(): PointCloud {
		return this.GetPCLCloud().cloud;
	}
}

//===================================================
// Generic cloud process
//===================================================
abstract class CloudProcess extends IterativeLongProcess {
	constructor(private cloud: PointCloud, message: string) {
		super(cloud.Size(), message)
	}

	GetResult(): PCLNode {
		return null;
	}
}

//===================================================
// Shapes detection
//===================================================
class ResetDetectionAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Reset detection');
	}

	Enabled(): boolean {
		return !!this.GetPCLCloud().ransac;
	}

	Run() {
		this.GetPCLCloud().ransac = null;
	}
}

class RansacDetectionAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Detect ' + (cloud.ransac ? 'another' : 'a') + ' shape', 'Try to detect the shape a shape in the poiutn cloud');
	}

	Enabled() {
		return this.GetCloud().HasNormals();
	}

	Run() {
		let cloud = this.GetPCLCloud();
		if (!cloud.ransac) {
			let self = this;
			cloud.ransac = new Ransac(this.GetCloud());
			var dialog = new Dialog(
				(d: Dialog) => { return self.InitializeAndLauchRansac(d); },
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
			let self = this;
			cloud.ransac.FindBestFittingShape((s: Shape) => self.HandleResult(s));
		}
	}

	InitializeAndLauchRansac(properties: Dialog): boolean {
		let ransac = this.GetPCLCloud().ransac;
		try {
			ransac.nbFailure = parseInt(properties.GetValue('Failures'));
			ransac.noise = parseFloat(properties.GetValue('Noise'));
		}
		catch (exc) {
			return false;
		}

		var generators = [];
		if (properties.GetValue('Planes'))
			generators.push(Ransac.RansacPlane);
		if (properties.GetValue('Spheres'))
			generators.push(Ransac.RansacSphere);
		if (properties.GetValue('Cylinders'))
			generators.push(Ransac.RansacCylinder);
		ransac.SetGenerators(generators);

		let self = this;
		ransac.FindBestFittingShape((s: Shape) => self.HandleResult(s));
		return true;
	}

	HandleResult(shape: Shape) {
		let pclshape = new PCLShapeWrapper(shape).GetPCLShape();
		let owner = this.GetPCLCloud().owner;
		owner.Add(pclshape);
		owner.NotifyChange(pclshape, ChangeType.Creation);
	}
}

//===================================================
// Normals computation
//===================================================
class ComputeNormalsAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Compute normals', 'Compute the vectors normal to the surface sampled by this point cloud');
	}

	Enabled(): boolean {
		return !this.GetCloud().HasNormals();
	}

	Run() {
		let k = 30;
		let cloud = this.GetPCLCloud();
		let ondone = () => cloud.InvalidateDrawing();
		let ncomputer = new NormalsComputer(this.GetCloud(), k);
		let nharmonizer = new NormalsComputer(this.GetCloud(), k);
		ncomputer.SetNext(nharmonizer).SetNext(ondone);
		ncomputer.Start();
	}
}

class NormalsComputer extends IterativeLongProcess {
	constructor(private cloud: PointCloud, private k: number) {
		super(cloud.Size(), 'Computing normals (' + cloud.Size() + ' data points)');
	}

	Initialize() {
		if (this.cloud.normals.length != this.cloud.points.length) {
			this.cloud.normals = new Float32Array(this.cloud.points.length);
		}
		this.cloud.ClearNormals();
	}

	Iterate(step: number) {
		var normal = this.cloud.ComputeNormal(step, this.k);
		this.cloud.PushNormal(normal);
	}
};

class NormalsHarmonizer extends RegionGrowthProcess {
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

class ClearNormalsAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Clear normals', 'Clear previously computed normals');
	}

	Enabled(): boolean {
		return this.GetCloud().HasNormals();
	}

	Run() {
		this.GetCloud().ClearNormals();
		this.GetPCLCloud().InvalidateDrawing();
	}
}

class GaussianSphereAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Extract the gaussian sphere', 'Builds a new point cloud made of the point cloud normals. The resulting point cloud will sample the unit sphere (since normals are unit vectors) - hence the name.');
	}

	Enabled(): boolean {
		return this.GetCloud().HasNormals();
	}

	Run() {
		let gsphere = new PCLPointCloud();
		let gcloud = gsphere.cloud;
		let cloud = this.GetCloud();
		let cloudSize = cloud.Size();
		gcloud.Reserve(cloudSize);
		for (let index = 0; index < cloudSize; index++) {
			gcloud.PushPoint(cloud.GetNormal(index));
		}
		this.GetPCLCloud().NotifyChange(gsphere, ChangeType.Creation);
	}
}

//===================================================
// Connected components
//===================================================
class ConnectedComponentsAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Compute connected components', 'Split the point cloud into connected subsets');
	}

	Enabled(): boolean {
		return true;
	}

	Run() {
		let k = 30;
		let self = this;
		let ondone = (b: ConnecterComponentsBuilder) => self.GetPCLCloud().NotifyChange(b.result, ChangeType.Creation);
		let builder = new ConnecterComponentsBuilder(this.GetCloud(), k, this.GetPCLCloud().name);
		builder.SetNext(ondone);
		builder.Start();
	}
}

class ConnecterComponentsBuilder extends RegionGrowthProcess {
	result: PCLGroup;

	constructor(cloud: PointCloud, k: number, prefix: string) {
		super(cloud, k, 'Computing connected components');

		this.result = new PCLGroup(prefix + ' - connected components');
	}

	ProcessPoint(cloud: PointCloud, index: number, knn: Neighbour[], region: number) {
		if (region >= this.result.children.length)
			this.result.Add(new PCLPointCloud());
		let component = (this.result.children[region] as PCLPointCloud).cloud;
		component.PushPoint(cloud.GetPoint(index));
		if (cloud.HasNormals())
			component.PushNormal(cloud.GetNormal(index));
	}
}

//===================================================
// Density
//===================================================
class ComputeDensityAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Compute density', 'Estimate the points density at each point of the cloud, and assign the corresponding scalar field');
	}

	Enabled(): boolean {
		return !this.GetPCLCloud().GetScalarField(PCLScalarField.DensityFieldName);
	}

	Run() {
		let k = 30;
		let density = new DensityComputer(this.GetPCLCloud(), k);
		density.Start();
	}
}


class DensityComputer extends IterativeLongProcess {
	scalarfield: PCLScalarField;

	constructor(private cloud: PCLPointCloud, private k: number) {
		super(cloud.cloud.Size(), 'Computing points density');
	}

	Initialize() {
		this.scalarfield = this.cloud.AddScalarField(PCLScalarField.DensityFieldName);
	}

	Finalize() {
		this.cloud.SetCurrentField(PCLScalarField.DensityFieldName);
	}

	Iterate(step: number) {
		let cloud = this.cloud.cloud;
		let nbh = cloud.KNearestNeighbours(cloud.GetPoint(step), this.k + 1);
		let ballSqrRadius = nbh.pop().sqrdistance;
		this.scalarfield.PushValue(this.k / Math.sqrt(ballSqrRadius));
	}
}

//===================================================
// Noise
//===================================================
class ComputeNoiseAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Estimate noise', 'Estimate the noise, based on the mean weighted distance to the local planar surface at each point (requires normals).');
	}

	Enabled(): boolean {
		if (!this.GetCloud().HasNormals())
			return false;
		return !this.GetPCLCloud().GetScalarField(PCLScalarField.NoiseFieldName);
	}

	Run() {
		let k = 10;
		let noise = new NoiseComputer(this.GetPCLCloud(), k);
		noise.Start();
	}
}


class NoiseComputer extends IterativeLongProcess {
	scalarfield: PCLScalarField;

	constructor(private cloud: PCLPointCloud, private k: number) {
		super(cloud.cloud.Size(), 'Computing points noise');
	}

	Initialize() {
		this.scalarfield = this.cloud.AddScalarField(PCLScalarField.NoiseFieldName);
	}

	Finalize() {
		this.cloud.SetCurrentField(PCLScalarField.NoiseFieldName);
	}

	Iterate(step: number) {
		let cloud = this.cloud.cloud;
		let point = cloud.GetPoint(step);
		let normal = cloud.GetNormal(step);
		let nbh = cloud.KNearestNeighbours(point, this.k + 1);
		let noise = 0;
		for (let index = 0; index < nbh.length; index++) {
			noise += Math.abs(normal.Dot(cloud.GetPoint(nbh[index].index).Minus(point))) / (1 + nbh[index].sqrdistance);
		}
		this.scalarfield.PushValue(noise);
	}
}

//===================================================
// Noise
//===================================================
class ComputeDistancesAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud, private target: PCLNode) {
		super(cloud, 'Compute distances', 'Compute distances from a point cloud to another object');
	}

	GetFieldName(): string {
		return 'Distance to "' + this.target.name + '"';
	}

	Enabled(): boolean {
		return !this.GetPCLCloud().GetScalarField(this.GetFieldName());
	}

	Run() {
		let noise = new DistancesComputer(this.GetPCLCloud(), this.target, this.GetFieldName());
		noise.Start();
	}
}

class DistancesComputer extends IterativeLongProcess {
	scalarfield: PCLScalarField;

	constructor(private cloud: PCLPointCloud, private target:PCLNode, private fieldName) {
		super(cloud.cloud.Size(), 'Computing distances');
	}
	
	Initialize() {
		this.scalarfield = this.cloud.AddScalarField(this.fieldName);
	}

	Finalize() {
		this.cloud.SetCurrentField(this.fieldName);
	}

	Iterate(step: number) {
		let cloud = this.cloud.cloud;
		this.scalarfield.PushValue(this.target.GetDistance(cloud.GetPoint(step)));
	}
}


//===================================================
// File export
//===================================================
class ExportPointCloudFileAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Export CSV file');
	}

	Enabled(): boolean {
		return true;
	}

	Run() {
		FileExporter.ExportFile(this.GetPCLCloud().name + '.csv', this.GetPCLCloud().GetCSVData(), 'text/csv');
	}
}
