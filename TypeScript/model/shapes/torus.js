var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Torus = (function (_super) {
    __extends(Torus, _super);
    function Torus(center, axis, greatradius, smallradius) {
        _super.call(this);
        this.center = center;
        this.axis = axis;
        this.greatradius = greatradius;
        this.smallradius = smallradius;
    }
    return Torus;
}(Shape));
//# sourceMappingURL=torus.js.map