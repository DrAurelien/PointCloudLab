﻿/// <reference path="drawingcontext.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/interval.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="../../controler/controler.ts" />


class ScreenDimensions {
	constructor(public width: number, public height: number) {
	}
}

class Base {
	constructor(public right: Vector, public up: Vector, public lookAt: Vector, public distance: number) {
	}
}

class Camera implements ViewPoint {
	//Camera location
	at: Vector;
	//Camera aim point
	to: Vector;
	//Camera vertical direction
	up: Vector;
	//near clipping distance
	depthRange : Interval;
	//Field of view
	fov: number;
	//Screen dimensions
	screen: ScreenDimensions;

	constructor(context: DrawingContext) {
		this.at = new Vector([10.0, 10.0, 10.0]);
		this.to = new Vector([.0, .0, .0]);
		this.up = new Vector([.0, 1.0, .0]);
		this.depthRange = new Interval();
		this.fov = Math.PI / 4;

		this.InititalizeDrawingContext(context);
	}

	InititalizeDrawingContext(context: DrawingContext): void {
		//Screen size
		this.screen = new ScreenDimensions(context.renderingArea.width, context.renderingArea.height);

		//ModelView
		var modelview = this.GetModelViewMatrix();
		context.gl.uniformMatrix4fv(context.modelview, false, modelview.values);

		//Projection
		var projection = this.GetProjectionMatrix();
		context.gl.uniformMatrix4fv(context.projection, false, projection.values);

		//Lighting
		context.gl.uniform3fv(context.eyeposition, new Float32Array(this.at.Flatten()));
		context.gl.viewport(0, 0, this.screen.width, this.screen.height);
		context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT);
	}

	GetInnerBase(): Base {
		let lookAt: Vector = this.to.Minus(this.at);
		let d: number = lookAt.Norm();
		lookAt = lookAt.Times(1. / d);
		let right: Vector = lookAt.Cross(this.up).Normalized();
		let up: Vector = right.Cross(lookAt).Normalized();
		return { right: right, up: up, lookAt: lookAt, distance: d };
	}

	GetModelViewMatrix(): Matrix {
		let innerBase: Base = this.GetInnerBase();
		var basechange = Matrix.Identity(4);
		var translation = Matrix.Identity(4);
		for (var index = 0; index < 3; index++) {
			basechange.SetValue(0, index, innerBase.right.Get(index));
			basechange.SetValue(1, index, innerBase.up.Get(index));
			basechange.SetValue(2, index, -innerBase.lookAt.Get(index));
			translation.SetValue(index, 3, -this.at.Get(index));
		}
		return basechange.Multiply(translation);
	}

	GetProjectionMatrix(): Matrix {
		let near = this.depthRange.min;
		let far = this.depthRange.max;
		let aspectRatio: number = this.screen.width / this.screen.height;
		var projection = Matrix.Null(4, 4);
		var f = 1. / Math.tan(this.fov / 2.);
		projection.SetValue(0, 0, f / aspectRatio);
		projection.SetValue(1, 1, f);
		projection.SetValue(2, 2, -(near + far) / (far - near));
		projection.SetValue(2, 3, -(2.0 * near * far) / (far - near));
		projection.SetValue(3, 2, -1.0);
		return projection;
	}

	GetTranslationVector(dx: number, dy: number): Vector {
		let f = Math.tan(this.fov / 2.0);
		let innerBase = this.GetInnerBase();
		let objectSpaceHeight = f * innerBase.distance;
		let objectSpaceWidth = objectSpaceHeight * this.screen.width / this.screen.height;

		let deltax = innerBase.right.Times(objectSpaceWidth * -dx / this.screen.width);
		let deltay = innerBase.up.Times(-(objectSpaceHeight * -dy / this.screen.height));
		return deltax.Plus(deltay);
	}

	GetScreenHeight() {
		return this.screen.height;
	}

	Pan(dx: number, dy: number) {
		let delta = this.GetTranslationVector(dx, dy);
		this.at = this.at.Plus(delta);
		this.to = this.to.Plus(delta);
	}

	protected TrackBallProjection(x: number, y: number): Vector {
		//Transform creen coordinates to inner trackball coordinates
		let point = new Vector([(x / this.screen.width) - 0.5, -((y / this.screen.height) - 0.5), 0]);
		let sqrnorm = point.SqrNorm();
		point.Set(2, (sqrnorm < 0.5) ? (1.0 - sqrnorm) : (0.5 / Math.sqrt(sqrnorm)));

		//compute scene coordinates instead of inner coordinates
		let innerBase = this.GetInnerBase();
		let result = innerBase.right.Times(point.Get(0));
		result = result.Plus(innerBase.up.Times(point.Get(1)));
		result = result.Plus(innerBase.lookAt.Times(-point.Get(2)));
		return result;
	}

	GetRotationMatrix(fromx: number, fromy: number, tox: number, toy: number) {
		let from = this.TrackBallProjection(fromx, fromy).Normalized();
		let to = this.TrackBallProjection(tox, toy).Normalized();

		let angle = Math.acos(from.Dot(to));
		let axis = to.Cross(from).Normalized();

		return Matrix.Rotation(axis, angle);
	}

	Rotate(fromx: number, fromy: number, tox: number, toy: number) {
		let rotation = this.GetRotationMatrix(fromx, fromy, tox, toy);

		let p = this.at.Minus(this.to);
		p = Homogeneous.ToVector(rotation.Multiply(new HomogeneousPoint(p)));
		this.at = this.to.Plus(p);
		this.up = Homogeneous.ToVector(rotation.Multiply(new HomogeneousVector(this.up)));
	}

	Zoom(d: number): void {
		this.Distance *= Math.pow(0.9, d);
	}

	GetPosition(): Vector {
		return this.at;
	}

	SetPosition(p: Vector) {
		this.at = p;
	}

	ComputeProjection(v: Vector, applyViewPort: boolean): Vector {
		let u: Matrix;
		u = new HomogeneousPoint(v);
		let projection = this.GetProjectionMatrix();
		let modelview = this.GetModelViewMatrix();
		let render = projection.Multiply(modelview);
		let w = new Vector(render.Multiply(u).values);
		w = w.Times(1. / w.Get(3));
		if (applyViewPort) {
			w.Set(0, (w.Get(0) + 1.0) * this.screen.width / 2.0);
			w.Set(1, (w.Get(1) + 1.0) * this.screen.height / 2.0);
		}
		return w
	}

	ComputeInvertedProjection(p: Vector): Vector {
		var u: Matrix;
		u = new HomogeneousPoint(p);
		//First : screen to normalized screen coordinates
		u.SetValue(0, 0, 2.0 * u.GetValue(0, 0) / this.screen.width - 1.0);
		u.SetValue(1, 0, 1.0 - 2.0 * u.GetValue(1, 0) / this.screen.height);
		//Then : normalized screen to world coordinates
		var projection = this.GetProjectionMatrix();
		var modelview = this.GetModelViewMatrix();
		var render = projection.Multiply(modelview);
		var v = render.LUSolve(u);
		return Homogeneous.ToVector(v);
	}

	CenterOnBox(box: BoundingBox): boolean {
		if (box && box.IsValid()) {
			let radius = box.GetSize().Norm() / 2.0;
			this.to = box.GetCenter();
			if (radius) {
				this.Distance = radius / Math.tan(this.fov / 2.);
			}
			return true;
		}
		return false;
	}

	GetDirection(): Vector {
		return this.to.Minus(this.at).Normalized();
	}

	SetDirection(dir: Vector, upv: Vector) {
		this.at = this.to.Minus(dir.Normalized().Times(this.Distance));
		this.up = upv;
	}

	get Distance(): number {
		return this.to.Minus(this.at).Norm();
	}

	set Distance(d: number) {
		this.at = this.to.Minus(this.GetDirection().Times(d));
	}

	UpdateDepthRange(scene: Scene) : Interval
	{
		let visibleItems = scene.GetNodes((pclNode : PCLNode) => {
			if(!pclNode.visible)
				return PCLNodeFilerResult.Reject;
			return pclNode instanceof PCLPrimitive ? PCLNodeFilerResult.Accept : PCLNodeFilerResult.IgnoreAndContinue;
		});
		let vertices = PCLGroup.GetBoundingBox(visibleItems).GetVertices();
		let dir = this.GetDirection();
		this.depthRange = new Interval;
		for(let index=0; index<vertices.length; index++)
		{
			let z = vertices[index].Minus(this.at).Dot(dir);
			this.depthRange.Add(z >= 0 ? z : 0);
		}
		if(!this.depthRange.IsValid())
		{
			this.depthRange.Add(0);
			this.depthRange.Add(1);
		};
		if(this.depthRange.max == this.depthRange.min)
			this.depthRange.max = this.depthRange.min + 1e-5;
		return this.depthRange;
	}
	
}