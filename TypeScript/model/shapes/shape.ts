abstract class Shape implements CADPrimitive{
    visible: boolean;
    name: string;

    abstract GetGeometry(): JSON;
    abstract SetGeometry(geometry : JSON): void;

    abstract ComputeMesh(sampling: number): Mesh;
    }

    Plane.prototype.Distance = function (point) {
        return Math.abs(point.Minus(this.center).Dot(this.normal));
    }

    Plane.prototype.GetBoundingBox = function () {
        var size = new Vector([
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(0)))),
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(1)))),
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(2))))
        ]);
        var bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    }

    Plane.prototype.GetWorldToInnerBaseMatrix = function () {
        var translation = IdentityMatrix(4);
        var basechange = IdentityMatrix(4);
        var xx = this.normal.GetOrthogonnal();
        var yy = this.normal.Cross(xx).Normalized();
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.normal.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    }

    Plane.prototype.RayIntersection = function (ray) {
    abstract RayIntersection(ray: Ray): number[];
}