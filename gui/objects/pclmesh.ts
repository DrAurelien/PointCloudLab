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


//=================================================
// The PCLMesh provides an interface to interact with a simplicial mesh
// - Show the mesh
// - Perform actions on the mesh
// - Get/set the mesh properties
//=================================================
class PCLMesh extends PCLPrimitive implements Pickable {
	drawing: MeshDrawing;

	constructor(public mesh: Mesh) {
		super(NameProvider.GetName('Mesh'));
		this.drawing = new MeshDrawing();
	}

	GetPrimitiveBoundingBox(): BoundingBox {
		return this.mesh.GetBoundingBox();
	}

	DrawPrimitive(drawingContext: DrawingContext): void {
		this.drawing.FillBuffers(this.mesh, drawingContext);
		this.drawing.Draw(this.lighting, drawingContext);
	}

	InvalidateDrawing() {
		this.drawing.Clear();
		this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
	}


	RayIntersection(ray: Ray): Picking {
		return this.mesh.RayIntersection(ray, this);
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

	GetSerializationID(): string {
		return 'POINTCLOUD';
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
			ctx.gl.drawElements(ctx.gl.LINES, this.buffersize, ctx.GetIntType(), 0);
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