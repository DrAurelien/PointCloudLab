class ScreenDimensions {
    constructor(public width: number, public height: number) {
    }
}

class Base {
    constructor(public right: Vector, public up: Vector, public lookAt: Vector, public distance: number) {
    }
}

class Camera {
    //Camera location
    at: Vector;
    //Camera aim point
    to: Vector;
    //Camera vertical direction
    up: Vector;
    //near clipping distince
    near: number;
    //far clipping dtstance
    far: number;
    //Field of view
    fov: number;
    //Screen dimensions
    screen: ScreenDimensions;

    constructor(context: DrawingContext) {
        this.at = new Vector([.0, .0, -10.0]);
        this.to = new Vector([.0, .0, .0]);
        this.up = new Vector([.0, 1.0, .0]);
        this.near = 0.001;
        this.far = 10000.0;
        this.fov = Math.PI / 4;

        this.InititalizeDrawingContext(context);
    }

    InititalizeDrawingContext(context: DrawingContext): void {
        //Screen size
        this.screen = new ScreenDimensions(context.renderingArea.width, context.renderingArea.height);

        //ModelView
        var modelview = this.GetModelViewMatrix();
        context.gl.uniformMatrix4fv(context.modelview, false, new Float32Array(modelview.values));
			
        //Projection
        var projection = this.GetProjectionMatrix();
        context.gl.uniformMatrix4fv(context.projection, false, new Float32Array(projection.values));
			
        //Lighting
        context.gl.uniform3fv(context.eyeposition, new Float32Array(this.at.Flatten()));
        context.gl.viewport(0, 0, this.screen.width, this.screen.height);
        context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT);
    }

    GetInnerBase(): Base {
        let lookAt : Vector = this.to.Minus(this.at);
        let d : number = lookAt.Norm();
        lookAt = lookAt.Times(1. / d);
        let right : Vector = lookAt.Cross(this.up).Normalized();
        let up : Vector = right.Cross(lookAt).Normalized();
        return { right: right, up: up, lookAt: lookAt, distance: d };
    }

    GetModelViewMatrix() : Matrix {
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
        let aspectRatio : number = this.screen.width / this.screen.height;
        var projection = Matrix.Null(4, 4);
        var f = 1. / Math.tan(this.fov / 2.);
        projection.SetValue(0, 0, f / aspectRatio);
        projection.SetValue(1, 1, f);
        projection.SetValue(2, 2, -(this.near + this.far) / (this.far - this.near));
        projection.SetValue(2, 3, -(2.0 * this.near * this.far) / (this.far - this.near));
        projection.SetValue(3, 2, -1.0);
        return projection;
    }

    Pan (dx : number, dy : number) {
        var f = Math.tan(this.fov / 2.0);
        var innerBase = this.GetInnerBase();
        var objectSpaceHeight = f * innerBase.distance;
        var objectSpaceWidth = objectSpaceHeight * this.screen.width / this.screen.height;

        var deltax = innerBase.right.Times(objectSpaceWidth * -dx / this.screen.width);
        var deltay = innerBase.up.Times(objectSpaceHeight * -dy / this.screen.height);
        var delta = deltax.Plus(deltay);

        this.at = this.at.Plus(delta);
        this.to = this.to.Plus(delta);
    }

    Rotate(dx: number, dy: number) {
        //DX rotation (around Y axis)
        var angle = 2 * Math.PI * -dx / this.screen.width;
        var innerBase = this.GetInnerBase();
        var rotation = Matrix.Rotation(innerBase.up, angle);
        var point = new Matrix(1, 4, this.at.Minus(this.to).Flatten().concat([1]));
        point = rotation.Multiply(point);
        for (var index = 0; index < 3; index++) {
            this.at.Set(index, point.values[index]);
        }
        this.at = this.to.Plus(this.at);
        this.up = innerBase.up;

			
        //DY rotation (around X axis)
        angle = Math.PI * dy / this.screen.height;
        innerBase = this.GetInnerBase();
        rotation = Matrix.Rotation(innerBase.right, angle);
        point = new Matrix(1, 4, this.at.Minus(this.to).Flatten().concat([1]));
        var updir = new Matrix(1, 4, innerBase.up.Flatten().concat([0]));
        point = rotation.Multiply(point);
        updir = rotation.Multiply(updir);
        for (var index = 0; index < 3; index++) {
            this.at.Set(index, point.values[index]);
            this.up.Set(index, updir.values[index]);
        }
        this.at = this.to.Plus(this.at);
    }

    Zoom(d: number): void {
        var innerBase = this.GetInnerBase();
        innerBase.distance *= Math.pow(0.9, d);

        this.at = this.to.Minus(innerBase.lookAt.Times(innerBase.distance));
    }

    ComputeProjection(v: Vector): Vector {
        let u: Matrix;
        if (v.Dimension() == 3)
            u = new Matrix(1, 4, v.Flatten().concat([1.0]));
        else
            u = new Matrix(1, 4, v.Flatten());
        var projection = this.GetProjectionMatrix();
        var modelview = this.GetModelViewMatrix();
        var render = projection.Multiply(modelview);
        var w = new Vector(render.Multiply(u).values);
        return w.Times(1. / w.Get(3));
        //Viewport
       // w.Set(0, (w.Get(0) + 1.0) * this.screen.width / 2.0);
        //w.Set(1, (w.Get(1) + 1.0) * this.screen.height / 2.0);
        //return w
    }

    ComputeInvertedProjection(p: Vector): Vector {
        var u: Matrix;
        if (p.Dimension() == 3)
            u = new Matrix(1, 4, p.Flatten().concat([1.0]));
        else
            u = new Matrix(1, 4, p.Flatten());
        //First : screen to normalized screen coordinates
        u.SetValue(0, 0, 2.0 * u.GetValue(0, 0) / this.screen.width - 1.0);
        u.SetValue(1, 0, 1.0 - 2.0 * u.GetValue(1, 0) / this.screen.height);
        //Then : normalized screen to world coordinates
        var projection = this.GetProjectionMatrix();
        var modelview = this.GetModelViewMatrix();
        var render = projection.Multiply(modelview);
        var v = render.LUSolve(u);
        var w = new Vector([0, 0, 0]);
        for (var index = 0; index < 3; index++) {
            w.Set(index, v.GetValue(index, 0) / v.GetValue(3, 0));
        }
        return w;
    }

	CenterOnBox(box: BoundingBox): boolean {
		if (box && box.IsValid()) {
			let radius = box.GetSize().Norm() / 2.0;
			this.to = box.GetCenter();
			if (radius) {
				let direction = this.to.Minus(this.at).Normalized();
				let dist = radius / Math.tan(this.fov / 2.);
				this.at = this.to.Minus(direction.Times(dist));
			}
			return true;
		}
		return false;
	}
}