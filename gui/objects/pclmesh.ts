/// <reference path="../../model/mesh.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="pclprimitive.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../opengl/materials.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
/// <reference path="../../controler/actions/action.ts" />


//=================================================
// The PCLMesh provides an interface to interact with a simplicial mesh
// - Show the mesh
// - Perform actions on the mesh
// - Get/set the mesh properties
//=================================================
class PCLMesh extends PCLPrimitive implements Pickable {
	drawings: MeshDrawing[];

	constructor(public mesh: Mesh) {
		super(NameProvider.GetName('Mesh'));
		this.drawings = [];
	}

	GetPrimitiveBoundingBox(): BoundingBox {
		return this.mesh.GetBoundingBox();
	}

	DrawPrimitive(drawingContext: DrawingContext): void {
		this.UpdateMeshDrawings(drawingContext);
		for(let index=0; index<this.drawings.length ;index++)
			this.drawings[index].Draw(this.lighting, drawingContext);
	}

	InvalidateDrawing() {
		for(let index=0; index<this.drawings.length; index++)
			this.drawings[index].Clear();
		this.drawings = [];
		this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
	}

	UpdateMeshDrawings(drawingContext: DrawingContext)
	{
		if(this.drawings.length == 0)
		{
			let subMeshes = this.mesh.Split(drawingContext.gl.MAX_ELEMENT_INDEX);
			for(let index=0; index<subMeshes.length; index++)
			{
				let subMeshDrawing = new MeshDrawing();
				subMeshDrawing.FillBuffers(subMeshes[index], drawingContext);
				this.drawings.push(subMeshDrawing);
			}
		}
	}

	RayIntersection(ray: Ray): Picking {
		return this.mesh.RayIntersection(ray, this);
	}

	GetDistance(p: Vector): number {
		return this.mesh.Distance(p);
	}

	TransformPrivitive(transform: Transform) {
		this.mesh.ApplyTransform(transform);
		this.InvalidateDrawing();
	}

	FillProperties() {
		super.FillProperties();
		if (this.properties) {
			let self = this;
			let points = new NumberProperty('Points', () => self.mesh.pointcloud.Size(), null);
			points.SetReadonly();
			let faces = new NumberProperty('Faces', () => self.mesh.Size(), null);
			faces.SetReadonly();

			this.properties.Push(points);
			this.properties.Push(faces);
		}
	}

	GetActions(delegate: ActionDelegate): Action[] {
		let self = this;
		let actions = super.GetActions(delegate);
		actions.push(null);
		actions.push(new SimpleAction('Export to STL file', () => self.SaveToSTLFile()));
		return actions;
	}

	private SaveToSTLFile()
	{
		let serializer = new StlSerializer(this.mesh);
		FileExporter.ExportFile(this.name + '.stl', serializer.GetBuffer(), 'model/stl');
	}

	static SerializationID = 'MESH';
	GetSerializationID(): string {
		return PCLMesh.SerializationID;
	}

	SerializePrimitive(serializer: PCLSerializer) {
		let cloud = this.mesh.pointcloud;
		serializer.PushParameter('points', (s) => {
			s.PushInt32(cloud.pointssize);
			for (let index = 0; index < cloud.pointssize; index++) {
				s.PushFloat32(cloud.points[index]);
			}
		});
		let mesh = this.mesh;
		serializer.PushParameter('faces', (s) => {
			s.PushInt32(mesh.size);
			for (let index = 0; index < mesh.size; index++) {
				s.PushInt32(mesh.faces[index]);
			}
		});
	}

	GetParsingHandler(): PCLObjectParsingHandler {
		return new PCLMeshParsingHandler();
	}
}

class PCLMeshParsingHandler extends PCLPrimitiveParsingHandler {
	points: Float32Array;
	faces: Array<number>;

	constructor() {
		super();
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
			case 'faces':
				let nbfaces = parser.reader.GetNextInt32();
				this.faces = new Array(nbfaces);
				for (let index = 0; index < nbfaces; index++) {
					this.faces[index] = parser.reader.GetNextInt32();
				}
				return true;
		}
		return false;
	}

	FinalizePrimitive(): PCLPrimitive {
		let cloud = new PointCloud(this.points);
		let mesh = new Mesh(cloud, this.faces);
		let result = new PCLMesh(mesh);
		mesh.ComputeNormals(() => result.NotifyChange(result, ChangeType.Display));
		mesh.ComputeOctree();
		return result;
	}
}

class MeshDrawing {
	glIndexBuffer: ElementArrayBuffer;
	pcdrawing: PointCloudDrawing;
	context: DrawingContext;
	buffersize: number;

	constructor() {
		this.pcdrawing = new PointCloudDrawing();
		this.glIndexBuffer = null;
	}

	FillBuffers(mesh: Mesh, ctx: DrawingContext) {
		this.context = ctx;
		this.buffersize = mesh.size;

		this.pcdrawing.FillBuffers(mesh.pointcloud, null, ctx);

		if (!this.glIndexBuffer) {
			this.glIndexBuffer = new ElementArrayBuffer(mesh.faces, ctx);
		}
	}

	Draw(lighting: boolean, ctx: DrawingContext) {
		this.pcdrawing.BindBuffers(lighting, null, ctx);
		this.glIndexBuffer.Bind();

		if (ctx.rendering.Point()) {
			ctx.gl.drawElements(ctx.gl.POINTS, this.buffersize, ctx.GetIntType(), 0);
		}
		if (ctx.rendering.Surface()) {
			ctx.gl.drawElements(ctx.gl.TRIANGLES, this.buffersize, ctx.GetIntType(), 0);
		}
		if (ctx.rendering.Wire()) {
			for(let index=0; index<this.buffersize; index++)
			ctx.gl.drawElements(ctx.gl.LINE_LOOP, 3, ctx.GetIntType(), 3*index);
		}
	}

	Clear() {
		this.pcdrawing.Clear();
		if (this.glIndexBuffer) {
			this.glIndexBuffer.Clear();
			this.glIndexBuffer = null;
		}
	}
}