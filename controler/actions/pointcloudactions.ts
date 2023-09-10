/// <reference path="action.ts" />
/// <reference path="../../tools/longprocess.ts" />
/// <reference path="../../model/pointcloud.ts" />
/// <reference path="../../model/scalarfield.ts" />
/// <reference path="../../model/ransac.ts" />
/// <reference path="../../model/regiongrowth.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../gui/objects/pclpointcloud.ts" />
/// <reference path="../../gui/objects/pclscalarfield.ts" />
/// <reference path="../../gui/objects/pclshapewrapper.ts" />
/// <reference path="../../gui/controls/dialog.ts" />
/// <reference path="../../gui/controls/hint.ts" />
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
class RansacDetectionAction extends PCLCloudAction implements Stopable {
	ransac: Ransac;
	progress: ProgressBar;
	result: PCLGroup;
	stoped: boolean;
	pendingstep: RansacStepProcessor;

	constructor(cloud: PCLPointCloud) {
		super(cloud, 'Detect shapes ...', 'Try to detect as many shapes as possible in the selected point cloud (using the RANSAC algorithm)');
	}

	Enabled() {
		return this.GetCloud().HasNormals();
	}

	Trigger() {
		let self = this;
		var dialog = new Dialog(
			(d: Dialog) => { return self.InitializeAndLauchRansac(d); },
			(d: Dialog) => { return true; }
		);
		dialog.InsertValue('Failures', 100);
		dialog.InsertValue('Noise', 0.1);
		dialog.InsertTitle('Shapes to detect');
		dialog.InsertCheckBox('Planes', true);
		dialog.InsertCheckBox('Spheres', true);
		dialog.InsertCheckBox('Cylinders', true);
		dialog.InsertCheckBox('Cones', true);
	}

	InitializeAndLauchRansac(properties: Dialog): boolean {
		let nbFailure;
		let noise;
		try {
			nbFailure = parseInt(properties.GetValue('Failures'));
			noise = parseFloat(properties.GetValue('Noise'));
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
		if (properties.GetValue('Cones'))
			generators.push(Ransac.RansacCone);

		let self = this;
		this.stoped = false;
		this.ransac = new Ransac(this.GetCloud(), generators, nbFailure, noise);
		this.progress = new ProgressBar(() => self.Stop());
		this.progress.Initialize('Dicovering shapes in the point cloud', this);

		this.LaunchNewRansacStep();

		return true;
	}

	Stopable(): boolean {
		return true;
	}

	Stop() {
		this.stoped = true;
		if (this.pendingstep) {
			this.pendingstep.Stop();
		}
		this.progress.Finalize();
		this.progress.Delete();
	}

	LaunchNewRansacStep() {
		let self = this;

		let target = this.ransac.cloud.Size();
		let done = target - this.ransac.remainingPoints
		this.progress.Update(done, target);

		if (this.ransac.remainingPoints > this.ransac.nbPoints && !this.stoped) {
			setTimeout(() => {
				self.pendingstep = self.ransac.FindBestFittingShape((s: Candidate) => self.HandleResult(s))
			}, this.progress.RefreshDelay());
		}
		else {
			if (!this.stoped) {
				this.GetPCLCloud().SetVisibility(false);
			}
			this.progress.Finalize();
			this.progress.Delete();
		}
	}

	HandleResult(candidate: Candidate) {
		if (!this.stoped) {
			if (!this.result) {
				this.result = new PCLGroup('Shapes detection in "' + this.GetPCLCloud().name + '"');
				let owner = this.GetPCLCloud().owner;
				owner.Add(this.result);
				this.result.NotifyChange(this.result, ChangeType.NewItem);
			}

			let subcloud = new PointSubCloud(this.ransac.cloud, candidate.points);
			let segment = new PCLPointCloud(subcloud.ToPointCloud());
			this.result.Add(segment);
			segment.NotifyChange(segment, ChangeType.NewItem);

			let pclshape = new PCLShapeWrapper(candidate.shape).GetPCLShape();
			this.result.Add(pclshape);
			pclshape.NotifyChange(pclshape, ChangeType.NewItem);

			this.LaunchNewRansacStep();
		}
	}
}

//===================================================
// Shapes fitting
//===================================================
class ShapeFittingResult {
	shapes: Shape[];
	errors: number[];

	constructor(public cloud: PointCloud) {
		this.shapes = [];
		this.errors = [];
	}

	AddFittingResult(shape: Shape) {
		let error = 0;
		let size = this.cloud.Size();
		for (let index = 0; index < size; index++) {
			error += shape.Distance(this.cloud.GetPoint(index)) ** 2;
		}
		error /= size;

		this.shapes.push(shape);
		this.errors.push(error);
	}

	GetBestShape(): Shape {
		let bestindex = null;
		let besterror = null;
		for (let index = 0; index < this.shapes.length; index++) {
			if (besterror === null || this.errors[index] < besterror) {
				bestindex = index;
				besterror = this.errors[index];
			}
		}
		if (bestindex !== null) {
			this.ShowResult(bestindex);
			return this.shapes[bestindex];
		}
		return null;
	}

	private ShowResult(bestShapeIndex: number) {
		let message: string = 'Shapes fitting results :\n';
		message += '<table><tbody><tr style="font-style:italic;"><td>Shape</td><td>Mean Square Error</td></tr>';
		for (let index = 0; index < this.shapes.length; index++) {
			let emphasize = (index === bestShapeIndex);
			message += '<tr' + (emphasize ? ' style="color:green; text-decoration:underline;"' : '') + '>';
			message += '<td style="font-weight:bold;">';
			message += this.shapes[index].constructor['name'];
			message += '</td><td>';
			message += this.errors[index];
			message += '</td></tr>';
		}
		message += '</tbody></table>';
		new TemporaryHint(message, null);
	}
}

class FindBestFittingShapeAction extends PCLCloudAction {
	results: ShapeFittingResult;

	constructor(cloud: PCLPointCloud) {
		super(cloud,'Find the best fitting shape ...', 'Compute the shape (plane, sphere, cylinder, cone) that best fits the whole selected point cloud (assuming the point cloud samples a single shape)');
	}

	Enabled(): boolean {
		return true;
	}

	Trigger() {
		let self = this;
		var dialog = new Dialog(
			(d: Dialog) => { return self.ComputeBestFittingShape(d); },
			(d: Dialog) => { return true; }
		);
		dialog.InsertTitle('Shapes to be tested');
		dialog.InsertCheckBox('Plane', true);
		dialog.InsertCheckBox('Sphere', true);
		dialog.InsertCheckBox('Cylinder', true);
		dialog.InsertCheckBox('Cone', true);
		dialog.InsertCheckBox('Torus', true);
	}

	ComputeBestFittingShape(properties: Dialog): boolean {
		let cloud = this.GetCloud();
		this.results = new ShapeFittingResult(cloud);

		let fittingProcesses: LSFittingProcess[] = []
		if (properties.GetValue('Plane')) {
			fittingProcesses.push(new PlaneFittingProcess(this.results));
		}
		if (properties.GetValue('Sphere')) {
			fittingProcesses.push(new SphereFittingProcess(this.results));
		}
		if (properties.GetValue('Cylinder')) {
			fittingProcesses.push(new CylinderFittingProcess(this.results));
		}
		if (properties.GetValue('Cone')) {
			fittingProcesses.push(new ConeFittingProcess(this.results));
		}
		if (properties.GetValue('Torus')) {
			fittingProcesses.push(new TorusFittingProcess(this.results));
		}

		if (fittingProcesses.length) {
			let self = this;
			for (let index = 1; index < fittingProcesses.length; index++) {
				fittingProcesses[index - 1].SetNext(fittingProcesses[index]);
			}
			fittingProcesses[fittingProcesses.length - 1].SetNext(() => self.HandleResult());
			fittingProcesses[0].Start();
			return true;
		}
		return false;
	}

	HandleResult() {
		let shape = this.results.GetBestShape();
		if (shape) {
			let pclshape = (new PCLShapeWrapper(shape)).GetPCLShape();
			pclshape.name = 'Best fit to "' + this.GetPCLCloud().name + '"';
			let owner = this.GetPCLCloud().owner;
			owner.Add(pclshape);
			owner.NotifyChange(pclshape, ChangeType.NewItem);
		}
	}
}

abstract class LSFittingProcess extends Process {
	constructor(protected fittingResult: ShapeFittingResult) {
		super();
	}

	Run(ondone: Function) {
		let shape = this.GetInitialGuess(this.fittingResult.cloud);
		let fitting = shape.FitToPoints(this.fittingResult.cloud);
		if (fitting) {
			let self = this;
			fitting.SetNext(() => self.fittingResult.AddFittingResult(shape));
			fitting.SetNext(ondone);
		}
		else {
			this.fittingResult.AddFittingResult(shape);
			ondone();
		}
	}

	abstract GetInitialGuess(cloud: PointCloud): Shape;
}

class PlaneFittingProcess extends LSFittingProcess {
	constructor(fittingResult: ShapeFittingResult) {
		super(fittingResult);
	}

	GetInitialGuess(): Shape {
		return new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 0);
	}
}

class SphereFittingProcess extends LSFittingProcess {
	constructor(fittingResult: ShapeFittingResult) {
		super(fittingResult);
	}

	GetInitialGuess(cloud: PointCloud): Shape {
		return Sphere.InitialGuessForFitting(cloud);
	}
}

class CylinderFittingProcess extends LSFittingProcess {
	constructor(fittingResult: ShapeFittingResult) {
		super(fittingResult);
	}

	GetInitialGuess(cloud: PointCloud): Shape {
		return Cylinder.InitialGuessForFitting(cloud);
	}
}

class ConeFittingProcess extends LSFittingProcess {
	constructor(fittingResult: ShapeFittingResult) {
		super(fittingResult);
	}

	GetInitialGuess(cloud: PointCloud): Shape {
		return Cone.InitialGuessForFitting(cloud);
	}
}

class TorusFittingProcess extends LSFittingProcess {
	constructor(fittingResult: ShapeFittingResult) {
		super(fittingResult);
	}

	GetInitialGuess(cloud: PointCloud): Shape {
		return Torus.InitialGuessForFitting(cloud);
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

	Trigger() {
		let k = 30;
		let cloud = this.GetPCLCloud();
		let ondone = () => cloud.InvalidateDrawing();
		let ncomputer = new NormalsComputer(this.GetCloud(), k);
		let nharmonizer = new NormalsHarmonizer(this.GetCloud(), k);
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
			if (this.Status(nnindex) === RegionGrowthStatus.processed && nnindex !== index) {
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

	Trigger() {
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

	Trigger() {
		let gsphere = new PCLPointCloud(new GaussianSphere(this.GetCloud()).ToPointCloud());
		gsphere.name = 'Gaussian sphere of "' + this.GetPCLCloud().name + '"';
		this.GetPCLCloud().NotifyChange(gsphere, ChangeType.NewItem);
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

	Trigger() {
		let k = 30;
		let self = this;
		let ondone = (b: ConnecterComponentsBuilder) => self.GetPCLCloud().NotifyChange(b.result, ChangeType.NewItem);
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

	Trigger() {
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
		let ballSqrRadius = nbh.GetSqrDistance();
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

	Trigger() {
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
		let nbh = cloud.KNearestNeighbours(point, this.k + 1).Neighbours();
		let noise = 0;
		for (let index = 0; index < nbh.length; index++) {
			noise += Math.abs(normal.Dot(cloud.GetPoint(nbh[index].index).Minus(point))) / (1 + nbh[index].sqrdistance);
		}
		this.scalarfield.PushValue(noise);
	}
}

//===================================================
// Distances
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

	Trigger() {
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
// Registration
//===================================================
class RegistrationAction extends PCLCloudAction {
	constructor(cloud: PCLPointCloud, private reference: PCLPointCloud) {
		super(cloud, 'Register', 'Compte the rigid motion that fits "' + cloud.name + '" to "' + reference.name + '"');
	}

	Enabled(): boolean {
		return true;
	}

	Trigger() {
		let self = this;
		let overlapLabel = 'Overlap (%)';
		let maxiterationsLabel = 'Max iterations';
		let dialog = new Dialog(
			(d) => {
				let overlap;
				let maxit;
				try {
					overlap = parseFloat(d.GetValue(overlapLabel)) / 100;
					maxit = parseInt(d.GetValue(maxiterationsLabel), 10);
				}
				catch {
					return false;
				}
				if (overlap > 1 || overlap < 0) {
					return false;
				}

				let pclCloud = self.GetPCLCloud();
				let registration = new ICPRegistration(self.reference.cloud, self.GetCloud(), overlap, maxit);
				registration.SetNext(() => pclCloud.InvalidateDrawing());
				registration.Start();
				return true;
			},
			(d) => { return true; }
		)

		dialog.InsertTitle('Registration settings (Trimmed Iterative Closest Points)')
		dialog.InsertValue(overlapLabel, 100);
		dialog.InsertValue(maxiterationsLabel, 20);
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

	Trigger() {
		FileExporter.ExportFile(this.GetPCLCloud().name + '.csv', this.GetPCLCloud().GetCSVData(), 'text/csv');
	}
}
