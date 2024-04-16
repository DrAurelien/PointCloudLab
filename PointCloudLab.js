class MouseTracker {
    constructor(event) {
        this.x = event.clientX;
        this.y = event.clientY;
        this.button = event.which;
        this.date = new Date();
        this.ctrlKey = event.ctrlKey;
    }
    IsQuickEvent() {
        var now = new Date();
        return (now.getTime() - this.date.getTime() < MouseTracker.quickeventdelay);
    }
    UpdatePosition(event) {
        let delta = new MouseDisplacement(event.clientX - this.x, event.clientY - this.y, this.button);
        this.x = event.clientX;
        this.y = event.clientY;
        return delta;
    }
}
MouseTracker.quickeventdelay = 200;
class MouseDisplacement {
    constructor(dx, dy, button) {
        this.dx = dx;
        this.dy = dy;
        this.button = button;
    }
    IsNull() {
        return (this.dx == 0 && this.dy == 0);
    }
}
var SphericalRepresentation;
(function (SphericalRepresentation) {
    SphericalRepresentation[SphericalRepresentation["AzimuthColatitude"] = 0] = "AzimuthColatitude";
    SphericalRepresentation[SphericalRepresentation["AzimuthLatitude"] = 1] = "AzimuthLatitude"; //Theta range from -pi/2=-Z to pi/2=Z
})(SphericalRepresentation || (SphericalRepresentation = {}));
class Vector {
    constructor(coords) {
        this.Log = function () {
            let message = '| ';
            for (let index = 0; index < this.coordinates.length; index++) {
                message += this.coordinates[index] + ((index + 1 < this.coordinates.length) ? '; ' : '');
            }
            message += ' |';
            console.log(message);
        };
        this.coordinates = new Array(coords.length);
        for (var index = 0; index < coords.length; index++) {
            this.coordinates[index] = coords[index];
        }
    }
    Flatten() {
        return this.coordinates;
    }
    Clone() {
        return new Vector(this.coordinates.slice());
    }
    Dimension() {
        return this.coordinates.length;
    }
    Get(index) {
        return this.coordinates[index];
    }
    isNaN() {
        for (var index = 0; index < this.coordinates.length; index++) {
            if (isNaN(this.coordinates[index])) {
                return true;
            }
        }
        return false;
    }
    Set(index, value) {
        this.coordinates[index] = value;
    }
    //Sum of two vectors
    Plus(v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot add vectors with different dimensions';
        }
        let result = new Array(this.coordinates.length);
        for (let index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] + v.coordinates[index];
        }
        return new Vector(result);
    }
    //Sum in place
    Add(v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot add vectors with different dimensions';
        }
        for (let index = 0; index < this.coordinates.length; index++) {
            this.coordinates[index] += v.coordinates[index];
        }
    }
    //Product of two vectors
    Multiply(v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot multiply vectors with different dimensions';
        }
        let result = new Array(this.coordinates.length);
        for (let index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] * v.coordinates[index];
        }
        return new Vector(result);
    }
    //Difference between two vectors
    Minus(v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot compute difference between vectors with different dimensions';
        }
        let result = new Array(this.coordinates.length);
        for (let index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] - v.coordinates[index];
        }
        return new Vector(result);
    }
    //Multiply a vector by a scalar
    Times(s) {
        let result = new Array(this.coordinates.length);
        for (let index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] * s;
        }
        return new Vector(result);
    }
    //Dot product
    Dot(v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot compute difference between vectors with different dimensions';
        }
        let result = 0;
        for (let index = 0; index < this.coordinates.length; index++) {
            result += this.coordinates[index] * v.coordinates[index];
        }
        return result;
    }
    //Cross product (only for 3D vectors)
    Cross(v) {
        if (this.coordinates.length != 3) {
            throw 'Cross product only hold for 3D vectors';
        }
        return new Vector([
            this.coordinates[1] * v.coordinates[2] - this.coordinates[2] * v.coordinates[1],
            this.coordinates[2] * v.coordinates[0] - this.coordinates[0] * v.coordinates[2],
            this.coordinates[0] * v.coordinates[1] - this.coordinates[1] * v.coordinates[0]
        ]);
    }
    //Returns a vector orthogonnal to this one
    GetOrthogonnal() {
        let mindir = 0;
        let coords = [];
        for (let index = 0; index < this.coordinates.length; index++) {
            if (Math.abs(this.coordinates[index]) < Math.abs(this.coordinates[mindir])) {
                mindir = index;
            }
            coords.push(0.0);
        }
        let tmp = new Vector(coords);
        tmp.Set(mindir, 1.0);
        return this.Cross(tmp).Normalized();
    }
    //Comptute squared norm
    SqrNorm() {
        return this.Dot(this);
    }
    //Compute norm
    Norm() {
        return Math.sqrt(this.SqrNorm());
    }
    //Normalize current vector
    Normalized() {
        return this.Times(1 / this.Norm());
    }
    Normalize() {
        let norm = this.Norm();
        for (let index = 0; index < this.coordinates.length; index++) {
            this.coordinates[index] /= norm;
        }
    }
    static Null(d) {
        let v = new Array(d);
        for (let index = 0; index < d; index++) {
            v[index] = 0;
        }
        return new Vector(v);
    }
    static Spherical(phi, theta, radius) {
        return new Vector([phi, theta, radius]);
    }
    // Transforms spherical coordinates to cartesian coordinates [phi, theta, length]
    // phi is the azimut (angle to X)
    // theta is the latitude/colatitude (angle to Z - depending on the specified representation)
    // length is the vector length
    static SphericalToCartesian(spherical, representation = SphericalRepresentation.AzimuthColatitude) {
        let phi = spherical.Get(0);
        let theta = spherical.Get(1);
        let radius = spherical.Get(2);
        switch (representation) {
            case SphericalRepresentation.AzimuthColatitude:
                return new Vector([
                    Math.cos(phi) * Math.sin(theta),
                    Math.sin(phi) * Math.sin(theta),
                    Math.cos(theta)
                ]).Times(radius);
            case SphericalRepresentation.AzimuthLatitude:
                return new Vector([
                    Math.cos(phi) * Math.cos(theta),
                    Math.sin(phi) * Math.cos(theta),
                    -Math.sin(theta)
                ]).Times(radius);
            default:
                throw "Erroneous spherical representation";
        }
    }
    static CartesianToSpherical(cartesian, representation = SphericalRepresentation.AzimuthColatitude) {
        let norm = cartesian.Norm();
        let theta = 0.;
        let phi = 0.;
        if (norm > 1e-6) {
            switch (representation) {
                case SphericalRepresentation.AzimuthColatitude:
                    theta = Math.acos(cartesian.Get(2) / norm);
                    if (theta > 1e-8)
                        phi = Math.asin((cartesian.Get(1) / norm) / Math.sin(theta));
                    break;
                case SphericalRepresentation.AzimuthLatitude:
                    theta = Math.acos(cartesian.Get(2) / norm);
                    if (theta > 1e-8)
                        phi = Math.asin((cartesian.Get(1) / norm) / Math.sin(theta));
                    break;
                default:
                    throw "Erroneous spherical representation";
            }
        }
        return Vector.Spherical(phi, theta, norm);
    }
}
class PointSet {
    constructor() { }
    GetData(index) {
        return this.GetPoint(index);
    }
}
/// <reference path="matrix.ts" />
class LUDecomposition {
    constructor(matrix) {
        if (matrix.width != matrix.height) {
            throw 'Cannot compute LU decomposition for non square matrix';
        }
        this.matrix = Matrix.Null(matrix.width, matrix.height);
        let factor = 1.0;
        this.swaps = new Array(matrix.width);
        for (let ii = 0; ii < matrix.height; ii++) {
            for (let jj = 0; jj < matrix.width; jj++) {
                this.matrix.SetValue(ii, jj, matrix.GetValue(ii, jj));
            }
        }
        //Search for the greatest element of each line
        var scale = new Array(this.matrix.width);
        for (let ii = 0; ii < this.matrix.height; ii++) {
            var maxval = 0;
            for (let jj = 0; jj < this.matrix.width; jj++) {
                let val = Math.abs(this.matrix.GetValue(ii, jj));
                if (val > maxval) {
                    maxval = val;
                }
            }
            if (maxval < 0.000001) {
                throw 'Cannot perform LU decomposition of a singular matrix';
            }
            scale[ii] = 1.0 / maxval;
        }
        //Main loop
        for (let kk = 0; kk < this.matrix.width; kk++) {
            //Search for the largest pivot
            let maxval = 0.0;
            let maxindex = kk;
            for (let ii = kk; ii < this.matrix.height; ii++) {
                let val = scale[ii] * Math.abs(this.matrix.GetValue(ii, kk));
                if (val > maxval) {
                    maxindex = ii;
                    maxval = val;
                }
            }
            //Swap row so that current row has the best pivot
            if (kk != maxindex) {
                for (let jj = 0; jj < matrix.width; jj++) {
                    let tmp = this.matrix.GetValue(maxindex, jj);
                    this.matrix.SetValue(maxindex, jj, this.matrix.GetValue(kk, jj));
                    this.matrix.SetValue(kk, jj, tmp);
                }
                let tmp = scale[maxindex];
                scale[maxindex] = scale[kk];
                scale[kk] = tmp;
                //Swap changes parity of the scale factore
                factor = -factor;
            }
            this.swaps[kk] = maxindex;
            for (let ii = kk + 1; ii < matrix.height; ii++) {
                let val = this.matrix.GetValue(ii, kk) / this.matrix.GetValue(kk, kk);
                this.matrix.SetValue(ii, kk, val);
                for (let jj = kk + 1; jj < matrix.width; jj++) {
                    this.matrix.SetValue(ii, jj, this.matrix.GetValue(ii, jj) - val * this.matrix.GetValue(kk, jj));
                }
            }
        }
    }
    GetValue(row, col) {
        return this.matrix.GetValue(row, col);
    }
    GetL() {
        let result = Matrix.Null(this.matrix.width, this.matrix.height);
        for (let ii = 0; ii < this.matrix.height; ii++) {
            result.SetValue(ii, ii, 1.0);
            for (let jj = 0; jj < ii; jj++) {
                result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
            }
        }
        return result;
    }
    GetU() {
        let result = Matrix.Null(this.matrix.width, this.matrix.height);
        for (let ii = 0; ii < this.matrix.height; ii++) {
            for (let jj = ii; jj <= this.matrix.width; jj++) {
                result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
            }
        }
        return result;
    }
}
/// <reference path="../tools/dataprovider.ts" />
/// <reference path="vector.ts" />
/// <reference path="ludecomposition.ts" />
class Matrix {
    constructor(width, height, values) {
        this.width = width;
        this.height = height;
        this.values = values;
    }
    //Common matrix Builders
    static Null(width, height) {
        let values = new Float32Array(width * height);
        for (let index = 0; index < values.length; index++) {
            values[index] = 0.0;
        }
        return new Matrix(width, height, values);
    }
    static Identity(dimension) {
        let result = Matrix.Null(dimension, dimension);
        for (let index = 0; index < dimension; index++) {
            result.SetValue(index, index, 1.0);
        }
        return result;
    }
    static Translation(v) {
        let result = Matrix.Identity(4);
        for (let index = 0; index < 3; index++) {
            result.SetValue(index, 3, v.Get(index));
        }
        return result;
    }
    static Rotation(axis, angle) {
        let result = Matrix.Identity(4);
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        let x = axis.Get(0);
        let y = axis.Get(1);
        let z = axis.Get(2);
        result.SetValue(0, 0, x * x + (1 - (x * x)) * c);
        result.SetValue(0, 1, x * y * (1 - c) - z * s);
        result.SetValue(0, 2, x * z * (1 - c) + y * s);
        result.SetValue(1, 0, x * y * (1 - c) + z * s);
        result.SetValue(1, 1, y * y + (1 - (y * y)) * c);
        result.SetValue(1, 2, y * z * (1 - c) - x * s);
        result.SetValue(2, 0, x * z * (1 - c) - y * s);
        result.SetValue(2, 1, y * z * (1 - c) + x * s);
        result.SetValue(2, 2, z * z + (1 - (z * z)) * c);
        return result;
    }
    FlatIndex(row, col) {
        //Column-Major flat storage
        return row + col * this.width;
    }
    SetValue(row, col, value) {
        this.values[this.FlatIndex(row, col)] = value;
    }
    AddValue(row, col, value) {
        this.values[this.FlatIndex(row, col)] += value;
    }
    GetValue(row, col) {
        return this.values[this.FlatIndex(row, col)];
    }
    Clone() {
        return new Matrix(this.width, this.height, this.values.slice());
    }
    Times(s) {
        let result = new Float32Array(this.width * this.height);
        for (let index = 0; index < this.values.length; index++) {
            result[index] = this.values[index] * s;
        }
        return new Matrix(this.width, this.height, result);
    }
    Multiply(m) {
        if (this.width != m.height) {
            throw 'Cannot multiply matrices whose dimension do not match';
        }
        let result = Matrix.Null(m.width, this.height);
        for (let ii = 0; ii < this.height; ii++) {
            for (let jj = 0; jj < m.width; jj++) {
                let value = 0;
                for (let kk = 0; kk < this.width; kk++) {
                    value += this.GetValue(ii, kk) * m.GetValue(kk, jj);
                }
                result.SetValue(ii, jj, value);
            }
        }
        return result;
    }
    Plus(m) {
        if (this.width != m.width || this.height != this.height) {
            throw 'Cannot add matrices whose dimension do not match';
        }
        let result = this.Clone();
        for (let index = 0; index < result.values.length; index++) {
            result.values[index] += m.values[index];
        }
        return result;
    }
    Transposed() {
        let transposed = Matrix.Null(this.height, this.width);
        for (let ii = 0; ii < this.height; ii++) {
            for (let jj = 0; jj < this.width; jj++) {
                transposed.SetValue(jj, ii, this.GetValue(ii, jj));
            }
        }
        return transposed;
    }
    GetColumnVector(col, startrow = 0) {
        let values = new Array(this.height - startrow);
        for (let index = startrow; index < this.height; index++) {
            values[index - startrow] = this.GetValue(index, col);
        }
        return new Vector(values);
    }
    SetColumnVector(col, v) {
        for (let index = 0; index < this.height; index++) {
            this.SetValue(index, col, v.Get(index));
        }
    }
    GetRowVector(row, startcol = 0) {
        let values = new Array(this.width - startcol);
        for (let index = startcol; index < this.width; index++) {
            values[index - startcol] = this.GetValue(row, index);
        }
        return new Vector(values);
    }
    SetRowVector(row, v) {
        for (let index = 0; index < this.height; index++) {
            this.SetValue(row, index, v.Get(index));
        }
    }
    IsDiagonnal(error = 1.0e-10) {
        for (let ii = 0; ii < this.height; ii++) {
            for (let jj = 0; jj < this.width; jj++) {
                if (ii != jj && Math.abs(this.GetValue(ii, jj)) > error) {
                    return false;
                }
            }
        }
        return true;
    }
    //Solve THIS * X = rightHand (rightHand being a matrix)
    LUSolve(rightHand) {
        if (rightHand.width != 1 || rightHand.height != this.width) {
            throw 'Cannot solve equations system, due to inconsistent dimensions';
        }
        let solution = Matrix.Null(rightHand.width, rightHand.height);
        for (let ii = 0; ii < rightHand.height; ii++) {
            solution.SetValue(ii, 0, rightHand.GetValue(ii, 0));
        }
        let LU = new LUDecomposition(this);
        //Solve L * Y = rightHand
        let kk = 0;
        for (let ii = 0; ii < rightHand.height; ii++) {
            let sum = solution.GetValue(LU.swaps[ii], 0);
            solution.SetValue(LU.swaps[ii], 0, solution.GetValue(ii, 0));
            if (kk != 0) {
                for (let jj = kk - 1; jj < ii; jj++) {
                    sum -= LU.matrix.GetValue(ii, jj) * solution.GetValue(jj, 0);
                }
            }
            else if (sum != 0) {
                kk = ii + 1;
            }
            solution.SetValue(ii, 0, sum);
        }
        //Solve U * X = Y
        for (let ii = rightHand.height - 1; ii >= 0; ii--) {
            let sum = solution.GetValue(ii, 0);
            for (let jj = ii + 1; jj < rightHand.height; jj++) {
                sum -= LU.matrix.GetValue(ii, jj) * solution.GetValue(jj, 0);
            }
            solution.SetValue(ii, 0, sum / LU.matrix.GetValue(ii, ii));
        }
        return solution;
    }
    Log() {
        console.log('Matrix ' + this.height + ' x ' + this.width + ' : ');
        for (let ii = 0; ii < this.height; ii++) {
            let line = '| ';
            for (let jj = 0; jj < this.width; jj++) {
                line += this.GetValue(ii, jj) + ((jj + 1 < this.width) ? '; ' : '');
            }
            line += ' |';
            console.log(line);
        }
    }
}
//Extends N-D vector space with a (N+1)th "homegeneous" coordinate, for matrix multiplications
class Homogeneous extends Matrix {
    constructor(v, uniformcoord) {
        super(1, v.Dimension() + 1, new Float32Array(v.Flatten().concat(uniformcoord)));
    }
    static ToVector(m) {
        if (m.width != 1) {
            throw 'Matrix (' + m.width + 'x' + m.height + ') cannot be interpreted as a unifrom vector';
        }
        let s = m.height - 1;
        let c = new Array(s);
        let f = m.GetValue(s, 0) || 1;
        for (let index = 0; index < s; index++) {
            c[index] = m.GetValue(index, 0) / f;
        }
        return new Vector(c);
    }
}
class HomogeneousVector extends Homogeneous {
    constructor(v) {
        super(v, 0.0);
    }
}
class HomogeneousPoint extends Homogeneous {
    constructor(v) {
        super(v, 1.0);
    }
}
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/matrix.ts" />
var ViewPointChange;
(function (ViewPointChange) {
    ViewPointChange[ViewPointChange["Position"] = 0] = "Position";
    ViewPointChange[ViewPointChange["Rotation"] = 1] = "Rotation";
    ViewPointChange[ViewPointChange["Panning"] = 2] = "Panning";
    ViewPointChange[ViewPointChange["Zoom"] = 3] = "Zoom";
})(ViewPointChange || (ViewPointChange = {}));
var RenderingMode;
(function (RenderingMode) {
    RenderingMode[RenderingMode["Point"] = 0] = "Point";
    RenderingMode[RenderingMode["Wire"] = 1] = "Wire";
    RenderingMode[RenderingMode["Surface"] = 2] = "Surface";
    RenderingMode[RenderingMode["EDL"] = 3] = "EDL";
})(RenderingMode || (RenderingMode = {}));
class Cursor {
    constructor(iconCode) {
        this.original = null;
        this.currentIcon = '';
        this.Icon = iconCode;
    }
    Apply(element) {
        if (this.original === null) {
            this.original = element.style.cursor;
        }
        element.style.cursor = this.currentURL;
    }
    Restore(element) {
        if (this.original !== null) {
            element.style.cursor = this.original || 'auto';
            this.original = null;
        }
    }
    set Icon(code) {
        if (this.currentIcon != code) {
            this.currentIcon = code;
            if (code) {
                let codes = code.split(Cursor.Separator);
                let canvas = document.createElement('canvas');
                canvas.width = Cursor.FontSize * codes.length;
                canvas.height = Cursor.FontSize;
                let context = canvas.getContext('2d');
                context.strokeStyle = '#ffffff';
                context.font = '' + Cursor.FontSize + 'px FontAwesome';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                for (var index = 0; index < codes.length; index++) {
                    context.strokeText(codes[index] || '', (Cursor.FontSize / 2) + (Cursor.FontSize * index), Cursor.FontSize / 2);
                }
                this.currentURL = 'url(' + canvas.toDataURL() + '), auto';
            }
            else {
                this.currentURL = 'auto';
            }
        }
    }
    static Combine(iconCodes) {
        return iconCodes.join(Cursor.Separator);
    }
}
Cursor.FontSize = 16;
Cursor.Separator = '|';
Cursor.Rotate = '\uf01e'; //fa-rotate-right
Cursor.Translate = '\uf047'; //fa-arrows
Cursor.Scale = '\uf002'; //fa-search
Cursor.Edit = '\uf040'; //fa-pencil
Cursor.Light = '\uf0eb'; //fa-lightbulb-o
/// <reference path="mousetracker.ts" />
/// <reference path="controler.ts" />
/// <reference path="cursor.ts" />
class MouseControler {
    constructor(target) {
        this.target = target;
        this.targetElement = target.GetRengeringArea();
        this.cursor = new Cursor();
        let self = this;
        this.targetElement.oncontextmenu = function (event) {
            event = event || window.event;
            event.preventDefault();
            return false;
        };
        this.targetElement.onmousedown = function (event) {
            event = (event || window.event);
            self.Start(event);
        };
        this.targetElement.onmouseup = function (event) {
            self.End();
        };
        this.targetElement.onmouseout = function (event) {
            self.End();
        };
        this.targetElement.onmousemove = function (event) {
            event = (event || window.event);
            if (self.mousetracker) {
                let delta = self.mousetracker.UpdatePosition(event);
                self.HandleMouseMove(delta);
                self.target.NotifyPendingControl();
            }
            return true;
        };
        this.targetElement.onwheel = function (event) {
            event = (event || window.event);
            self.HandleWheel(event.deltaY);
        };
        document.onkeypress = function (event) {
            event = (event || window.event);
            let key = event.key ? event.key.charCodeAt(0) : event.keyCode;
            self.HandleKey(key);
        };
    }
    Start(event) {
        this.mousetracker = new MouseTracker(event);
        this.target.NotifyControlStart();
        this.StartMouseEvent();
    }
    End() {
        if (this.mousetracker != null && this.mousetracker.IsQuickEvent()) {
            this.HandleClick(this.mousetracker);
        }
        this.mousetracker = null;
        this.target.NotifyControlEnd();
        this.cursor.Restore(this.targetElement);
        this.EndMouseEvent();
    }
    HandleKey(key) {
        let strkey = String.fromCharCode(key);
        switch (strkey) {
            case 'p':
                this.target.ToggleRendering(RenderingMode.Point);
                break;
            case 'w':
                this.target.ToggleRendering(RenderingMode.Wire);
                break;
            case 's':
                this.target.ToggleRendering(RenderingMode.Surface);
                break;
            case 'e':
                this.target.ToggleRendering(RenderingMode.EDL);
            default:
                this.target.HandleShortcut(strkey);
                break;
        }
        return true;
    }
    StartMouseEvent() {
    }
    EndMouseEvent() {
    }
    set Cursor(iconCode) {
        this.cursor.Icon = iconCode;
        this.cursor.Apply(this.targetElement);
    }
    GetSelectionColor() {
        return [1, 1, 0];
    }
}
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="cursor.ts" />
/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
class CameraControler extends MouseControler {
    constructor(target) {
        super(target);
    }
    HandleMouseMove(displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        let camera = this.target.GetViewPoint();
        switch (displacement.button) {
            case 1: //Left mouse
                let x = this.mousetracker.x - displacement.dx;
                let y = this.mousetracker.y - displacement.dy;
                camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
                this.target.NotifyViewPointChange(ViewPointChange.Rotation);
                this.Cursor = Cursor.Rotate;
                break;
            case 2: //Middle mouse
                camera.Zoom(-displacement.dy / 10);
                this.target.NotifyViewPointChange(ViewPointChange.Zoom);
                this.Cursor = Cursor.Scale;
                break;
            case 3: //Right mouse
                camera.Pan(displacement.dx, displacement.dy);
                this.target.NotifyViewPointChange(ViewPointChange.Panning);
                this.Cursor = Cursor.Translate;
                break;
            default:
                return true;
        }
        return true;
    }
    HandleClick(tracker) {
        switch (tracker.button) {
            case 1: //Left mouse
                this.target.PickItem(tracker.x, tracker.y, !tracker.ctrlKey);
                break;
            case 2: //Middle mouse
                this.target.FocusOnCurrentSelection();
                break;
            default:
                return true;
        }
        return true;
    }
    HandleWheel(delta) {
        let camera = this.target.GetViewPoint();
        camera.Zoom(-delta / 100);
        this.target.NotifyViewPointChange(ViewPointChange.Zoom);
        return true;
    }
}
/// <reference path="controler.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="cursor.ts" />
/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
class LightControler extends MouseControler {
    constructor(target) {
        super(target);
        this.light = this.target.GetLightPosition(true);
        target.GetViewPoint().SetPosition(this.light.GetPosition());
        target.NotifyViewPointChange(ViewPointChange.Position);
    }
    HandleMouseMove(displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        let camera = this.target.GetViewPoint();
        switch (displacement.button) {
            case 1: //Left mouse
                let x = this.mousetracker.x - displacement.dx;
                let y = this.mousetracker.y - displacement.dy;
                camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
                this.target.NotifyViewPointChange(ViewPointChange.Rotation);
                break;
            case 2: //Middle mouse
                camera.Zoom(-displacement.dy / 10);
                this.target.NotifyViewPointChange(ViewPointChange.Zoom);
                break;
            case 3: //Right mouse
                camera.Pan(displacement.dx, displacement.dy);
                this.target.NotifyViewPointChange(ViewPointChange.Panning);
                break;
            default:
                return true;
        }
        this.light.SetPositon(camera.GetPosition());
        this.Cursor = Cursor.Light;
        return true;
    }
    HandleClick(tracker) {
        return true;
    }
    HandleWheel(delta) {
        return true;
    }
}
/// <reference path="controler.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="cursor.ts" />
/**
 * The Transform Contorler handles mouse inputs in order to apply transformations the the currently selected element
 */
class TransformControler extends MouseControler {
    constructor(target) {
        super(target);
    }
    HandleMouseMove(displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        if (!this.currentItem) {
            return false;
        }
        let camera = this.target.GetViewPoint();
        switch (displacement.button) {
            case 1: //Left mouse
                let x = this.mousetracker.x - displacement.dx;
                let y = this.mousetracker.y - displacement.dy;
                let rotation = camera.GetRotationMatrix(this.mousetracker.x, this.mousetracker.y, x, y);
                this.currentItem.Rotate(rotation);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Rotate]);
                break;
            case 2: //Middle mouse
                let scale = 1.0 - (displacement.dy / camera.GetScreenHeight());
                this.currentItem.Scale(scale);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Scale]);
                break;
            case 3: //Right mouse
                let translation = camera.GetTranslationVector(-displacement.dx, -displacement.dy);
                this.currentItem.Translate(translation);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Translate]);
                break;
            default:
                return true;
        }
        this.target.NotifyTransform();
        return true;
    }
    StartMouseEvent() {
        this.currentItem = this.target.GetCurrentTransformable();
        if (this.currentItem) {
            this.currentItem.InititalizeTransform();
        }
    }
    EndMouseEvent() {
        if (this.currentItem) {
            this.currentItem.ApplyTransform();
            this.currentItem = null;
        }
    }
    HandleClick(tracker) {
        switch (tracker.button) {
            case 1: //Left mouse
                this.target.PickItem(tracker.x, tracker.y, !tracker.ctrlKey);
                break;
            case 2: //Middle mouse
                this.target.FocusOnCurrentSelection();
                break;
            default:
                return true;
        }
        return true;
    }
    HandleWheel(delta) {
        let item = this.target.GetCurrentTransformable();
        item.Scale(1.0 - (delta / 1000.0));
        this.target.NotifyTransform();
        return true;
    }
    GetSelectionColor() {
        return [1, 0, 0];
    }
}
class Action {
    constructor(label, hintMessage) {
        this.label = label;
        this.hintMessage = hintMessage;
        this.listeners = [];
    }
    Run() {
        this.Trigger();
        for (let index = 0; index < this.listeners.length; index++) {
            this.listeners[index].OnTrigger(this);
        }
    }
    static IsActionProvider(x) {
        return x && x.GetActions && x.GetActions instanceof Function;
    }
    GetShortCut() {
        return null;
    }
    GetLabel(withShortcut = true) {
        if (withShortcut) {
            let shortcut = this.GetShortCut();
            return (shortcut ? ('[' + shortcut + '] ') : '') + this.label;
        }
        return this.label;
    }
    AddListener(listener) {
        this.listeners.push(listener);
    }
}
class SimpleAction extends Action {
    constructor(label, callback = null, hintMessage) {
        super(label, hintMessage);
        this.callback = callback;
        this.hintMessage = hintMessage;
    }
    Enabled() {
        return this.callback !== null;
    }
    Trigger() {
        return this.callback();
    }
}
class ActivableAction extends Action {
    constructor(label, callback, isactive, hintMessage) {
        super(label, hintMessage);
        this.callback = callback;
        this.isactive = isactive;
        this.hintMessage = hintMessage;
    }
    Enabled() {
        return this.isactive();
    }
    Trigger() {
        return this.callback();
    }
}
/// <reference path="action.ts" />
/// <reference path="../controler.ts" />
class CenterCameraAction extends Action {
    constructor(target) {
        super('Center camera on selection', 'Change the camera viewing direction so that it points to the selected object(s)');
        this.target = target;
    }
    Trigger() {
        this.target.FocusOnCurrentSelection();
    }
    Enabled() {
        return this.target.CanFocus();
    }
}
/// <reference path="action.ts" />
/// <reference path="../cameracontroler.ts" />
/// <reference path="../transformcontroler.ts" />
/// <reference path="../lightcontroler.ts" />
class CameraModeAction extends Action {
    constructor(target) {
        super('Camera mode', 'The mouse can be used to control the position of the camera');
        this.target = target;
    }
    Trigger() {
        this.target.SetCurrentControler(new CameraControler(this.target));
    }
    Enabled() {
        return !(this.target.GetCurrentControler() instanceof CameraControler);
    }
    GetShortCut() {
        return 'C';
    }
}
class TransformModeAction extends Action {
    constructor(target) {
        super('Transformation mode', 'The mouse can be used to control the geometry of the selected item');
        this.target = target;
    }
    Trigger() {
        this.target.SetCurrentControler(new TransformControler(this.target));
    }
    Enabled() {
        if (!this.target.GetCurrentTransformable())
            return false;
        return !(this.target.GetCurrentControler() instanceof TransformControler);
    }
    GetShortCut() {
        return 'T';
    }
}
class LightModeAction extends Action {
    constructor(target) {
        super('Light mode', 'The mouse can be used to control the position of the selected light');
        this.target = target;
    }
    Trigger() {
        this.target.SetCurrentControler(new LightControler(this.target));
    }
    Enabled() {
        if (!this.target.GetLightPosition(false))
            return false;
        return !(this.target.GetCurrentControler() instanceof LightControler);
    }
    GetShortCut() {
        return 'L';
    }
}
/// <reference path="../maths/vector.ts" />
class Picking {
    constructor(object) {
        this.object = object;
        this.distance = null;
    }
    HasIntersection() {
        return this.distance !== null;
    }
    Add(distance) {
        if (this.distance === null || this.distance > distance) {
            this.distance = distance;
        }
    }
    Compare(picking) {
        if (this.HasIntersection() && picking.HasIntersection()) {
            if (this.distance < picking.distance) {
                return -1;
            }
            else if (this.distance > picking.distance) {
                return 1;
            }
            return 0;
        }
        else if (this.HasIntersection()) {
            return -1;
        }
        else if (picking.HasIntersection()) {
            return 1;
        }
        return 0;
    }
}
class Ray {
    constructor(from, dir, aperture) {
        this.from = from;
        this.dir = dir;
        this.aperture = aperture;
    }
    GetPoint(distance) {
        return this.from.Plus(this.dir.Times(distance));
    }
}
/// <reference path="../maths/vector.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../maths/vector.ts" />
class BoundingBox {
    constructor(min = null, max = null) {
        this.min = min;
        this.max = max;
    }
    Set(center, size) {
        let halfSize = size.Times(0.5);
        this.min = center.Minus(halfSize);
        this.max = center.Plus(halfSize);
    }
    GetCenter() {
        return this.min.Plus(this.max).Times(0.5);
    }
    GetSize() {
        return this.max.Minus(this.min);
    }
    Add(p) {
        if (this.min == null || this.max == null) {
            this.min = new Vector(p.Flatten());
            this.max = new Vector(p.Flatten());
        }
        else {
            for (var index = 0; index < p.Dimension(); index++) {
                this.min.Set(index, Math.min(this.min.Get(index), p.Get(index)));
                this.max.Set(index, Math.max(this.max.Get(index), p.Get(index)));
            }
        }
    }
    AddBoundingBox(bb) {
        if (bb && bb.IsValid()) {
            this.Add(bb.min);
            this.Add(bb.max);
        }
    }
    IsValid() {
        return (this.min != null && this.max != null);
    }
    Intersect(box) {
        let dim = this.min.Dimension();
        for (let index = 0; index < dim; index++) {
            if ((box.max.Get(index) < this.min.Get(index)) || (box.min.Get(index) > this.max.Get(index))) {
                return false;
            }
        }
        return true;
    }
    TestAxisSeparation(point, axis) {
        let dim = this.min.Dimension();
        let v = 0.0;
        for (let index = 0; index < dim; index++) {
            v += Math.abs(axis.Get(index) * (this.max.Get(index) - this.min.Get(index)));
        }
        let proj = this.GetCenter().Minus(point).Dot(axis);
        let minproj = proj - v;
        let maxproj = proj + v;
        return (minproj * maxproj) > 0;
    }
    RayIntersection(ray) {
        let result = new Picking(null);
        let dim = this.min.Dimension();
        let self = this;
        function Accept(dist, ignore) {
            let inside = true;
            let p = ray.GetPoint(dist);
            for (let index = 0; inside && index < dim; index++) {
                if (index != ignore) {
                    inside = (p.Get(index) >= self.min.Get(index)) && (p.Get(index) <= self.max.Get(index));
                }
            }
            if (inside) {
                result.Add(dist);
            }
        }
        for (let index = 0; index < dim; index++) {
            let dd = ray.dir.Get(index);
            if (Math.abs(dd) > 1.0e-12) {
                Accept((this.min.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
                Accept((this.max.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
            }
        }
        return result;
    }
    SqrDistance(p) {
        if (!this.IsValid()) {
            return null;
        }
        let delta = new Vector([0.0, 0.0, 0.0]);
        for (let index = 0; index < 3; index++) {
            if (p.Get(index) < this.min.Get(index)) {
                delta.Set(index, this.min.Get(index) - p.Get(index));
            }
            else if (p.Get(index) > this.max.Get(index)) {
                delta.Set(index, p.Get(index) - this.max.Get(index));
            }
        }
        return delta.SqrNorm();
    }
    GetVertices() {
        return [
            new Vector([this.min.Get(0), this.min.Get(1), this.min.Get(2)]),
            new Vector([this.min.Get(0), this.min.Get(1), this.max.Get(2)]),
            new Vector([this.min.Get(0), this.max.Get(1), this.min.Get(2)]),
            new Vector([this.min.Get(0), this.max.Get(1), this.max.Get(2)]),
            new Vector([this.max.Get(0), this.min.Get(1), this.min.Get(2)]),
            new Vector([this.max.Get(0), this.min.Get(1), this.max.Get(2)]),
            new Vector([this.max.Get(0), this.max.Get(1), this.min.Get(2)]),
            new Vector([this.max.Get(0), this.max.Get(1), this.max.Get(2)])
        ];
    }
}
class RenderingType {
    constructor() {
        this.value = 0;
        this.listeners = [];
        this.Surface(true);
    }
    Point(activate) {
        return this.Set(activate, 1);
    }
    Wire(activate) {
        return this.Set(activate, 2);
    }
    Surface(activate) {
        return this.Set(activate, 4);
    }
    EDL(activate) {
        return this.Set(activate, 8);
    }
    Register(listener) {
        this.listeners.push(listener);
    }
    Unregister(listener) {
        let index = this.listeners.indexOf(listener);
        if (index >= 0 && index <= this.listeners.length)
            this.listeners.splice(index, 1);
    }
    Set(activate, base) {
        let formerState = this.Get(base);
        if (activate === true) {
            this.value = this.value | base;
        }
        else if (activate === false) {
            this.value = this.value ^ base;
        }
        let currentState = this.Get(base);
        if (formerState !== currentState) {
            for (let index = 0; index < this.listeners.length; index++)
                this.listeners[index].OnRenderingTypeChange(this);
        }
        return currentState;
    }
    Get(base) {
        return ((this.value & base) != 0);
    }
}
class Shaders {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;
        this.shaders = new Map();
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, this.GetShader(vertexShader));
        this.gl.attachShader(this.program, this.GetShader(fragmentShader));
        this.gl.linkProgram(this.program);
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw 'Unable to initialize the shader program';
        }
        this.Use();
    }
    Use() {
        this.gl.useProgram(this.program);
    }
    Attribute(name) {
        return this.gl.getAttribLocation(this.program, name);
    }
    Uniform(name) {
        return this.gl.getUniformLocation(this.program, name);
    }
    GetShader(identifier) {
        let shaderScript;
        let shaderSource;
        let shader;
        shaderScript = document.getElementById(identifier);
        if (!shaderScript) {
            throw 'Cannot find shader script "' + identifier + '"';
        }
        shaderSource = shaderScript.innerHTML;
        let shaderType = null;
        if (shaderScript.type.toLowerCase() == "x-shader/x-fragment") {
            shaderType = this.gl.FRAGMENT_SHADER;
        }
        else if (shaderScript.type.toLowerCase() == "x-shader/x-vertex") {
            shaderType = this.gl.VERTEX_SHADER;
        }
        else {
            throw 'Unknown shadert type ' + shaderScript.type;
        }
        shader = this.gl.createShader(shaderType);
        this.shaders[shaderType] = shader;
        this.gl.shaderSource(shader, shaderSource);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw 'An error occurred while compiling the shader "' + identifier + '": ' + this.gl.getShaderInfoLog(shader) + '\nCource code :\n' + shaderSource;
        }
        return shader;
    }
}
/// <reference path="renderingtype.ts" />
/// <reference path="shaders.ts" />
class DrawingContext {
    constructor(renderingArea) {
        this.renderingArea = renderingArea;
        this.sampling = 30;
        this.rendering = new RenderingType();
        this.gl = (this.renderingArea.getContext("webgl2", { preserveDrawingBuffer: true }) ||
            this.renderingArea.getContext("experimental-webgl", { preserveDrawingBuffer: true }));
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.useuint = this.gl.getExtension('OES_element_index_uint') ||
            this.gl.getExtension('MOZ_OES_element_index_uint') ||
            this.gl.getExtension('WEBKIT_OES_element_index_uint');
        this.shaders = new Shaders(this.gl, "VertexShader", "FragmentShader");
        this.vertices = this.shaders.Attribute("VertexPosition");
        this.gl.enableVertexAttribArray(this.vertices);
        this.normals = this.shaders.Attribute("NormalVector");
        this.EnableNormals(true);
        this.scalarvalue = this.shaders.Attribute("ScalarValue");
        this.usescalars = this.shaders.Uniform("UseScalars");
        this.minscalarvalue = this.shaders.Uniform("MinScalarValue");
        this.maxscalarvalue = this.shaders.Uniform("MaxScalarValue");
        this.minscalarcolor = this.shaders.Uniform("MinScalarColor");
        this.maxscalarcolor = this.shaders.Uniform("MaxScalarColor");
        this.projection = this.shaders.Uniform("Projection");
        this.modelview = this.shaders.Uniform("ModelView");
        this.shapetransform = this.shaders.Uniform("ShapeTransform");
        this.color = this.shaders.Uniform("Color");
        this.eyeposition = this.shaders.Uniform("EyePosition");
        this.lightpositions = [];
        this.lightcolors = [];
        this.nblights = this.shaders.Uniform("NbLights");
        for (var index = 0; index < DrawingContext.NbMaxLights; index++) {
            this.lightpositions.push(this.shaders.Uniform("LightPositions[" + index + "]"));
            this.lightcolors.push(this.shaders.Uniform("LightColors[" + index + "]"));
        }
        this.diffuse = this.shaders.Uniform("DiffuseCoef");
        this.ambiant = this.shaders.Uniform("AmbiantCoef");
        this.specular = this.shaders.Uniform("SpecularCoef");
        this.glossy = this.shaders.Uniform("GlossyPow");
        this.usenormals = this.shaders.Uniform("UseNormals");
        this.bboxcolor = [1, 1, 1];
    }
    EnableNormals(b) {
        let isEnabled = this.gl.getVertexAttrib(this.normals, this.gl.VERTEX_ATTRIB_ARRAY_ENABLED);
        if (b) {
            this.gl.uniform1i(this.usenormals, 1);
            this.gl.enableVertexAttribArray(this.normals);
        }
        else {
            this.gl.uniform1i(this.usenormals, 0);
            this.gl.disableVertexAttribArray(this.normals);
        }
        return isEnabled;
    }
    EnableScalars(b) {
        if (b) {
            this.gl.uniform1i(this.usescalars, 1);
            this.gl.enableVertexAttribArray(this.scalarvalue);
        }
        else {
            this.gl.uniform1i(this.usescalars, 0);
            this.gl.disableVertexAttribArray(this.scalarvalue);
        }
    }
    GetIntType(forceshort = false) {
        if (this.useuint && !forceshort) {
            return this.gl.UNSIGNED_INT;
        }
        return this.gl.UNSIGNED_SHORT;
    }
    GetIntArray(content, forceshort = false) {
        if (this.useuint && !forceshort) {
            return new Uint32Array(content);
        }
        return new Uint16Array(content);
    }
    GetSize(type) {
        switch (type) {
            case this.gl.UNSIGNED_SHORT:
            case this.gl.SHORT:
                return 2;
            case this.gl.UNSIGNED_INT:
            case this.gl.INT:
            case this.gl.FLOAT:
                return 4;
            default:
                throw 'Cannot handle type ' + type;
        }
    }
    GetShader(identifier) {
        let shaderScript;
        let shaderSource;
        let shader;
        shaderScript = document.getElementById(identifier);
        if (!shaderScript) {
            throw 'Cannot find shader script "' + identifier + '"';
        }
        shaderSource = shaderScript.innerHTML;
        if (shaderScript.type.toLowerCase() == "x-shader/x-fragment") {
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        }
        else if (shaderScript.type.toLowerCase() == "x-shader/x-vertex") {
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        }
        else {
            throw 'Unknown shadert type ' + shaderScript.type;
        }
        this.gl.shaderSource(shader, shaderSource);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw 'An error occurred while compiling the shader "' + identifier + '": ' + this.gl.getShaderInfoLog(shader) + '\nCource code :\n' + shaderSource;
        }
        return shader;
    }
}
DrawingContext.NbMaxLights = 8;
/// <reference path="drawingcontext.ts" />
class GLBuffer {
    constructor(data, ctx, type) {
        this.ctx = ctx;
        this.type = type;
        this.glBuffer = ctx.gl.createBuffer();
        ctx.gl.bindBuffer(type, this.glBuffer);
        ctx.gl.bufferData(type, data, ctx.gl.STATIC_DRAW);
    }
    Bind() {
        this.ctx.gl.bindBuffer(this.type, this.glBuffer);
    }
    Clear() {
        this.ctx.gl.deleteBuffer(this.glBuffer);
    }
}
class FloatArrayBuffer extends GLBuffer {
    constructor(data, ctx, dataSize) {
        super(data, ctx, ctx.gl.ARRAY_BUFFER);
        this.dataSize = dataSize;
    }
    BindAttribute(attribute) {
        this.Bind();
        this.ctx.gl.vertexAttribPointer(attribute, this.dataSize, this.ctx.gl.FLOAT, false, 0, 0);
    }
}
class ElementArrayBuffer extends GLBuffer {
    constructor(data, ctx, short = false) {
        super(ctx.GetIntArray(data, short), ctx, ctx.gl.ELEMENT_ARRAY_BUFFER);
        this.inttype = ctx.GetIntType(short);
    }
}
/// <reference path="../control.ts" />
class Property {
    constructor(name, changeHandler) {
        this.name = name;
        this.changeHandler = changeHandler;
    }
    NotifyChange() {
        let value = this.GetValue();
        if (value !== null) {
            if (this.changeHandler) {
                this.changeHandler(value);
            }
            if (this.owner) {
                this.owner.NotifyChange(this);
            }
        }
    }
}
/// <reference path="property.ts" />
/// <reference path="properties.ts" />
class PropertyGroup extends Property {
    constructor(name, properties, handler = null) {
        super(name, handler);
        //Forward change notifications
        this.properties = properties || new Properties();
        this.properties.onChange = () => this.NotifyChange();
    }
    Add(property) {
        this.properties.Push(property);
    }
    Refresh() {
        this.properties.Refresh();
    }
    GetElement() {
        return this.properties.GetElement();
    }
    GetValue() {
        let result = {};
        let nbProperties = this.properties.GetSize();
        for (let index = 0; index < nbProperties; index++) {
            let property = this.properties.GetProperty(index);
            result[property.name] = property.GetValue();
        }
        return result;
    }
}
/// <reference path="../control.ts" />
/// <reference path="property.ts" />
/// <reference path="propertygroup.ts" />
//==========================================
// Provides a way to get a list of propeties as a displayable table
//==========================================
class Properties {
    constructor(properties = []) {
        this.properties = properties;
    }
    Push(property) {
        this.properties.push(property);
        property.owner = this;
        if (this.element) {
            this.AddPropertyElement(property);
        }
        this.NotifyChange(property);
    }
    Refresh() {
        for (let index = 0; index < this.properties.length; index++) {
            this.properties[index].Refresh();
        }
    }
    GetSize() {
        return this.properties.length;
    }
    GetProperty(index) {
        return this.properties[index];
    }
    GetPropertyByName(propertyName) {
        for (let index = 0; index < this.properties.length; index++) {
            let property = this.properties[index];
            if (property.name == propertyName) {
                return property;
            }
        }
        return null;
    }
    GetValue(propertyName) {
        let property = this.GetPropertyByName(propertyName);
        if (property) {
            return property.GetValue();
        }
        return null;
    }
    NotifyChange(property) {
        if (this.onChange) {
            this.onChange();
        }
    }
    GetElement() {
        this.element = document.createElement('table');
        this.element.className = 'Properties';
        for (let index = 0; index < this.properties.length; index++) {
            this.AddPropertyElement(this.properties[index]);
        }
        return this.element;
    }
    AddPropertyElement(property) {
        let row = document.createElement('tr');
        row.className = 'Property';
        this.element.appendChild(row);
        let leftCol = document.createElement('td');
        leftCol.className = 'PropertyName';
        let leftColContent = document.createTextNode(property.name);
        leftCol.appendChild(leftColContent);
        row.appendChild(leftCol);
        if (property instanceof PropertyGroup) {
            leftCol.colSpan = 2;
            let row = document.createElement('tr');
            row.className = 'Property';
            this.element.appendChild(row);
            let col = document.createElement('td');
            col.colSpan = 2;
            col.className = 'PropertyCompound';
            col.appendChild(property.GetElement());
            row.appendChild(col);
        }
        else {
            let rightCol = document.createElement('td');
            rightCol.className = 'PropertyValue';
            rightCol.appendChild(property.GetElement());
            row.appendChild(rightCol);
        }
    }
}
/// <reference path="property.ts" />
class PropertyWithValue extends Property {
    // value() might be called anytime, to refresh the control displayed value so that its refelect that actual value
    constructor(name, inputType, value, changeHandler) {
        super(name, changeHandler);
        this.value = value;
        let self = this;
        this.container = document.createElement('div');
        this.input = document.createElement('input');
        this.input.type = inputType;
        this.input.width = 20;
        this.input.className = 'PropertyValue';
        this.input.value = value().toString();
        this.input.onchange = (ev) => self.NotifyChange();
        this.container.appendChild(this.input);
        if (!changeHandler) {
            this.SetReadonly();
        }
    }
    Refresh() {
        this.input.value = this.value().toString();
    }
    GetElement() {
        return this.container;
    }
    SetReadonly(value = true) {
        this.input.readOnly = value;
        this.input.className = 'PropertyValue' + (value ? 'Readonly' : '');
    }
}
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
class StringProperty extends PropertyWithValue {
    constructor(name, value, handler) {
        super(name, 'text', value, handler);
    }
    GetValue() {
        return this.input.value;
    }
}
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
class BooleanProperty extends PropertyWithValue {
    constructor(name, value, handler) {
        super(name, 'checkbox', value, handler);
        this.input.checked = value();
    }
    Refresh() {
        this.input.checked = this.value();
    }
    GetValue() {
        return this.input.checked;
    }
}
var Endianness;
(function (Endianness) {
    Endianness[Endianness["BigEndian"] = 0] = "BigEndian";
    Endianness[Endianness["LittleEndian"] = 1] = "LittleEndian";
})(Endianness || (Endianness = {}));
class BinaryStream {
    constructor(buffer) {
        this.buffer = buffer;
        this.cursor = 0;
        this.stream = buffer ? new DataView(buffer) : null;
        var tmp = new ArrayBuffer(2);
        new DataView(tmp).setInt16(0, 256, true);
        this.endianness = (new Int16Array(tmp)[0] === 256 ? Endianness.LittleEndian : Endianness.BigEndian);
    }
    Reset() {
        this.cursor = 0;
    }
    Eof() {
        return (this.cursor >= this.stream.byteLength) || (this.stream[this.cursor] == 3);
    }
}
/// <reference path="binarystream.ts" />
class BinaryReader extends BinaryStream {
    constructor(buffer) {
        super(buffer);
    }
    CountAsciiOccurences(asciichar) {
        var count = 0;
        this.Reset();
        while (!this.Eof()) {
            if (this.GetNextAsciiStr(asciichar.length, false) == asciichar)
                count++;
            this.cursor++;
        }
        return count;
    }
    GetAsciiLine() {
        return this.GetAsciiUntil(['\r\n', '\n']);
    }
    GetAsciiWord(onSameLine) {
        var stops = [' '];
        if (onSameLine === false) {
            stops.push('\n');
            stops.push('\r\n');
        }
        return this.GetAsciiUntil(stops);
    }
    GetAsciiUntil(stops) {
        let result = '';
        while (!this.Eof() && this.Ignore(stops) == 0) {
            result += this.GetNextAsciiChar();
        }
        return result;
    }
    Ignore(words) {
        let count = 0;
        let match = null;
        do {
            match = this.GetNextMatchingAsciiStr(words, true);
            if (match)
                count++;
        } while (match);
        return count;
    }
    GetNextAsciiStr(length = 1, move = true) {
        let result = '';
        let cursor = this.cursor;
        for (let index = 0; result.length < length && !this.Eof(); index++) {
            result += this.GetNextAsciiChar(true);
        }
        if (!move)
            this.cursor = cursor;
        return result;
    }
    GetNextMatchingAsciiStr(words, move = true) {
        for (let index = 0; index < words.length; index++) {
            let word = words[index];
            let next = this.GetNextAsciiStr(word.length, false);
            if (next.toLowerCase() == word.toLowerCase()) {
                if (move)
                    this.cursor += next.length;
                return next;
            }
        }
        return null;
    }
    GetNextAsciiChar(move = true) {
        let result = String.fromCharCode(this.stream.getUint8(this.cursor));
        if (move)
            this.cursor++;
        return result;
    }
    GetNextString(length, move = true) {
        let cursor = this.cursor;
        let result = '';
        for (let index = 0; index < length && !this.Eof(); index++) {
            result += this.GetNextAsciiChar(true);
        }
        if (!move) {
            this.cursor = cursor;
        }
        return result;
    }
    GetNextUInt8(move = true) {
        let result = this.stream.getInt8(this.cursor);
        if (move)
            this.cursor++;
        return result;
    }
    GetNextInt32(move = true) {
        var result = this.stream.getInt32(this.cursor, this.endianness == Endianness.LittleEndian);
        if (move)
            this.cursor += 4;
        return result;
    }
    GetNextFloat32(move = true) {
        var result = this.stream.getFloat32(this.cursor, this.endianness == Endianness.LittleEndian);
        if (move)
            this.cursor += 4;
        return result;
    }
    GetNextUILenghedString(move = true) {
        let cursor = this.cursor;
        let length = this.GetNextUInt8(true);
        let result = this.GetNextString(length, true);
        if (!move) {
            this.cursor = cursor;
        }
        return result;
    }
}
/// <reference path="../maths/vector.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="binaryreader.ts" />
class PCLSerializer {
    constructor(buffersize) {
        this.writer = new BinaryWriter(buffersize);
        this.PushSection('HEADER');
        this.PushParameter(this.writer.endianness == Endianness.BigEndian ?
            PCLSerializer.BigEndian : PCLSerializer.LittleEndian);
        this.PushParameter('version', (s) => s.PushUInt8(1));
        this.PushSection('CONTENTS');
    }
    PushSection(name) {
        this.writer.PushString(PCLSerializer.SectionPrefix + name + '\n');
    }
    PushParameter(name, handler = null) {
        this.writer.PushString(PCLSerializer.ParameterPefix + name + '\n');
        if (handler) {
            handler(this.writer);
            if (this.writer.lastvalue !== '\n') {
                this.writer.PushString('\n');
            }
        }
    }
    Start(s) {
        this.writer.PushString(PCLSerializer.StartObjectPrefix + s.GetSerializationID() + '\n');
    }
    End(s) {
        this.writer.PushString(PCLSerializer.EndObjectPrefix + s.GetSerializationID() + '\n');
    }
    GetBuffer() {
        return this.writer.buffer;
    }
    GetBufferAsString() {
        let stream = this.writer.stream;
        let result = '';
        for (let index = 0; index < stream.byteLength; index++) {
            result += String.fromCharCode(stream.getUint8(index));
        }
        return result;
    }
    GetBufferSize() {
        return this.writer.cursor;
    }
}
PCLSerializer.SectionPrefix = '>>> ';
PCLSerializer.StartObjectPrefix = 'New ';
PCLSerializer.EndObjectPrefix = 'End ';
PCLSerializer.ParameterPefix = '- ';
PCLSerializer.HeaderSection = 'HEADER';
PCLSerializer.ContentsSection = 'CONTENTS';
PCLSerializer.VersionParam = 'version';
PCLSerializer.BigEndian = 'bigendian';
PCLSerializer.LittleEndian = 'littleendian';
var PCLTokenType;
(function (PCLTokenType) {
    PCLTokenType[PCLTokenType["SectionEntry"] = 0] = "SectionEntry";
    PCLTokenType[PCLTokenType["StartObject"] = 1] = "StartObject";
    PCLTokenType[PCLTokenType["EndObject"] = 2] = "EndObject";
    PCLTokenType[PCLTokenType["Parameter"] = 3] = "Parameter";
})(PCLTokenType || (PCLTokenType = {}));
class PCLToken {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}
class PCLParser {
    constructor(buffer, factory) {
        this.factory = factory;
        if (buffer instanceof ArrayBuffer) {
            this.reader = new BinaryReader(buffer);
        }
        else {
            let strbuffer = buffer;
            let arraybuffer = new ArrayBuffer(strbuffer.length);
            let stream = new DataView(arraybuffer);
            for (let index = 0; index < strbuffer.length; index++) {
                stream.setUint8(index, strbuffer.charCodeAt(index));
            }
            this.reader = new BinaryReader(arraybuffer);
        }
        this.line = '';
    }
    TryGetTokenValue(line, prefix) {
        if (line.substr(0, prefix.length) === prefix) {
            return line.substr(prefix.length);
        }
        return null;
    }
    GetStringValue() {
        return this.reader.GetAsciiUntil(['\n']);
    }
    static GetTokenMap() {
        if (!PCLParser.tokenmap) {
            PCLParser.tokenmap = {};
            PCLParser.tokenmap[PCLSerializer.SectionPrefix] = PCLTokenType.SectionEntry;
            PCLParser.tokenmap[PCLSerializer.StartObjectPrefix] = PCLTokenType.StartObject;
            PCLParser.tokenmap[PCLSerializer.EndObjectPrefix] = PCLTokenType.EndObject;
            PCLParser.tokenmap[PCLSerializer.ParameterPefix] = PCLTokenType.Parameter;
        }
        return PCLParser.tokenmap;
    }
    GetNextToken() {
        if (this.reader.Eof()) {
            this.Error('unexpected end of file');
        }
        this.reader.Ignore(['\n']);
        this.line = this.reader.GetAsciiUntil(['\n']);
        let tokenmap = PCLParser.GetTokenMap();
        let value;
        for (let tokenprfix in tokenmap) {
            if (value = this.TryGetTokenValue(this.line, tokenprfix)) {
                return new PCLToken(tokenmap[tokenprfix], value);
            }
        }
        this.Error('unable to parse token');
        return null;
    }
    Done() {
        this.reader.Ignore(['\n']);
        return this.reader.Eof();
    }
    ProcessHeader() {
        let token = this.GetNextToken();
        if (token.type !== PCLTokenType.SectionEntry || token.value !== PCLSerializer.HeaderSection) {
            this.Error('header section was extected');
        }
        while ((token = this.GetNextToken()) && (token.type === PCLTokenType.Parameter)) {
            switch (token.value) {
                case PCLSerializer.VersionParam:
                    this.version = this.reader.GetNextUInt8();
                    break;
                case PCLSerializer.BigEndian:
                    this.endianness = Endianness.BigEndian;
                    break;
                case PCLSerializer.LittleEndian:
                    this.endianness = Endianness.LittleEndian;
                    break;
                default:
                    this.Error('unexpected parameter "' + token.value + '" in header section');
            }
        }
        if (!(token.type === PCLTokenType.SectionEntry && token.value === PCLSerializer.ContentsSection)) {
            this.Error('contents section was expected');
        }
    }
    ;
    ProcessNextObject() {
        let token;
        token = this.GetNextToken();
        if (token.type !== PCLTokenType.StartObject) {
            this.Error('object declaration was expected');
        }
        let objecttype = token.value;
        let handler = this.factory.GetHandler(objecttype);
        if (!handler) {
            this.Error('unsupported object type "' + objecttype + '"');
        }
        while ((token = this.GetNextToken()) && (token.type === PCLTokenType.Parameter)) {
            if (!handler.ProcessParam(token.value, this)) {
                this.Error('unexpected parameter "' + token.value + '"');
            }
        }
        if (token.type !== PCLTokenType.EndObject || token.value !== objecttype) {
            this.Error('end of object "' + objecttype + '" was expected');
        }
        return handler.Finalize();
    }
    Error(message) {
        throw 'PCL Parsing error : ' + message + '\n"' + this.line + '"';
    }
}
PCLParser.tokenmap = null;
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/stringproperty.ts" />
/// <reference path="../controls/properties/booleanproperty.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../../files/pclserializer.ts" />
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["Selection"] = 1] = "Selection";
    ChangeType[ChangeType["Creation"] = 2] = "Creation";
    ChangeType[ChangeType["Properties"] = 4] = "Properties";
    ChangeType[ChangeType["Display"] = 8] = "Display";
    ChangeType[ChangeType["Folding"] = 16] = "Folding";
    ChangeType[ChangeType["Children"] = 32] = "Children";
    ChangeType[ChangeType["ColorScale"] = 64] = "ColorScale";
    ChangeType[ChangeType["TakeFocus"] = 128] = "TakeFocus";
    ChangeType[ChangeType["NewItem"] = 138] = "NewItem";
})(ChangeType || (ChangeType = {}));
var PCLInsertionMode;
(function (PCLInsertionMode) {
    PCLInsertionMode[PCLInsertionMode["Before"] = 0] = "Before";
    PCLInsertionMode[PCLInsertionMode["After"] = 1] = "After";
})(PCLInsertionMode || (PCLInsertionMode = {}));
class PCLNode {
    constructor(name) {
        this.name = name;
        this.visible = true;
        this.selected = false;
        this.deletable = true;
        this.owner = null;
        this.changeListeners = [];
        this.pendingChanges = null;
    }
    Draw(drawingContext) {
        if (this.visible) {
            this.DrawNode(drawingContext);
            if (this.selected) {
                BoundingBoxDrawing.Draw(this.GetBoundingBox(), drawingContext);
            }
        }
    }
    GetProperties() {
        let self = this;
        if (!this.properties) {
            this.properties = new Properties();
            this.properties.Push(new StringProperty('Name', () => self.name, (newName) => self.name = newName.replace(/\//g, ' ')));
            this.properties.Push(new BooleanProperty('Visible', () => self.visible, (newVilibility) => self.visible = newVilibility));
            this.FillProperties();
            this.properties.onChange = () => self.NotifyChange(self, ChangeType.Properties | ChangeType.Display);
        }
        return this.properties;
    }
    Select(b) {
        let change = (b !== this.selected);
        this.selected = b;
        if (change) {
            this.NotifyChange(this, ChangeType.Selection);
        }
    }
    ToggleSelection() {
        this.Select(!this.selected);
    }
    SetVisibility(b) {
        let notify = b !== this.visible;
        this.visible = b;
        if (notify) {
            this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
        }
    }
    ToggleVisibility() {
        this.SetVisibility(!this.visible);
    }
    GetActions(delegate) {
        let self = this;
        let result = [];
        if (this.deletable) {
            result.push(new SimpleAction('Remove', () => {
                if (confirm('Are you sure you want to delete "' + self.name + '" ?')) {
                    self.owner.Remove(self);
                }
            }));
        }
        if (this.visible) {
            result.push(new SimpleAction('Hide', () => { self.visible = false; self.NotifyChange(self, ChangeType.Display | ChangeType.Properties); }));
        }
        else {
            result.push(new SimpleAction('Show', () => { self.visible = true; self.NotifyChange(self, ChangeType.Display | ChangeType.Properties); }));
        }
        result.push(null);
        result.push(new SimpleAction('Save to file', () => self.SaveToFile()));
        return result;
    }
    SaveToFile() {
        //Dry run (to get the buffer size)
        let serializer = new PCLSerializer(null);
        this.Serialize(serializer);
        //Actual serialization
        serializer = new PCLSerializer(serializer.GetBufferSize());
        this.Serialize(serializer);
        FileExporter.ExportFile(this.name + '.pcld', serializer.GetBuffer(), 'model');
    }
    GetChildren() {
        return [];
    }
    Apply(proc) {
        return proc(this);
    }
    NotifyChange(source, type) {
        source.pendingChanges = source.pendingChanges ? (source.pendingChanges | type) : type;
        for (let index = 0; index < this.changeListeners.length; index++) {
            this.changeListeners[index].NotifyChange(source, type);
        }
    }
    AddChangeListener(listener) {
        if (this.changeListeners.indexOf(listener) < 0) {
            this.changeListeners.push(listener);
            if (this.pendingChanges != null) {
                listener.NotifyChange(this, this.pendingChanges);
            }
        }
    }
    ClearProperties() {
        if (this.properties) {
            delete this.properties;
        }
    }
    Serialize(serializer) {
        let self = this;
        serializer.Start(this);
        serializer.PushParameter('name', (s) => s.PushString(self.name));
        if (!this.deletable) {
            serializer.PushParameter('nodelete');
        }
        this.SerializeNode(serializer);
        serializer.End(this);
    }
    static IsPCLContainer(x) {
        return x &&
            x.Add && x.Add instanceof Function &&
            x.Remove && x.Remove instanceof Function &&
            x.NotifyChange && x.NotifyChange instanceof Function;
    }
}
class BoundingBoxDrawing {
    static Initialize(ctx) {
        if (!BoundingBoxDrawing.glIndexBuffer) {
            let points = new Float32Array([
                -0.5, -0.5, -0.5,
                -0.5, 0.5, -0.5,
                0.5, 0.5, -0.5,
                0.5, -0.5, -0.5,
                -0.5, -0.5, 0.5,
                -0.5, 0.5, 0.5,
                0.5, 0.5, 0.5,
                0.5, -0.5, 0.5
            ]);
            let indices = [
                0, 1, 2, 3,
                4, 5, 6, 7,
                0, 4,
                1, 5,
                2, 6,
                3, 7
            ];
            BoundingBoxDrawing.drawnElements = [
                new GLBufferElement(0, 4, ctx.gl.LINE_LOOP),
                new GLBufferElement(4, 4, ctx.gl.LINE_LOOP),
                new GLBufferElement(8, 2, ctx.gl.LINES),
                new GLBufferElement(10, 2, ctx.gl.LINES),
                new GLBufferElement(12, 2, ctx.gl.LINES),
                new GLBufferElement(14, 2, ctx.gl.LINES)
            ];
            BoundingBoxDrawing.glPointsBuffer = new FloatArrayBuffer(points, ctx, 3);
            BoundingBoxDrawing.glIndexBuffer = new ElementArrayBuffer(indices, ctx);
        }
    }
    static Draw(box, ctx) {
        if (box && box.IsValid()) {
            ctx.EnableNormals(false);
            BoundingBoxDrawing.Initialize(ctx);
            ctx.gl.uniform3fv(ctx.color, ctx.bboxcolor);
            let size = box.GetSize();
            let center = box.GetCenter();
            let shapetransform = Matrix.Identity(4);
            for (let index = 0; index < 3; index++) {
                shapetransform.SetValue(index, index, size.Get(index));
                shapetransform.SetValue(index, 3, center.Get(index));
            }
            ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, new Float32Array(shapetransform.values));
            BoundingBoxDrawing.glPointsBuffer.BindAttribute(ctx.vertices);
            BoundingBoxDrawing.glIndexBuffer.Bind();
            for (var index = 0; index < BoundingBoxDrawing.drawnElements.length; index++) {
                let element = BoundingBoxDrawing.drawnElements[index];
                let type = BoundingBoxDrawing.glIndexBuffer.inttype;
                ctx.gl.drawElements(element.type, element.count, type, ctx.GetSize(type) * element.from);
            }
        }
    }
}
class GLBufferElement {
    constructor(from, count, type) {
        this.from = from;
        this.count = count;
        this.type = type;
    }
}
class PCLNodeParsingHandler {
    constructor() { }
    ProcessParam(paramname, parser) {
        switch (paramname) {
            case 'name':
                this.name = parser.GetStringValue();
                return true;
            case 'nodelete':
                this.nodelete = true;
                return true;
        }
        return this.ProcessNodeParam(paramname, parser);
    }
    Finalize() {
        let node = this.FinalizeNode();
        if (node) {
            node.name = this.name;
            if (this.nodelete)
                node.deletable = false;
            return node;
        }
    }
}
class StringUtils {
    static LeftPad(str, paddingChar, decimals) {
        let result = str;
        while (result.length < decimals) {
            result = paddingChar + result;
        }
        return result;
    }
    static RGBiToStr(rgb) {
        let result = '#' +
            StringUtils.LeftPad((rgb[0]).toString(16), '0', 2) +
            StringUtils.LeftPad((rgb[1]).toString(16), '0', 2) +
            StringUtils.LeftPad((rgb[2]).toString(16), '0', 2);
        return result;
    }
    static RGBfToStr(rgb) {
        return StringUtils.RGBiToStr([
            Math.round(255 * rgb[0]),
            Math.round(255 * rgb[1]),
            Math.round(255 * rgb[2])
        ]);
    }
    static StrToRGBf(str) {
        let red = str.substr(1, 2);
        let green = str.substr(3, 2);
        let blue = str.substr(5, 2);
        let result = [
            parseInt(red, 16) / 255,
            parseInt(green, 16) / 255,
            parseInt(blue, 16) / 255
        ];
        return result;
    }
}
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
/// <reference path="../../../tools/stringutils.ts" />
class ColorProperty extends PropertyWithValue {
    constructor(name, colorvalue, handler) {
        super(name, 'color', () => StringUtils.RGBfToStr(colorvalue()), handler);
    }
    GetValue() {
        return StringUtils.StrToRGBf(this.input.value);
    }
}
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
class NumberInRangeProperty extends PropertyWithValue {
    constructor(name, value, min, max, step, handler) {
        super(name, 'range', value, handler);
        this.input.min = min.toString();
        this.input.max = max.toString();
        this.input.step = step.toString();
    }
    GetValue() {
        try {
            return parseFloat(this.input.value);
        }
        catch (ex) {
            return null;
        }
    }
}
/// <reference path="drawingcontext.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/colorproperty.ts" />
/// <reference path="../controls/properties/numberinrangeproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
class Material {
    constructor(baseColor, diffuse = 0.7, ambiant = 0.05, specular = 0.4, glossy = 10.0) {
        this.baseColor = baseColor;
        this.diffuse = diffuse;
        this.ambiant = ambiant;
        this.specular = specular;
        this.glossy = glossy;
    }
    InitializeLightingModel(drawingContext) {
        drawingContext.gl.uniform3fv(drawingContext.color, new Float32Array(this.baseColor));
        drawingContext.gl.uniform1f(drawingContext.diffuse, this.diffuse);
        drawingContext.gl.uniform1f(drawingContext.ambiant, this.ambiant);
        drawingContext.gl.uniform1f(drawingContext.specular, this.specular);
        drawingContext.gl.uniform1f(drawingContext.glossy, this.glossy);
    }
    GetProperties() {
        let self = this;
        let properties = new Properties;
        properties.Push(new ColorProperty('Color', () => self.baseColor, (value) => self.baseColor = value));
        properties.Push(new NumberInRangeProperty('Ambiant', () => self.ambiant * 100.0, 0, 100, 1, (value) => self.ambiant = value / 100.0));
        properties.Push(new NumberInRangeProperty('Diffuse', () => self.diffuse * 100.0, 0, 100, 1, (value) => self.diffuse = value / 100.0));
        properties.Push(new NumberInRangeProperty('Specular', () => self.specular * 100.0, 0, 100, 1, (value) => self.specular = value / 100.0));
        properties.Push(new NumberInRangeProperty('Glossy', () => self.glossy, 0, 100, 1, (value) => self.glossy = value));
        return properties;
    }
    GetSerializationID() {
        return Material.SerializationID;
    }
    Serialize(serializer) {
        //public baseColor: number[], public diffuse: number = 0.7, public ambiant: number = 0.05, public specular: number = 0.4, public glossy: number = 10.0
        let self = this;
        serializer.Start(this);
        serializer.PushParameter('color', (s) => {
            s.PushFloat32(self.baseColor[0]);
            s.PushFloat32(self.baseColor[1]);
            s.PushFloat32(self.baseColor[2]);
        });
        serializer.PushParameter('ambiant', (s) => s.PushFloat32(self.ambiant));
        serializer.PushParameter('diffuse', (s) => s.PushFloat32(self.diffuse));
        serializer.PushParameter('specular', (s) => s.PushFloat32(self.specular));
        serializer.PushParameter('glossy', (s) => s.PushFloat32(self.glossy));
        serializer.End(this);
    }
    GetParsingHandler() {
        return new MaterialParsingHandler();
    }
}
Material.SerializationID = 'MATERIAL';
class MaterialParsingHandler {
    constructor() {
    }
    ProcessParam(paramname, parser) {
        switch (paramname) {
            case 'color':
                this.color = [
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ];
                return true;
            case 'ambiant':
                this.ambiant = parser.reader.GetNextFloat32();
                return true;
            case 'diffuse':
                this.diffuse = parser.reader.GetNextFloat32();
                return true;
            case 'specular':
                this.specular = parser.reader.GetNextFloat32();
                return true;
            case 'glossy':
                this.glossy = parser.reader.GetNextFloat32();
                return true;
        }
        return false;
    }
    Finalize() {
        return new Material(this.color, this.diffuse, this.ambiant, this.specular, this.glossy);
    }
}
/// <reference path="../maths/matrix.ts" />
/// <reference path="../maths/vector.ts" />
class Transform {
    constructor(rotationCenter) {
        this.rotationCenter = rotationCenter;
        this.rotation = Matrix.Identity(4);
        this.translation = new Vector([0.0, 0.0, 0.0]);
        this.scalefactor = 1.0;
    }
    Rotate(rotation) {
        this.rotation = this.rotation.Multiply(rotation);
        delete this.matrix;
    }
    Scale(scale) {
        this.scalefactor *= scale;
        delete this.matrix;
    }
    Translate(translation) {
        this.translation = this.translation.Plus(translation);
        delete this.matrix;
    }
    GetMatrix() {
        if (!this.matrix) {
            let shift = this.rotationCenter ? Matrix.Translation(this.rotationCenter) : null;
            this.matrix = this.rotation.Clone();
            for (let row = 0; row < 3; row++) {
                this.matrix.SetValue(row, 3, this.translation.Get(row));
            }
            this.matrix.SetValue(3, 3, 1.0 / this.scalefactor);
            if (this.rotationCenter) {
                let shift = Matrix.Translation(this.rotationCenter.Times(-1));
                let unshift = Matrix.Translation(this.rotationCenter);
                this.matrix = unshift.Multiply(this.matrix.Multiply(shift));
            }
        }
        return this.matrix;
    }
    TransformPoint(p) {
        return Homogeneous.ToVector(this.GetMatrix().Multiply(new HomogeneousPoint(p)));
    }
    TransformVector(v) {
        return Homogeneous.ToVector(this.GetMatrix().Multiply(new HomogeneousVector(v)));
    }
    SetTranslation(t) {
        this.translation = t;
    }
    SetRotation(r) {
        if (r.width == 4 && r.height == 4) {
            this.rotation = r;
        }
        else if (r.width == 3 && r.height == 3) {
            this.rotation = Matrix.Identity(4);
            for (let ii = 0; ii < 3; ii++) {
                for (let jj = 0; jj < 3; jj++) {
                    this.rotation.SetValue(ii, jj, r.GetValue(ii, jj));
                }
            }
        }
        else {
            throw 'Invalid rotation matrix for rigid transform';
        }
    }
}
/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/materials.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../files/pclserializer.ts" />
class PCLPrimitive extends PCLNode {
    constructor(name) {
        super(name);
        this.name = name;
        this.material = new Material([0.0, 1.0, 0.0]);
        this.lighting = true;
        this.transform = null;
    }
    SetBaseColor(color) {
        this.material.baseColor = color;
    }
    FillProperties() {
        if (this.properties) {
            let self = this;
            this.properties.Push(new BooleanProperty('Lighting', () => self.lighting, (l) => { self.lighting = l; }));
            this.properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
        }
    }
    DrawNode(ctx) {
        this.material.InitializeLightingModel(ctx);
        if (this.transform) {
            ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, this.transform.GetMatrix().values);
        }
        else {
            ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, PCLPrimitive.defaultShapeTransform);
        }
        this.DrawPrimitive(ctx);
    }
    InititalizeTransform() {
        if (this.transform) {
            this.ApplyTransform();
        }
        this.transform = new Transform(this.GetBoundingBox().GetCenter());
    }
    Rotate(rotation) {
        this.transform.Rotate(rotation);
    }
    Scale(scale) {
        this.transform.Scale(scale);
    }
    Translate(translation) {
        this.transform.Translate(translation);
    }
    ApplyTransform() {
        if (this.transform) {
            this.TransformPrivitive(this.transform);
            this.transform = null;
            this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
        }
    }
    GetBoundingBox() {
        if (this.transform) {
            return null;
        }
        return this.GetPrimitiveBoundingBox();
    }
    GetTransform() {
        if (!this.transform) {
        }
        return this.transform;
    }
    GetDisplayIcon() {
        return 'fa-cube';
    }
    SerializeNode(serializer) {
        let self = this;
        this.ApplyTransform();
        serializer.PushParameter('material', () => self.material.Serialize(serializer));
        this.SerializePrimitive(serializer);
    }
}
PCLPrimitive.defaultShapeTransform = Matrix.Identity(4).values;
class PCLPrimitiveParsingHandler extends PCLNodeParsingHandler {
    constructor() {
        super();
    }
    ProcessNodeParam(paramname, parser) {
        switch (paramname) {
            case 'material':
                this.material = parser.ProcessNextObject();
                return true;
        }
        return this.ProcessPrimitiveParam(paramname, parser);
    }
    FinalizeNode() {
        let primitve = this.FinalizePrimitive();
        if (primitve) {
            primitve.material = this.material;
        }
        return primitve;
    }
}
var ProcessExecutionStatus;
(function (ProcessExecutionStatus) {
    ProcessExecutionStatus[ProcessExecutionStatus["notstarted"] = 0] = "notstarted";
    ProcessExecutionStatus[ProcessExecutionStatus["started"] = 1] = "started";
    ProcessExecutionStatus[ProcessExecutionStatus["terminated"] = 2] = "terminated";
})(ProcessExecutionStatus || (ProcessExecutionStatus = {}));
class Process {
    constructor() {
        this.status = ProcessExecutionStatus.notstarted;
    }
    Start(caller = null) {
        var self = this;
        this.status = ProcessExecutionStatus.started;
        this.Initialize(caller);
        this.Run(() => {
            self.Finalize();
            self.status = ProcessExecutionStatus.terminated;
            self.InvokeNext();
        });
    }
    SetNext(next) {
        if (this.next) {
            return this.next.SetNext(next);
        }
        else {
            this.next = next instanceof Process ? next : new SimpleProcess(next);
            if (this.status == ProcessExecutionStatus.terminated) {
                this.InvokeNext();
            }
            return this.next;
        }
    }
    InvokeNext() {
        if (this.next) {
            this.next.Start(this);
        }
    }
    Initialize(caller) { }
    Finalize() { }
}
//================================================
// Simple synchroneous function execution
//================================================
class SimpleProcess extends Process {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    Initialize(caller) {
        this.caller = caller;
    }
    Run(ondone) {
        this.callback(this.caller);
        ondone();
    }
}
class LongProcess extends Process {
    constructor(message, onstoped = null) {
        super();
        this.message = message;
        this.onstoped = onstoped;
    }
    ;
    get Done() {
        return this.Target <= this.Current;
    }
    Run(ondone) {
        this.stoped = false;
        let progress = null;
        if (this.message && LongProcess.progresFactory) {
            progress = LongProcess.progresFactory();
            progress.Initialize(this.message, this);
        }
        let self = this;
        function RunInternal() {
            while (!self.Done && !self.stoped) {
                self.Step();
                if (progress && progress.Update(self.Current, self.Target)) {
                    setTimeout(RunInternal, progress.RefreshDelay());
                    return false;
                }
            }
            if (progress) {
                progress.Finalize();
            }
            if (this.stoped) {
                if (this.onstoped) {
                    this.onstoped();
                }
            }
            else {
                if (ondone) {
                    ondone();
                }
            }
            return true;
        }
        if (progress) {
            setTimeout(RunInternal, progress.RefreshDelay());
        }
        else {
            RunInternal();
        }
    }
    Stopable() {
        return !!this.onstoped;
    }
    Stop() {
        this.stoped = true;
    }
}
LongProcess.progresFactory = null;
//================================================
// Long process, where the total number of steps is defined right from the start
//================================================
class IterativeLongProcess extends LongProcess {
    constructor(nbsteps, message, onstoped = null) {
        super(message, onstoped);
        this.nbsteps = nbsteps;
        this.currentstep = 0;
    }
    Step() {
        this.Iterate(this.currentstep);
        this.currentstep++;
    }
    get Current() {
        return this.currentstep;
    }
    get Target() {
        return this.nbsteps;
    }
}
/// <reference path="../maths/vector.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../tools/picking.ts" />
class MeshFace {
    constructor(indices, points) {
        this.indices = indices;
        this.points = points;
    }
    LineFaceIntersection(line) {
        //Compute line / face intersection
        //solve line.from + t * line.dir
        let dd = this.Normal.Dot(this.points[0]);
        let nn = line.dir.Dot(this.Normal);
        if (Math.abs(nn) < 1e-6) {
            return null;
        }
        let tt = (dd - line.from.Dot(this.Normal)) / nn;
        let point = line.from.Plus(line.dir.Times(tt));
        if (!this.Inside(point)) {
            return null;
        }
        return tt;
    }
    Inside(point) {
        for (let ii = 0; ii < 3; ii++) {
            let test = point.Minus(this.points[ii]).Cross(this.points[(ii + 1) % 3].Minus(this.points[ii]));
            if (test.Dot(this.Normal) > 0) {
                return false;
                ;
            }
        }
        return true;
    }
    get Normal() {
        if (!this.normal) {
            this.normal = this.points[1].Minus(this.points[0]).Cross(this.points[2].Minus(this.points[0])).Normalized();
        }
        return this.normal;
    }
    get BoundingBox() {
        if (!this.boundingbox) {
            this.boundingbox = new BoundingBox();
            for (let index = 0; index < this.points.length; index++) {
                this.boundingbox.Add(this.points[index]);
            }
        }
        return this.boundingbox;
    }
    IntersectBox(box) {
        //Separated axis theorem : search for a separation axis
        if (!this.BoundingBox.Intersect(box)) {
            return false;
        }
        //Todo : Normal cross edges ?
        return !box.TestAxisSeparation(this.points[0], this.Normal);
    }
    Distance(point) {
        if (this.Inside(point)) {
            return Math.abs(this.Normal.Dot(point.Minus(this.points[0])));
        }
        let dist = null;
        for (let ii = 0; ii < 3; ii++) {
            let dd = Geometry.DistanceToSegment(point, this.points[ii], this.points[(ii + 1) % 3]);
            if (dist == null || dd < dist) {
                dist = dd;
            }
        }
        return dist;
    }
}
/// <reference path="../maths/vector.ts" />
/// <reference path="mesh.ts" />
/// <reference path="meshface.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/picking.ts" />
class Octree {
    constructor(mesh, maxdepth = 10, facespercell = 30) {
        this.mesh = mesh;
        this.maxdepth = maxdepth;
        this.facespercell = facespercell;
        let size = mesh.Size();
        this.facescache = new Array(size);
        for (let index = 0; index < size; index++) {
            this.facescache[index] = mesh.GetFace(index);
        }
        this.root = new OctreeCell(this, null, mesh.GetBoundingBox());
        this.root.Split();
    }
    RayIntersection(ray, wrapper) {
        let result = new Picking(wrapper);
        if (this.root) {
            this.root.RayIntersection(ray, result);
        }
        return result;
    }
    Distance(p) {
        if (this.root) {
            return this.root.Distance(p);
        }
        return null;
    }
    GetFace(index) {
        return this.facescache[index];
    }
    get NbFaces() {
        return this.facescache.length;
    }
}
class OctreeCell {
    constructor(octree, parent, boundingbox) {
        this.octree = octree;
        this.parent = parent;
        this.boundingbox = boundingbox;
        let candidates;
        if (parent) {
            this.depth = parent.depth + 1;
            candidates = parent.faces;
        }
        else {
            this.depth = 0;
            let size = octree.NbFaces;
            candidates = new Array(size);
            for (let index = 0; index < size; index++) {
                candidates[index] = index;
            }
        }
        this.faces = new Array(candidates.length);
        let nbfaces = 0;
        for (var index = 0; index < candidates.length; index++) {
            let face = octree.GetFace(candidates[index]);
            if (face.IntersectBox(this.boundingbox)) {
                this.faces[nbfaces] = candidates[index];
                nbfaces++;
            }
        }
        this.faces.splice(nbfaces);
        this.sons = [];
    }
    Split() {
        if (this.depth >= this.octree.maxdepth || this.faces.length <= this.octree.facespercell) {
            return false;
        }
        let center = this.boundingbox.GetCenter();
        let min = this.boundingbox.min;
        let max = this.boundingbox.max;
        let boxes = [];
        boxes.push(new BoundingBox(new Vector([min.Get(0), min.Get(1), min.Get(2)]), new Vector([center.Get(0), center.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), min.Get(1), min.Get(2)]), new Vector([max.Get(0), center.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), center.Get(1), min.Get(2)]), new Vector([center.Get(0), max.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), min.Get(1), center.Get(2)]), new Vector([center.Get(0), center.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), center.Get(1), min.Get(2)]), new Vector([max.Get(0), max.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), center.Get(1), center.Get(2)]), new Vector([center.Get(0), max.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), min.Get(1), center.Get(2)]), new Vector([max.Get(0), center.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), center.Get(1), center.Get(2)]), new Vector([max.Get(0), max.Get(1), max.Get(2)])));
        for (let index = 0; index < boxes.length; index++) {
            let son = new OctreeCell(this.octree, this, boxes[index]);
            son.Split();
            this.sons.push(son);
        }
        return true;
    }
    RayIntersection(ray, result) {
        let boxintersection = this.boundingbox.RayIntersection(ray);
        if (boxintersection.HasIntersection() && boxintersection.Compare(result) < 0) {
            let nbsons = this.sons.length;
            if (nbsons > 0) {
                for (let index = 0; index < nbsons; index++) {
                    this.sons[index].RayIntersection(ray, result);
                }
            }
            else {
                for (var index = 0; index < this.faces.length; index++) {
                    let face = this.octree.GetFace(this.faces[index]);
                    let tt = face.LineFaceIntersection(ray);
                    if (tt != null) {
                        result.Add(tt);
                    }
                }
            }
        }
    }
    Distance(p) {
        let nbsons = this.sons.length;
        if (nbsons > 0) {
            let celldistances = [];
            for (let index = 0; index < nbsons; index++) {
                celldistances.push(new OctreeCellWithDistance(this.sons[index], p));
            }
            celldistances = celldistances.sort((a, b) => a.CompareWith(b));
            let dist = null;
            for (let index = 0; index < celldistances.length; index++) {
                let bd = celldistances[index].sqrDistToBox;
                if (dist !== null && (dist * dist) < bd) {
                    return dist;
                }
                let dd = celldistances[index].ActualDistance();
                if (dist == null || dd < dist) {
                    dist = dd;
                }
            }
            return dist;
        }
        else {
            let dist = null;
            for (let index = 0; index < this.faces.length; index++) {
                let face = this.octree.GetFace(this.faces[index]);
                let dd = face.Distance(p);
                if (dist == null || dd < dist) {
                    dist = dd;
                }
            }
            return dist;
        }
    }
}
class OctreeCellWithDistance {
    constructor(cell, p) {
        this.cell = cell;
        this.p = p;
        this.sqrDistToBox = cell.boundingbox.SqrDistance(p);
    }
    CompareWith(cell) {
        return this.sqrDistToBox - cell.sqrDistToBox;
    }
    ActualDistance() {
        return this.cell.Distance(this.p);
    }
}
/// <reference path="../maths/vector.ts" />
/// <reference path="pointcloud.ts" />
class Neighbourhood {
    Initialize(cloud, queryPoint) {
        this.cloud = cloud;
        this.queryPoint = queryPoint;
        this.neighbours = [];
    }
    GetPointData(pointIndex) {
        var sqrdist = this.queryPoint.Minus(this.cloud.GetPoint(pointIndex)).SqrNorm();
        return new Neighbour(sqrdist, pointIndex);
    }
    GetData(pointIndex) {
        return this.cloud.GetPoint(this.neighbours[pointIndex].index);
    }
    Size() {
        return this.neighbours.length;
    }
    Accept(distance) {
        var sqrdist = distance * distance;
        var maxdist = this.GetSqrDistance();
        if (maxdist === null || sqrdist <= maxdist) {
            return true;
        }
        return false;
    }
    Neighbours() {
        return this.neighbours;
    }
    AsSubCloud() {
        return new PointSubCloud(this.cloud, this.neighbours.map(neighbour => neighbour.index));
    }
}
//==================================
// Neighbor
//==================================
class Neighbour {
    constructor(sqrdistance, index) {
        this.sqrdistance = sqrdistance;
        this.index = index;
    }
}
//==================================
// K-Nearest Neighbours
//==================================
class KNearestNeighbours extends Neighbourhood {
    constructor(k) {
        super();
        this.k = k;
        k = k;
    }
    Push(index) {
        var data = this.GetPointData(index);
        var cursor = this.neighbours.length;
        if (this.neighbours.length < this.k) {
            this.neighbours.push(data);
        }
        //Locate the cursor to the data whose distance is smaller than the current data distance
        while (cursor > 0 && data.sqrdistance < this.neighbours[cursor - 1].sqrdistance) {
            if (cursor < this.k) {
                this.neighbours[cursor] = this.neighbours[cursor - 1];
            }
            cursor--;
        }
        //Add the data so that neighbors list remains sorted
        if (cursor < this.k) {
            this.neighbours[cursor] = data;
        }
        return false;
    }
    GetSqrDistance() {
        if (this.neighbours.length < this.k) {
            return null;
        }
        return this.neighbours[this.neighbours.length - 1].sqrdistance;
    }
}
/// <reference path="../maths/vector.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="neighbourhood.ts" />
/// <reference path="../tools/picking.ts" />
class KDTree {
    constructor(cloud) {
        this.cloud = cloud;
        this.root = null;
        var size = cloud.Size();
        if (size > 0) {
            this.indices = new Array(size);
            for (var index = 0; index < size; index++) {
                this.indices[index] = index;
            }
            this.root = this.Split(0, size, 0);
        }
        else {
            this.indices = [];
        }
    }
    GetIndices(start, nbItems, direction) {
        var array = new Array(nbItems);
        for (var index = 0; index < nbItems; index++) {
            var cloudIndex = this.indices[start + index];
            array[index] = {
                index: cloudIndex,
                coord: this.cloud.GetPointCoordinate(cloudIndex, direction)
            };
        }
        return array;
    }
    SetIndices(start, array) {
        for (var index = 0; index < array.length; index++) {
            this.indices[start + index] = array[index].index;
        }
    }
    Split(fromIndex, toIndex, direction) {
        var pointCloud = this.cloud;
        function compare(a, b) {
            return (a.coord < b.coord) ? -1 : ((a.coord > b.coord) ? 1 : 0);
        }
        if (fromIndex < toIndex) {
            var nbItems = toIndex - fromIndex;
            //Sort the indices in increasing coordinate order (given the current direction)
            var subIndices = this.GetIndices(fromIndex, nbItems, direction);
            subIndices = subIndices.sort(compare);
            this.SetIndices(fromIndex, subIndices);
            var cellData = new KDTreeCell(fromIndex, toIndex, direction);
            if (nbItems >= 30) {
                var cutIndex = Math.ceil(nbItems / 2);
                var nextDirection = (direction + 1) % 3;
                cellData.cutValue = (subIndices[cutIndex - 1].coord + subIndices[cutIndex].coord) / 2.0;
                cutIndex += fromIndex;
                var left = this.Split(fromIndex, cutIndex, nextDirection);
                var right = this.Split(cutIndex, toIndex, nextDirection);
                if (left && right) {
                    cellData.left = left;
                    cellData.right = right;
                    cellData.innerBox = new BoundingBox();
                    cellData.innerBox.AddBoundingBox(left.innerBox);
                    cellData.innerBox.AddBoundingBox(right.innerBox);
                }
            }
            else {
                cellData.innerBox = new BoundingBox();
                for (let index = 0; index < nbItems; index++)
                    cellData.innerBox.Add(this.cloud.GetPoint(subIndices[index].index));
            }
            return cellData;
        }
        return null;
    }
    FindNearestNeighbours(queryPoint, nbh, cell = null) {
        if (!cell) {
            cell = this.root;
            nbh.Initialize(this.cloud, queryPoint);
        }
        //Handle inner nodes
        if (cell.left && cell.right) {
            var distToThreshold = Math.abs(queryPoint.Get(cell.direction) - cell.cutValue);
            //Determine which cell should be explored first
            var first = cell.right;
            var second = cell.left;
            if (queryPoint.Get(cell.direction) < cell.cutValue) {
                first = cell.left;
                second = cell.right;
            }
            //Explore cells
            this.FindNearestNeighbours(queryPoint, nbh, first);
            if (nbh.Accept(distToThreshold)) {
                this.FindNearestNeighbours(queryPoint, nbh, second);
            }
        }
        //Handle leaves
        else {
            for (var index = cell.fromIndex; index < cell.toIndex; index++) {
                nbh.Push(this.indices[index]);
            }
        }
        return nbh.Neighbours();
    }
    ExtractSamples(nbSamples, cell = null) {
        if (nbSamples == 0)
            return [];
        if (!cell)
            cell = this.root;
        let nbItems = cell.toIndex - cell.fromIndex;
        if (nbSamples == 1) {
            let index = cell.fromIndex + Math.floor(Math.random() * nbItems);
            return [this.indices[index]];
        }
        else if (cell.left && cell.right) {
            let nbLeft = Math.floor(nbSamples / 2);
            let nbRight = nbSamples - nbLeft;
            let samples = this.ExtractSamples(nbLeft, cell.left);
            samples = samples.concat(this.ExtractSamples(nbRight, cell.right));
            return samples;
        }
        else {
            let candidates = new Array(nbItems);
            for (let index = cell.fromIndex; index < cell.toIndex; index++)
                candidates[index] = this.indices[cell.toIndex + index];
            let samples = [];
            while (samples.length < nbSamples && candidates.length > 0) {
                let index = Math.floor(Math.random() * candidates.length);
                samples.push(candidates[index]);
                candidates[index] = candidates[candidates.length - 1];
                candidates.splice(candidates.length - 1, 1);
            }
            return samples;
        }
    }
    GetSubCloud(cell) {
        let nbItems = cell.toIndex - cell.fromIndex;
        let cloudIndices = Array(nbItems);
        for (var index = 0; index < nbItems; index++) {
            cloudIndices[index] = this.indices[cell.fromIndex + index];
        }
        return new PointSubCloud(this.cloud, cloudIndices);
    }
    RayIntersection(ray, cell = null) {
        if (!cell)
            cell = this.root;
        let intersection = cell.innerBox ? cell.innerBox.RayIntersection(ray) : new Picking(cell);
        intersection.object = cell;
        if (intersection.HasIntersection() && cell.left && cell.right) {
            let rayPos = ray.from.Get(cell.direction);
            let dist = rayPos - cell.cutValue;
            let firstSon = dist < 0 ? cell.left : cell.right;
            let secondSon = dist < 0 ? cell.right : cell.left;
            let firstIntersection = this.RayIntersection(ray, firstSon);
            if (!firstIntersection.HasIntersection() || Math.abs(firstIntersection.distance) >= Math.abs(dist)) {
                let secondIntersection = this.RayIntersection(ray, secondSon);
                if (secondIntersection.Compare(firstIntersection) < 0)
                    intersection = secondIntersection;
                else
                    intersection = firstIntersection;
            }
            else
                intersection = firstIntersection;
        }
        return intersection;
    }
    Log(cellData) {
        if (!cellData) {
            cellData = this.root;
        }
        let xmlNode = '';
        if (cellData) {
            xmlNode = '<node from="' + cellData.fromIndex + '" to="' + cellData.toIndex + '" dir="' + cellData.direction + '"';
            if ('cutValue' in cellData) {
                xmlNode += ' cut="' + cellData.cutValue + '"';
            }
            xmlNode += '>';
            if (cellData.left) {
                xmlNode += this.Log(cellData.left);
            }
            if (cellData.right) {
                xmlNode += this.Log(cellData.right);
            }
            xmlNode += '</node>';
        }
        return xmlNode;
    }
}
class KDTreeCell {
    constructor(fromIndex, toIndex, direction) {
        this.fromIndex = fromIndex;
        this.toIndex = toIndex;
        this.direction = direction;
        this.right = null;
        this.left = null;
    }
}
class QueueCell {
    constructor(data) {
        this.data = data;
    }
}
class Queue {
    constructor() {
        this.head = null;
        this.tail = null;
    }
    Dequeue() {
        let result = this.head.data;
        this.head = this.head.next;
        if (!this.head)
            this.tail = null;
        return result;
    }
    Enqueue(data) {
        let cell = new QueueCell(data);
        if (this.tail)
            this.tail.next = cell;
        else
            this.head = cell;
        this.tail = cell;
    }
    Empty() {
        return !this.head;
    }
    Clear() {
        this.head = null;
        this.tail = null;
    }
}
/// <reference path="../tools/queue.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="neighbourhood.ts" />
var RegionGrowthStatus;
(function (RegionGrowthStatus) {
    RegionGrowthStatus[RegionGrowthStatus["unprocessed"] = 0] = "unprocessed";
    RegionGrowthStatus[RegionGrowthStatus["enqueued"] = 1] = "enqueued";
    RegionGrowthStatus[RegionGrowthStatus["processed"] = 2] = "processed";
})(RegionGrowthStatus || (RegionGrowthStatus = {}));
class RegionGrowthIterator {
    constructor(cloud, k) {
        this.cloud = cloud;
        this.k = k;
        this.status = new Array(this.Size());
        this.queue = new Queue();
    }
    Reset() {
        let size = this.Size();
        for (let index = 0; index < size; index++) {
            this.status[index] = RegionGrowthStatus.unprocessed;
        }
        this.lastUnprocessed = 0;
        this.currentIndex = null;
        this.currentRegion = null;
        this.currentNeighborhood = null;
        this.regionIndex = 0;
        this.Enqueue(this.lastUnprocessed);
    }
    Size() {
        return this.cloud.Size();
    }
    End() {
        return this.lastUnprocessed >= this.Size();
    }
    LoadAndSpread() {
        this.currentRegion = this.regionIndex;
        this.currentIndex = this.queue.Dequeue();
        this.status[this.currentIndex] = RegionGrowthStatus.processed;
        //Enqueue current point neighbourhood
        this.currentNeighborhood = this.cloud.KNearestNeighbours(this.cloud.GetPoint(this.currentIndex), this.k).Neighbours();
        for (let ii = 0; ii < this.currentNeighborhood.length; ii++) {
            let nbhindex = this.currentNeighborhood[ii].index;
            if (this.status[nbhindex] == RegionGrowthStatus.unprocessed)
                this.Enqueue(nbhindex);
        }
        //If the queue is empty, enqueue the next point that has not been processed yet
        if (this.queue.Empty()) {
            this.regionIndex++;
            while (!this.End() && this.status[this.lastUnprocessed] !== RegionGrowthStatus.unprocessed)
                this.lastUnprocessed++;
            if (!this.End())
                this.Enqueue(this.lastUnprocessed);
        }
    }
    Enqueue(index) {
        this.queue.Enqueue(index);
        this.status[index] = RegionGrowthStatus.enqueued;
    }
}
class RegionGrowthProcess extends IterativeLongProcess {
    constructor(cloud, k, message) {
        super(cloud.Size(), message);
        this.cloud = cloud;
        this.iterator = new RegionGrowthIterator(cloud, k);
    }
    Initialize() {
        this.iterator.Reset();
    }
    get Done() {
        return this.iterator.End();
    }
    Iterate() {
        this.iterator.LoadAndSpread();
        this.ProcessPoint(this.cloud, this.iterator.currentIndex, this.iterator.currentNeighborhood, this.iterator.currentRegion);
    }
    Status(index) {
        return this.iterator.status[index];
    }
}
/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
class QRDecomposition {
    constructor(matrix) {
        //Naive method :
        //https://en.wikipedia.org/wiki/QR_decomposition
        if (matrix.width != matrix.height) {
            throw 'Cannot compute QR decomposition for non square matrix';
        }
        this.Q = Matrix.Null(matrix.width, matrix.width);
        this.R = Matrix.Null(matrix.width, matrix.width);
        let vects = [];
        let normalized = [];
        for (let ii = 0; ii < matrix.width; ii++) {
            let vec = matrix.GetColumnVector(ii);
            let current = vec;
            if (ii > 0) {
                //Compute vec - sum[jj<ii](proj(vects[jj], vec))
                for (let jj = 0; jj < ii; jj++) {
                    var proj = vects[jj].Times(vects[jj].Dot(vec) / vects[jj].Dot(vects[jj]));
                    current = current.Minus(proj);
                }
            }
            vects.push(current);
            current = current.Normalized();
            normalized.push(current);
            for (var jj = 0; jj < vec.Dimension(); jj++) {
                this.Q.SetValue(jj, ii, current.Get(jj));
                if (jj <= ii) {
                    this.R.SetValue(jj, ii, normalized[jj].Dot(vec));
                }
            }
        }
    }
}
/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
/// <reference path="qrdecomposition.ts" />
class EigenElement {
    constructor(eigenValue, eigenVector) {
        this.eigenValue = eigenValue;
        this.eigenVector = eigenVector;
    }
}
class EigenDecomposition {
    constructor(matrix) {
        if (matrix.width != matrix.height) {
            throw 'Cannot compute eigen decomposition for non square matrix';
        }
        let workMatrix = matrix.Clone();
        let eigenVectors = Matrix.Identity(matrix.width);
        for (let index = 0; index <= 200; index++) {
            let QR = new QRDecomposition(workMatrix);
            workMatrix = QR.R.Multiply(QR.Q);
            eigenVectors = eigenVectors.Multiply(QR.Q);
            if (workMatrix.IsDiagonnal()) {
                break;
            }
        }
        //Return the best result we got, anyway (might not have converged in the main loop)
        let result = [];
        for (let ii = 0; ii < workMatrix.width; ii++) {
            result.push(new EigenElement(workMatrix.GetValue(ii, ii), eigenVectors.GetColumnVector(ii)));
        }
        function Compare(a, b) {
            return (a.eigenValue < b.eigenValue) ? -1 : ((a.eigenValue > b.eigenValue) ? 1 : 0);
        }
        result = result.sort(Compare);
        return result;
    }
}
/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
/// <reference path="eigendecomposition.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../tools/dataprovider.ts" />
class PlaneFittingResult {
    constructor(center, normal) {
        this.center = center;
        this.normal = normal;
    }
    ComputePatchRadius(data) {
        let maxradius = 0;
        let size = data.Size();
        for (let index = 0; index < size; index++) {
            let radius = data.GetData(index).Minus(this.center).Cross(this.normal).Norm();
            if (radius > maxradius) {
                maxradius = radius;
            }
        }
        return maxradius;
    }
}
class Geometry {
    static LinesIntersection(a, b) {
        var d = a.dir.Dot(b.dir);
        var sqrLenA = a.dir.SqrNorm();
        var sqrLenB = b.dir.SqrNorm();
        var s = ((sqrLenA * sqrLenB) - (d * d));
        if (s <= 1.0e-12) {
            //Aligned axes
            return a.from.Plus(b.from).Times(0.5);
        }
        var delta = a.from.Minus(b.from);
        var t1 = delta.Dot(b.dir.Times(d).Minus(a.dir.Times(sqrLenB))) / s;
        var t2 = delta.Dot(b.dir.Times(sqrLenA).Minus(a.dir.Times(d))) / s;
        var r1 = a.from.Plus(a.dir.Times(t1));
        var r2 = b.from.Plus(b.dir.Times(t2));
        return r1.Plus(r2).Times(0.5);
    }
    static PlanesIntersection(planes) {
        //Simply solve the (over constrained) linear problem
        //Having ni.x = ni.pi for all ni, pi being respectively the planes normals and centers
        //Thus N.x = Y (N being the normals matrix, Y being the matrix of dot products between normals and centers)
        //Use the Pseudo inverse method, we have to find x satifying N[t].N.x = N[t].Y ([t] = transposed)
        let left = Matrix.Null(3, 3);
        let right = Matrix.Null(1, 3);
        let size = planes.length;
        for (let index = 0; index < size; index++) {
            let n = planes[index].normal;
            let p = planes[index].center;
            let s = p.Dot(n);
            for (let ii = 0; ii < 3; ii++) {
                right.AddValue(ii, 0, n.Get(ii) * s);
                for (let jj = 0; jj < 3; jj++) {
                    left.AddValue(ii, jj, n.Get(ii) * n.Get(jj));
                }
            }
        }
        return left.LUSolve(right).GetColumnVector(0);
    }
    static DegreeToRadian(a) {
        return Math.PI * a / 180.0;
    }
    static RadianToDegree(a) {
        return a / Math.PI * 180;
    }
    static DistanceToSegment(point, a, b) {
        let ab = b.Minus(a);
        let ap = point.Minus(a);
        if (ap.Dot(ab) <= 0)
            return ap.Norm();
        let bp = point.Minus(b);
        if (bp.Dot(ab) >= 0)
            return bp.Norm();
        ab.Normalize();
        return ap.Cross(ab).Norm();
    }
    static Centroid(data, weights = null) {
        let center = new Vector([0, 0, 0]);
        let size = data.Size();
        for (let index = 0; index < size; index++) {
            let datum = data.GetData(index);
            if (weights) {
                datum = datum.Times(weights.GetData(index));
            }
            center.Add(datum);
        }
        center = center.Times(1 / size);
        return center;
    }
    static PlaneFitting(data) {
        //Compute the coletiance matrix
        let coletiance = Matrix.Null(3, 3);
        let center = Geometry.Centroid(data);
        let size = data.Size();
        for (let index = 0; index < size; index++) {
            let vec = data.GetData(index).Minus(center);
            for (let ii = 0; ii < 3; ii++) {
                for (let jj = 0; jj < 3; jj++) {
                    coletiance.SetValue(ii, jj, coletiance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj)));
                }
            }
        }
        //The normal is the eigenvector having the smallest eigenvalue in the coletiance matrix
        for (let ii = 0; ii < 3; ii++) {
            //Check no column is null in the coletiance matrix
            if (coletiance.GetColumnVector(ii).SqrNorm() <= 1.0e-12) {
                let result = new Vector([0, 0, 0]);
                result.Set(ii, 1);
                return new PlaneFittingResult(center, result);
            }
        }
        let eigen = new EigenDecomposition(coletiance);
        if (eigen) {
            return new PlaneFittingResult(center, eigen[0].eigenVector.Normalized());
        }
        return null;
    }
    //=======================================================
    // Spherical coordinates tools
    // Let theta, phi, fully describing an orthogonal base (theta, phi being the spherical coordinates of the Z axis)
    //=======================================================
    static GetTheta(zaxis) {
        return Math.acos(zaxis.Get(2));
    }
    static GetPhi(zaxis) {
        if (Math.abs(zaxis.Get(0)) > 1e-6) {
            return Math.atan2(zaxis.Get(1), zaxis.Get(0));
        }
        return 0;
    }
    static GetZAxis(theta, phi) {
        return new Vector([
            Math.cos(phi) * Math.sin(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(theta)
        ]);
    }
    static GetXAxis(theta, phi) {
        return new Vector([
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi) * Math.cos(theta),
            -Math.sin(theta)
        ]);
    }
    static GetYAxis(theta, phi) {
        return new Vector([
            -Math.sin(phi),
            Math.cos(phi),
            0
        ]);
    }
    //This one is the projection of both Zaxis and XAxis in the plane Z=0 (thus, it's orthogonal to YAxis as well)
    static GetWAxis(theta, phi) {
        return new Vector([
            Math.cos(phi),
            Math.sin(phi),
            0
        ]);
    }
}
/// <reference path="kdtree.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="neighbourhood.ts" />
/// <reference path="regiongrowth.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/geometry.ts" />
/// <reference path="../tools/transform.ts" />
class PointCloud extends PointSet {
    constructor(points, normals) {
        super();
        this.tree = null;
        this.points = points || new Float32Array([]);
        this.pointssize = this.points.length;
        this.normals = normals || new Float32Array([]);
        this.normalssize = this.normals.length;
        this.boundingbox = new BoundingBox();
        for (let index = 0; index < this.Size(); index++) {
            this.boundingbox.Add(this.GetPoint(index));
        }
    }
    PushPoint(p) {
        if (this.pointssize + p.Dimension() > this.points.length) {
            //Not optimal (Reserve should be called before callin PushPoint)
            this.Reserve(this.points.length + p.Dimension());
        }
        for (let index = 0; index < p.Dimension(); index++) {
            this.points[this.pointssize++] = p.Get(index);
        }
        this.boundingbox.Add(p);
        this.tree = null;
    }
    Reserve(capacity) {
        let points = new Float32Array(3 * capacity);
        for (let index = 0; index < this.pointssize; index++) {
            points[index] = this.points[index];
        }
        this.points = points;
        let normals = new Float32Array(3 * capacity);
        for (let index = 0; index < this.normalssize; index++) {
            normals[index] = this.normals[index];
        }
        this.normals = normals;
    }
    GetPoint(i) {
        let index = 3 * i;
        return new Vector([
            this.points[index],
            this.points[index + 1],
            this.points[index + 2]
        ]);
    }
    GetData(i) {
        return this.GetPoint(i);
    }
    static SetValues(i, p, target) {
        let index = 3 * i;
        for (let ii = 0; ii < 3; ii++) {
            target[index + ii] = p.Get(ii);
        }
    }
    GetPointCoordinate(i, j) {
        return this.points[3 * i + j];
    }
    Size() {
        return this.pointssize / 3;
    }
    PushNormal(n) {
        if (this.normals.length < this.points.length) {
            let normals = new Float32Array(this.points.length);
            for (let index = 0; index < this.normalssize; index++) {
                normals[index] = this.normals[index];
            }
            this.normals = normals;
        }
        for (let index = 0; index < n.Dimension(); index++) {
            this.normals[this.normalssize++] = n.Get(index);
        }
    }
    GetNormal(i) {
        let index = 3 * i;
        return new Vector([
            this.normals[index],
            this.normals[index + 1],
            this.normals[index + 2]
        ]);
    }
    InvertNormal(i) {
        for (let index = 0; index < 3; index++) {
            this.normals[3 * i + index] = -this.normals[3 * i + index];
        }
    }
    HasNormals() {
        return (this.normalssize == this.pointssize);
    }
    ClearNormals() {
        this.normalssize = 0;
    }
    Distance(p) {
        let nearest = this.KNearestNeighbours(p, 1).Neighbours();
        return Math.sqrt(nearest[0].sqrdistance);
    }
    KNearestNeighbours(queryPoint, k) {
        if (!this.tree) {
            this.tree = new KDTree(this);
        }
        let knn = new KNearestNeighbours(k);
        this.tree.FindNearestNeighbours(queryPoint, knn);
        return knn;
    }
    RayIntersection(ray) {
        if (!this.tree) {
            this.tree = new KDTree(this);
        }
        let result = this.tree.RayIntersection(ray);
        if (result.HasIntersection()) {
            let cell = result.object;
            let subCloud = this.tree.GetSubCloud(cell);
            let tanAperture = ray.aperture ? Math.tan(ray.aperture) : null;
            result = new Picking(this);
            for (let index = 0; index < subCloud.Size(); index++) {
                let delta = subCloud.GetPoint(index).Minus(ray.from);
                let distAlongRay = Math.abs(delta.Dot(ray.dir));
                if (tanAperture !== null) {
                    let sqrDistToRay = delta.SqrNorm() - distAlongRay ** 2;
                    let threshold = (tanAperture * distAlongRay) ** 2;
                    if (sqrDistToRay <= threshold)
                        result.Add(distAlongRay);
                }
                else
                    result.Add(distAlongRay);
            }
        }
        return result;
    }
    ComputeNormal(index, k) {
        //Get the K-nearest neighbours (including the query point)
        let point = this.GetPoint(index);
        let knn = this.KNearestNeighbours(point, k + 1);
        return Geometry.PlaneFitting(knn).normal;
    }
    ApplyTransform(transform) {
        this.boundingbox = new BoundingBox();
        for (let index = 0; index < this.Size(); index++) {
            let p = this.GetPoint(index);
            p = transform.TransformPoint(p);
            PointCloud.SetValues(index, p, this.points);
            this.boundingbox.Add(p);
            if (this.HasNormals()) {
                let n = this.GetNormal(index);
                n = transform.TransformVector(n).Normalized();
                PointCloud.SetValues(index, n, this.normals);
            }
        }
        if (this.tree) {
            delete this.tree;
        }
    }
    Sample(nbSamples) {
        if (!this.tree) {
            this.tree = new KDTree(this);
        }
        return new PointSubCloud(this, this.tree.ExtractSamples(nbSamples));
    }
}
class GaussianSphere extends PointSet {
    constructor(cloud) {
        super();
        this.cloud = cloud;
        this.normals = null;
        if (!cloud.HasNormals()) {
            let size = cloud.Size();
            this.normals = new Array(size);
            for (let index = 0; index < size; index++) {
                this.normals[index] = cloud.ComputeNormal(index, 30);
            }
        }
    }
    Size() {
        return this.cloud.Size();
    }
    GetPoint(index) {
        if (this.normals) {
            return this.normals[index];
        }
        else {
            return this.cloud.GetNormal(index);
        }
    }
    ToPointCloud() {
        let gsphere = new PointCloud();
        let size = this.Size();
        gsphere.Reserve(size);
        for (let index = 0; index < size; index++) {
            gsphere.PushPoint(this.GetPoint(index));
        }
        return gsphere;
    }
}
class PointSubCloud extends PointSet {
    constructor(cloud, indices) {
        super();
        this.cloud = cloud;
        this.indices = indices;
    }
    Size() {
        return this.indices.length;
    }
    Push(index) {
        this.indices.push(index);
    }
    GetPoint(index) {
        return this.cloud.GetPoint(this.indices[index]);
    }
    GetNormal(index) {
        return this.cloud.GetNormal(this.indices[index]);
    }
    HasNormals() {
        return this.cloud.HasNormals();
    }
    ToPointCloud() {
        let subcloud = new PointCloud();
        let size = this.Size();
        subcloud.Reserve(size);
        for (let index = 0; index < size; index++) {
            subcloud.PushPoint(this.GetPoint(index));
            if (this.HasNormals()) {
                subcloud.PushNormal(this.GetNormal(index));
            }
        }
        return subcloud;
    }
}
/// <reference path="octree.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="meshface.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../tools/longprocess.ts" />
class Mesh {
    constructor(pointcloud, faces) {
        this.pointcloud = pointcloud;
        this.faces = faces || [];
        this.size = this.faces.length;
    }
    PushFace(f) {
        if (f.length != 3) {
            throw 'Non triangular faces are not (yet) supported in meshes';
        }
        if (this.size + f.length > this.faces.length) {
            //Not optimal (Reserve should be called before callin PushFace)
            this.Reserve(this.faces.length + f.length);
        }
        for (let index = 0; index < f.length; index++) {
            this.faces[this.size++] = f[index];
        }
    }
    Reserve(capacity) {
        let faces = new Array(3 * capacity);
        for (let index = 0; index < this.size; index++) {
            faces[index] = this.faces[index];
        }
        this.faces = faces;
    }
    GetFace(i) {
        let index = 3 * i;
        let indices = [
            this.faces[index++],
            this.faces[index++],
            this.faces[index++]
        ];
        return new MeshFace(indices, [
            this.pointcloud.GetPoint(indices[0]),
            this.pointcloud.GetPoint(indices[1]),
            this.pointcloud.GetPoint(indices[2])
        ]);
    }
    Size() {
        return this.size / 3;
    }
    ComputeOctree(onDone = null) {
        if (!this.octree) {
            let self = this;
            self.octree = new Octree(this);
        }
        if (onDone)
            onDone(this);
    }
    ClearNormals() {
        this.pointcloud.ClearNormals();
    }
    ComputeNormals(onDone = null) {
        if (!this.pointcloud.HasNormals()) {
            let ncomputer = new MeshNormalsComputer(this);
            ncomputer.SetNext(() => { if (onDone)
                onDone(this); });
            ncomputer.Start();
        }
    }
    GetBoundingBox() {
        return this.pointcloud.boundingbox;
    }
    RayIntersection(ray, wrapper) {
        if (this.octree) {
            return this.octree.RayIntersection(ray, wrapper);
        }
        //We should never get here !!! but just in case ...
        let result = new Picking(wrapper);
        for (let ii = 0; ii < this.Size(); ii++) {
            let tt = this.GetFace(ii).LineFaceIntersection(ray);
            if (tt !== null) {
                result.Add(tt);
            }
        }
        return result;
    }
    Distance(p) {
        if (this.octree) {
            return this.octree.Distance(p);
        }
        //We should never get here !!! but just in case ...
        let dist = null;
        for (let ii = 0; ii < this.Size(); ii++) {
            let dd = this.GetFace(ii).Distance(p);
            if (dist == null || dd < dist) {
                dist = dd;
            }
        }
        return dist;
    }
    ApplyTransform(transform) {
        this.pointcloud.ApplyTransform(transform);
    }
}
class MeshNormalsComputer extends IterativeLongProcess {
    constructor(mesh) {
        super(mesh.Size(), 'Computing normals');
        this.mesh = mesh;
    }
    Initialize() {
        this.normals = new Array(this.mesh.pointcloud.Size());
        for (let index = 0; index < this.normals.length; index++) {
            this.normals[index] = new Vector([0, 0, 0]);
        }
    }
    Iterate(step) {
        let face = this.mesh.GetFace(step);
        for (let index = 0; index < face.indices.length; index++) {
            let nindex = face.indices[index];
            this.normals[nindex] = this.normals[nindex].Plus(face.Normal);
        }
    }
    Finalize() {
        let cloud = this.mesh.pointcloud;
        cloud.ClearNormals();
        let nbPoints = cloud.Size();
        for (let index = 0; index < nbPoints; index++) {
            cloud.PushNormal(this.normals[index].Normalized());
        }
    }
}
class NameProvider {
    static GetName(key) {
        if (!(key in this.indices)) {
            this.indices[key] = 0;
        }
        let name = key + ' ' + this.indices[key];
        this.indices[key]++;
        return name;
    }
}
NameProvider.indices = {};
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
class NumberProperty extends PropertyWithValue {
    constructor(name, value, handler) {
        super(name, 'text', value, handler);
    }
    GetValue() {
        try {
            return parseFloat(this.input.value);
        }
        catch (ex) {
            return null;
        }
    }
}
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
class PCLMesh extends PCLPrimitive {
    constructor(mesh) {
        super(NameProvider.GetName('Mesh'));
        this.mesh = mesh;
        this.drawing = new MeshDrawing();
    }
    GetPrimitiveBoundingBox() {
        return this.mesh.GetBoundingBox();
    }
    DrawPrimitive(drawingContext) {
        this.drawing.FillBuffers(this.mesh, drawingContext);
        this.drawing.Draw(this.lighting, drawingContext);
    }
    InvalidateDrawing() {
        this.drawing.Clear();
        this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
    }
    RayIntersection(ray) {
        return this.mesh.RayIntersection(ray, this);
    }
    GetDistance(p) {
        return this.mesh.Distance(p);
    }
    TransformPrivitive(transform) {
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
    GetSerializationID() {
        return PCLMesh.SerializationID;
    }
    SerializePrimitive(serializer) {
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
    GetParsingHandler() {
        return new PCLMeshParsingHandler();
    }
}
PCLMesh.SerializationID = 'MESH';
class PCLMeshParsingHandler extends PCLPrimitiveParsingHandler {
    constructor() {
        super();
    }
    ProcessPrimitiveParam(paramname, parser) {
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
    FinalizePrimitive() {
        let cloud = new PointCloud(this.points);
        let mesh = new Mesh(cloud, this.faces);
        let result = new PCLMesh(mesh);
        mesh.ComputeNormals(() => result.NotifyChange(result, ChangeType.Display));
        mesh.ComputeOctree();
        return result;
    }
}
class MeshDrawing {
    constructor() {
        this.pcdrawing = new PointCloudDrawing();
        this.glIndexBuffer = null;
    }
    FillBuffers(mesh, ctx) {
        this.context = ctx;
        this.buffersize = mesh.size;
        this.pcdrawing.FillBuffers(mesh.pointcloud, null, ctx);
        if (!this.glIndexBuffer) {
            this.glIndexBuffer = new ElementArrayBuffer(mesh.faces, ctx);
        }
    }
    Draw(lighting, ctx) {
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
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
class Shape {
    constructor() {
        this.boundingbox = null;
    }
    GetBoundingBox() {
        if (!this.boundingbox) {
            this.boundingbox = this.ComputeBoundingBox();
        }
        return this.boundingbox;
    }
}
/// <reference path="container.ts" />
class Toolbar {
    constructor(classname = "Toolbar") {
        this.toolbar = document.createElement('div');
        this.toolbar.className = classname;
    }
    AddControl(control) {
        let container = document.createElement('span');
        container.appendChild(control.GetElement());
        this.toolbar.appendChild(container);
        return control;
    }
    RemoveControl(control) {
        let element = control.GetElement();
        for (var index = 0; index < this.toolbar.children.length; index++) {
            let container = this.toolbar.children[index];
            let current = container.firstChild;
            if (current === element) {
                this.toolbar.removeChild(container);
                return;
            }
        }
    }
    Clear() {
        while (this.toolbar.lastChild) {
            this.toolbar.removeChild(this.toolbar.lastChild);
        }
    }
    GetElement() {
        return this.toolbar;
    }
}
/// <reference path="control.ts" />
class Hint {
    constructor(owner, message) {
        this.owner = owner;
        this.container = document.createElement('div');
        this.container.className = 'Hint';
        this.container.innerHTML = message;
        if (owner) {
            let element = this.owner.GetElement();
            let self = this;
            element.onmouseenter = (ev) => { self.Show(); };
            element.onmouseleave = (ev) => { self.Hide(); };
        }
    }
    Show() {
        if (Hint.current) {
            Hint.current.Hide();
        }
        if (!this.container.parentElement) {
            document.body.appendChild(this.container);
        }
        Hint.current = this;
    }
    Hide() {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        if (Hint.current == this) {
            Hint.current = null;
        }
    }
    GetElement() {
        return this.container;
    }
}
Hint.current = null;
class TemporaryHint extends Hint {
    constructor(message, duration = TemporaryHint.DisplayDuration) {
        super(null, message + (duration ? '' : '<br/><i>(Click this box to close)</i>'));
        let self = this;
        this.Show();
        if (duration) {
            setTimeout(() => self.Hide(), duration);
        }
        else {
            this.container.onclick = () => self.Hide();
        }
    }
}
TemporaryHint.DisplayDuration = 4000;
/// <reference path="control.ts" />
/// <reference path="hint.ts" />
/// <reference path="../../controler/actions/action.ts" />
class Button {
    constructor(action) {
        this.action = action;
        this.button = document.createElement('div');
        this.button.className = 'Button';
        let namePattern = /(?:\[Icon\:(.*)\]\s*)?(.*)/i;
        let name = namePattern.exec(action.GetLabel(false));
        this.buttonLabel = document.createTextNode(name[name.length - 1]);
        let nameContainer = this.buttonLabel;
        if (name[1]) {
            let icon = document.createElement('i');
            icon.className = 'ButtonIcon fa fa-' + name[1];
            nameContainer = document.createElement('span');
            nameContainer.appendChild(icon);
            nameContainer.appendChild(this.buttonLabel);
        }
        this.button.appendChild(nameContainer);
        if (action.hintMessage) {
            this.hint = new Hint(this, action.hintMessage);
        }
        if (action) {
            this.button.onclick = function (event) { action.Run(); };
        }
        this.UpdateEnabledState();
    }
    GetElement() {
        return this.button;
    }
    SetLabel(value) {
        this.buttonLabel.data = value;
    }
    GetLabel() {
        return this.buttonLabel.data;
    }
    UpdateEnabledState() {
        if (this.action) {
            this.button.setAttribute('enabled', this.action.Enabled() ? '1' : '0');
        }
    }
}
/// <reference path="control.ts" />
/// <reference path="toolbar.ts" />
/// <reference path="button.ts" />
class Dialog {
    constructor(onAccept, onCancel) {
        this.container = document.createElement('div');
        this.container.className = 'Dialog';
        var table = document.createElement('table');
        table.className = 'DialogContent';
        this.container.appendChild(table);
        var row = table.insertRow(0);
        var cell = row.insertCell();
        cell.colSpan = 2;
        var dialog = this;
        function ApplyAndClose(callback) {
            return function () {
                if (callback && !callback(dialog)) {
                    return false;
                }
                if (dialog.container.parentNode) {
                    dialog.container.parentNode.removeChild(dialog.container);
                }
                return true;
            };
        }
        let toolbar = new Toolbar();
        toolbar.AddControl(new Button(new SimpleAction('Ok', ApplyAndClose(onAccept))));
        toolbar.AddControl(new Button(new SimpleAction('Cancel', ApplyAndClose(onCancel))));
        cell.appendChild(toolbar.GetElement());
        document.body.appendChild(this.container);
    }
    InsertItem(title, control = null) {
        let table = this.container.childNodes[0];
        var row = table.insertRow(table.rows.length - 1);
        var titleCell = row.insertCell();
        titleCell.appendChild(document.createTextNode(title));
        if (control) {
            var contentCell = row.insertCell();
            contentCell.appendChild(control);
        }
        else {
            titleCell.colSpan = 2;
        }
        return row;
    }
    InsertTitle(title) {
        let row = this.InsertItem(title);
        let cell = row.cells[0];
        cell.style.fontWeight = 'bold';
        cell.style.textDecoration = 'underline';
        return row;
    }
    InsertValue(title, defaultValue) {
        let valueControl = document.createElement('input');
        valueControl.type = 'text';
        valueControl.width = 20;
        valueControl.value = defaultValue;
        return this.InsertItem(title, valueControl);
    }
    InsertCheckBox(title, defaultValue = null) {
        let valueControl = document.createElement('input');
        valueControl.type = 'checkbox';
        valueControl.checked = defaultValue ? true : false;
        return this.InsertItem(title, valueControl);
    }
    GetValue(title) {
        let table = this.container.childNodes[0];
        for (var index = 0; index < table.rows.length; index++) {
            let row = table.rows[index];
            let rowTitle = (row.cells[0]).innerText;
            if (rowTitle == title) {
                let valueInput = row.cells[1].childNodes[0];
                if (valueInput.type == 'text') {
                    return valueInput.value;
                }
                else if (valueInput.type == 'checkbox') {
                    return valueInput.checked;
                }
            }
        }
        return null;
    }
    GetElement() {
        return this.container;
    }
}
/// <reference path="action.ts" />
/// <reference path="delegate.ts" />
/// <reference path="../../gui/controls/dialog.ts" />
/// <reference path="../../gui/objects/pclmesh.ts" />
/// <reference path="../../gui/objects/pclshape.ts" />
/// <reference path="../../model/shapes/shape.ts" />
class CreateShapeMeshAction extends Action {
    constructor(shape, sampling) {
        super('Create shape mesh', 'Builds the mesh sampling this shape');
        this.shape = shape;
        this.sampling = sampling;
    }
    Enabled() {
        return true;
    }
    Trigger() {
        let self = this;
        let dialog = new Dialog(
        //Ok has been clicked
        (properties) => {
            return self.CreateMesh(properties);
        }, 
        //Cancel has been clicked
        () => true);
        dialog.InsertValue('Sampling', this.sampling);
    }
    CreateMesh(properties) {
        let sampling = parseInt(properties.GetValue('Sampling'));
        let result;
        let mesh = this.shape.GetShape().ComputeMesh(sampling, () => {
            if (result)
                result.InvalidateDrawing();
        });
        result = new PCLMesh(mesh);
        let self = this;
        mesh.ComputeOctree(() => {
            self.shape.NotifyChange(result, ChangeType.NewItem);
        });
        return true;
    }
}
/// <reference path="pclprimitive.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="pclmesh.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/mesh.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../../controler/actions/shapeactions.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../tools/transform.ts" />
class PCLShape extends PCLPrimitive {
    constructor(name, shape) {
        super(name);
        this.drawing = new MeshDrawing();
        this.meshsampling = 0;
        this.pendingmesh = false;
        let self = this;
    }
    TransformPrivitive(transform) {
        this.GetShape().ApplyTransform(transform);
        this.Invalidate();
    }
    GetPrimitiveBoundingBox() {
        return this.GetShape().GetBoundingBox();
    }
    RayIntersection(ray) {
        return this.GetShape().RayIntersection(ray, this);
    }
    GetDistance(p) {
        return this.GetShape().Distance(p);
    }
    PrepareForDrawing(drawingContext) {
        //Avoid concurrent mesh computation requests
        if (this.pendingmesh) {
            return false;
        }
        if (this.meshsampling !== drawingContext.sampling) {
            this.pendingmesh = true;
            //Asynchroneous computation of the mesh to be rendered
            let self = this;
            this.GetShape().ComputeMesh(drawingContext.sampling, (mesh) => {
                if (self.meshsampling = drawingContext.sampling) {
                    self.meshsampling = drawingContext.sampling;
                    self.drawing.FillBuffers(mesh, drawingContext);
                    self.pendingmesh = false;
                    self.NotifyChange(self, ChangeType.Display);
                }
            });
            //Not ready yet. Wait for NotifyChange to be handled 
            return false;
        }
        return true;
    }
    DrawPrimitive(drawingContext) {
        if (this.PrepareForDrawing(drawingContext)) {
            this.drawing.Draw(this.lighting, drawingContext);
        }
    }
    FillProperties() {
        super.FillProperties();
        if (this.properties) {
            this.properties.Push(new PropertyGroup('Geometry', this.GetGeometry()));
        }
    }
    GetActions(delegate) {
        let result = super.GetActions(delegate);
        result.push(null);
        result.push(new CreateShapeMeshAction(this, delegate.GetShapesSampling()));
        return result;
    }
    Invalidate() {
        this.meshsampling = 0;
        this.GetShape().boundingbox = null;
        this.drawing.Clear();
    }
    GeometryChangeHandler(update) {
        let self = this;
        return function (value) {
            if (update) {
                update(value);
            }
            self.Invalidate();
        };
    }
}
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
class Plane extends Shape {
    constructor(center, normal, patchRadius) {
        super();
        this.center = center;
        this.normal = normal;
        this.patchRadius = patchRadius;
    }
    ComputeMesh(sampling, onDone) {
        let points = new PointCloud();
        points.Reserve(sampling + 1);
        let xx = this.normal.GetOrthogonnal();
        let yy = this.normal.Cross(xx).Normalized();
        for (let ii = 0; ii < sampling; ii++) {
            let phi = 2.0 * ii * Math.PI / sampling;
            let c = Math.cos(phi);
            let s = Math.sin(phi);
            let radiusVect = xx.Times(c).Plus(yy.Times(s));
            points.PushPoint(this.center.Plus(radiusVect.Times(this.patchRadius)));
        }
        points.PushPoint(this.center);
        let mesh = new Mesh(points);
        mesh.Reserve(sampling);
        for (let ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii, sampling, (ii + 1) % sampling]);
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    }
    Distance(point) {
        return Math.abs(point.Minus(this.center).Dot(this.normal));
    }
    ApplyTransform(transform) {
        this.normal = transform.TransformVector(this.normal).Normalized();
        this.center = transform.TransformPoint(this.center);
        this.patchRadius *= transform.scalefactor;
    }
    ComputeBoundingBox() {
        let size = new Vector([
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(0)))),
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(1)))),
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(2))))
        ]);
        let bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    }
    GetWorldToInnerBaseMatrix() {
        let translation = Matrix.Identity(4);
        let basechange = Matrix.Identity(4);
        let xx = this.normal.GetOrthogonnal();
        let yy = this.normal.Cross(xx).Normalized();
        for (let index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.normal.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    }
    RayIntersection(ray, wrapper) {
        let worldToBase = this.GetWorldToInnerBaseMatrix();
        let innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
        let innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));
        //solve [t] : p[t].z = 0
        let result = new Picking(wrapper);
        let tt = -innerFrom.GetValue(2, 0) / innerDir.GetValue(2, 0);
        let point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(tt));
        if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (this.patchRadius * this.patchRadius)) {
            result.Add(tt);
        }
        return result;
    }
    ComputeBounds(points) {
        this.center = new Vector([0, 0, 0]);
        let size = points.Size();
        for (let ii = 0; ii < points.Size(); ii++) {
            this.center = this.center.Plus(points.GetPoint(ii));
        }
        this.center = this.center.Times(1.0 / size);
        this.patchRadius = 0;
        for (let ii = 0; ii < size; ii++) {
            let d = points.GetPoint(ii).Minus(this.center).SqrNorm();
            if (d > this.patchRadius) {
                this.patchRadius = d;
            }
        }
        this.patchRadius = Math.sqrt(this.patchRadius);
    }
    FitToPoints(points) {
        let result = Geometry.PlaneFitting(points);
        this.normal = result.normal;
        this.center = result.center;
        this.patchRadius = result.ComputePatchRadius(points);
        return null;
    }
}
/// <reference path="property.ts" />
/// <reference path="propertygroup.ts" />
/// <reference path="propertywithvalue.ts" />
/// <reference path="numberproperty.ts" />
/// <reference path="../../../maths/vector.ts" />
class VectorProperty extends PropertyGroup {
    constructor(name, vector, normalize = false, handler = null) {
        super(name, null, null);
        this.vector = vector;
        this.normalize = normalize;
        let self = this;
        this.Add(new NumberProperty('X', () => vector().Get(0), (x) => self.UpdateValue(0, x)));
        this.Add(new NumberProperty('Y', () => vector().Get(1), (y) => self.UpdateValue(1, y)));
        this.Add(new NumberProperty('Z', () => vector().Get(2), (z) => self.UpdateValue(2, z)));
        //The change handler might be invoked curing the construction, above. Wait for the whole thing to be ready, before the change handler is set
        this.changeHandler = handler;
    }
    UpdateValue(index, value) {
        let vect = this.vector();
        vect.Set(index, value);
        if (this.normalize) {
            vect.Normalize();
            this.properties.Refresh();
        }
        this.NotifyChange();
    }
    GetValue() {
        return new Vector([
            this.properties.GetValue('X'),
            this.properties.GetValue('Y'),
            this.properties.GetValue('Z')
        ]);
    }
}
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/plane.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
class PCLPlane extends PCLShape {
    constructor(plane) {
        super(NameProvider.GetName('Plane'), plane);
        this.plane = plane;
    }
    GetShape() {
        return this.plane;
    }
    GetGeometry() {
        let self = this;
        let geometry = new Properties();
        geometry.Push(new VectorProperty('Center', () => self.plane.center, false, this.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Normal', () => self.plane.normal, true, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Patch Radius', () => self.plane.patchRadius, this.GeometryChangeHandler((value) => self.plane.patchRadius = value)));
        return geometry;
    }
    GetSerializationID() {
        return PCLPlane.SerializationID;
    }
    SerializePrimitive(serializer) {
        let plane = this.plane;
        serializer.PushParameter('center', (s) => {
            s.PushFloat32(plane.center.Get(0));
            s.PushFloat32(plane.center.Get(1));
            s.PushFloat32(plane.center.Get(2));
        });
        serializer.PushParameter('normal', (s) => {
            s.PushFloat32(plane.normal.Get(0));
            s.PushFloat32(plane.normal.Get(1));
            s.PushFloat32(plane.normal.Get(2));
        });
        serializer.PushParameter('radius', (s) => {
            s.PushFloat32(plane.patchRadius);
        });
    }
    GetParsingHandler() {
        return new PCLPlaneParsingHandler();
    }
}
PCLPlane.SerializationID = 'PLANE';
class PCLPlaneParsingHandler extends PCLPrimitiveParsingHandler {
    constructor() {
        super();
    }
    ProcessPrimitiveParam(paramname, parser) {
        switch (paramname) {
            case 'center':
                this.center = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'normal':
                this.normal = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'radius':
                this.radius = parser.reader.GetNextFloat32();
                return true;
        }
        return false;
    }
    FinalizePrimitive() {
        let plane = new Plane(this.center, this.normal, this.radius);
        return new PCLPlane(plane);
    }
}
/// <reference path="matrix.ts" />
/// <reference path="../tools/dataprovider.ts" />
/*Solves parametric model least squares fitting using Levenberg Marquardt algorithm
The solver stops as soon as one of the following requirement is met :
 - the solution did not evelve after StabilityNbSteps steps
 - the solution improve ratio falls bellow StabilityFactor in ]0,1[*/
class LeastSquaresFitting extends LongProcess {
    constructor(solution, evaluable, data, message, lambda = 1.0, lambdaFactor = 10.0, stabilityNbSteps = 10, stabilityFactor = 1.0e-3) {
        super(message);
        this.solution = solution;
        this.evaluable = evaluable;
        this.data = data;
        this.lambda = lambda;
        this.lambdaFactor = lambdaFactor;
        this.stabilityNbSteps = stabilityNbSteps;
        this.stabilityFactor = stabilityFactor;
    }
    Initialize() {
        this.error = this.ComputeError(this.solution);
        this.iterations = 0;
        this.counter = 0;
        this.maxcounter = 0;
    }
    get Done() {
        return (this.counter >= this.stabilityNbSteps) ||
            (this.delta < this.stabilityFactor * this.error);
    }
    get Current() {
        return this.maxcounter;
    }
    get Target() {
        return this.stabilityNbSteps;
    }
    Step() {
        this.counter++;
        if (this.counter > this.maxcounter) {
            this.maxcounter = this.counter;
        }
        //Compute matrices
        if (this.jacobian == null || this.rightHand == null) {
            this.jacobian = Matrix.Null(this.solution.length, this.solution.length);
            this.rightHand = Matrix.Null(1, this.solution.length);
            let size = this.data.Size();
            for (let index = 0; index < size; index++) {
                let datum = this.data.GetData(index);
                let dist = -this.evaluable.Distance(this.solution, datum);
                let grad = this.evaluable.DistanceGradient(this.solution, datum);
                for (let ii = 0; ii < this.solution.length; ii++) {
                    this.rightHand.AddValue(ii, 0, grad[ii] * dist);
                    for (let jj = 0; jj < this.solution.length; jj++) {
                        this.jacobian.AddValue(ii, jj, grad[ii] * grad[jj]);
                    }
                }
            }
        }
        //Compute the modified jacobian
        let leftHand = this.jacobian.Clone();
        for (let index = 0; index < this.jacobian.width; index++) {
            leftHand.SetValue(index, index, this.jacobian.GetValue(index, index) * (1.0 + this.lambda));
        }
        // Solve leftHand . step = rightHand to get the next solution
        let step = leftHand.LUSolve(this.rightHand);
        let next = new Array(this.solution.length);
        for (let index = 0; index < this.solution.length; index++) {
            next[index] = step.GetValue(index, 0) + this.solution[index];
        }
        let nextError = this.ComputeError(next);
        if (nextError < this.error) {
            //Solution has been improved : accept solution and dicrease lambda
            this.solution = next;
            this.evaluable.NotifyNewSolution(this.solution);
            //Solution has changed : invalidate matrices
            this.jacobian = null;
            this.rightHand = null;
            this.lambda /= this.lambdaFactor;
            //If solution increase falls bellow a tolerance, stop computations
            this.iterations += this.counter;
            this.delta = this.error - nextError;
            this.error = nextError;
            //Reset counter as the solution gets better
            this.counter = 0;
        }
        else {
            //Solution is worst : increase lambda
            this.lambda *= this.lambdaFactor;
        }
    }
    ComputeError(parameters) {
        let error = 0.0;
        let size = this.data.Size();
        for (let index = 0; index < size; index++) {
            error += this.evaluable.Distance(parameters, this.data.GetData(index)) ** 2;
        }
        return error / size;
    }
}
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/leatssquaresfitting.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
class Sphere extends Shape {
    constructor(center, radius) {
        super();
        this.center = center;
        this.radius = radius;
    }
    ComputeBoundingBox() {
        let size = new Vector([1, 1, 1]).Times(2 * this.radius);
        let bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    }
    GetWorldToInnerBaseMatrix() {
        let matrix = Matrix.Identity(4);
        for (let index = 0; index < 3; index++) {
            matrix.SetValue(index, 3, -this.center.Get(index));
        }
        return matrix;
    }
    GetInnerBaseToWorldMatrix() {
        let matrix = Matrix.Identity(4);
        for (let index = 0; index < 3; index++) {
            matrix.SetValue(index, 3, this.center.Get(index));
        }
        return matrix;
    }
    ComputeMesh(sampling, onDone) {
        let halfSampling = Math.ceil(sampling / 2);
        let points = new PointCloud();
        points.Reserve(sampling * halfSampling + 2);
        points.PushPoint(this.center.Plus(new Vector([0, 0, this.radius])));
        points.PushPoint(this.center.Plus(new Vector([0, 0, -this.radius])));
        //Spherical coordinates
        for (let jj = 0; jj < halfSampling; jj++) {
            for (let ii = 0; ii < sampling; ii++) {
                let phi = ((jj + 1) * Math.PI) / (halfSampling + 1);
                let theta = 2.0 * ii * Math.PI / sampling;
                let radial = new Vector([
                    Math.cos(theta) * Math.sin(phi),
                    Math.sin(theta) * Math.sin(phi),
                    Math.cos(phi)
                ]);
                points.PushPoint(this.center.Plus(radial.Times(this.radius)));
            }
        }
        let mesh = new Mesh(points);
        mesh.Reserve(2 * sampling + (halfSampling - 1) * sampling);
        //North pole
        let northShift = 2;
        for (let ii = 0; ii < sampling; ii++) {
            mesh.PushFace([0, ii + northShift, ((ii + 1) % sampling) + northShift]);
        }
        //South pole
        let southShift = (halfSampling - 1) * sampling + northShift;
        for (let ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii + southShift, 1, ((ii + 1) % sampling) + southShift]);
        }
        //Strips
        for (let jj = 0; (jj + 1) < halfSampling; jj++) {
            let ja = jj * sampling;
            let jb = (jj + 1) * sampling;
            for (let ii = 0; ii < sampling; ii++) {
                let ia = ii;
                let ib = (ii + 1) % sampling;
                //            [ia]        [ib]
                //   [ja] ---- aa -------- ba
                //             |           |
                //   [jb] ---- ab -------- bb
                let aa = ia + ja + northShift;
                let ab = ia + jb + northShift;
                let bb = ib + jb + northShift;
                let ba = ib + ja + northShift;
                mesh.PushFace([aa, ab, ba]);
                mesh.PushFace([ba, ab, bb]);
            }
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    }
    RayIntersection(ray, wrapper) {
        let worldToBase = this.GetWorldToInnerBaseMatrix();
        let innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
        let innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));
        //Solve [t] : sqrnorm(innerFrom[i]+t*innerDir[i])=radius
        let aa = 0;
        let bb = 0;
        let cc = 0;
        for (let index = 0; index < 3; index++) {
            aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
            bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
            cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
        }
        //Solve [t] : aa.t^2 + bb.t + cc = radius
        cc -= this.radius * this.radius;
        let dd = bb * bb - 4.0 * aa * cc;
        let result = new Picking(wrapper);
        if (Math.abs(dd) < 0.0000001) {
            result.Add(-bb / 2.0 * aa);
        }
        else if (dd > 0.) {
            result.Add((-bb + Math.sqrt(dd)) / (2.0 * aa));
            result.Add((-bb - Math.sqrt(dd)) / (2.0 * aa));
        }
        return result;
    }
    Distance(point) {
        return Math.abs(point.Minus(this.center).Norm() - this.radius);
    }
    ApplyTransform(transform) {
        this.center = transform.TransformPoint(this.center);
        this.radius *= transform.scalefactor;
    }
    static InitialGuessForFitting(cloud) {
        let center = new Vector([0, 0, 0]);
        let size = cloud.Size();
        //Rough estimate
        for (let index = 0; index < size; index++) {
            center.Add(cloud.GetPoint(index));
        }
        center = center.Times(1 / size);
        let radius = 0;
        for (let index = 0; index < cloud.Size(); index++) {
            radius += center.Minus(cloud.GetPoint(index)).Norm();
        }
        radius /= size;
        return new Sphere(center, radius);
    }
    ComputeBounds(points) {
        //NA
    }
    FitToPoints(points) {
        let lsFitting = new LeastSquaresFitting(SphereFitting.Parameters(this.center, this.radius), new SphereFitting(this), points, 'Computing best fitting sphere');
        let self = this;
        lsFitting.Start();
        return lsFitting;
    }
}
class SphereFitting {
    constructor(sphere) {
        this.sphere = sphere;
    }
    static Parameters(center, radius) {
        let params = center.coordinates.slice();
        params.push(radius);
        return params;
    }
    static GetCenter(params) {
        return new Vector(params.slice(0, 3));
    }
    static GetRadius(params) {
        return params[3];
    }
    Distance(params, point) {
        return SphereFitting.GetCenter(params).Minus(point).Norm() - SphereFitting.GetRadius(params);
    }
    DistanceGradient(params, point) {
        let delta = SphereFitting.GetCenter(params).Minus(point);
        delta.Normalize();
        let gradient = delta.Flatten();
        gradient.push(-1);
        return gradient;
    }
    NotifyNewSolution(params) {
        this.sphere.center = SphereFitting.GetCenter(params);
        this.sphere.radius = SphereFitting.GetRadius(params);
    }
}
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/sphere.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
class PCLSphere extends PCLShape {
    constructor(sphere) {
        super(NameProvider.GetName('Sphere'), sphere);
        this.sphere = sphere;
    }
    GetShape() {
        return this.sphere;
    }
    GetGeometry() {
        let self = this;
        let geometry = new Properties();
        geometry.Push(new VectorProperty('Center', () => self.sphere.center, false, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Radius', () => self.sphere.radius, this.GeometryChangeHandler((value) => self.sphere.radius = value)));
        return geometry;
    }
    ;
    GetSerializationID() {
        return PCLSphere.SerializationID;
    }
    SerializePrimitive(serializer) {
        let sphere = this.sphere;
        serializer.PushParameter('center', (s) => {
            s.PushFloat32(sphere.center.Get(0));
            s.PushFloat32(sphere.center.Get(1));
            s.PushFloat32(sphere.center.Get(2));
        });
        serializer.PushParameter('radius', (s) => {
            s.PushFloat32(sphere.radius);
        });
    }
    GetParsingHandler() {
        return new PCLSphereParsingHandler();
    }
}
PCLSphere.SerializationID = 'SPHERE';
class PCLSphereParsingHandler extends PCLPrimitiveParsingHandler {
    constructor() {
        super();
    }
    ProcessPrimitiveParam(paramname, parser) {
        switch (paramname) {
            case 'center':
                this.center = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'radius':
                this.radius = parser.reader.GetNextFloat32();
                return true;
        }
        return false;
    }
    FinalizePrimitive() {
        let sphere = new Sphere(this.center, this.radius);
        return new PCLSphere(sphere);
    }
}
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
class Cylinder extends Shape {
    constructor(center, axis, radius, height) {
        super();
        this.center = center;
        this.axis = axis;
        this.radius = radius;
        this.height = height;
    }
    ApplyTransform(transform) {
        this.axis = transform.TransformVector(this.axis).Normalized();
        this.center = transform.TransformPoint(this.center);
        this.radius *= transform.scalefactor;
        this.height *= transform.scalefactor;
    }
    ComputeBoundingBox() {
        let size = new Vector([
            2 * (Math.abs(0.5 * this.height * this.axis.Get(0)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(0))))),
            2 * (Math.abs(0.5 * this.height * this.axis.Get(1)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(1))))),
            2 * (Math.abs(0.5 * this.height * this.axis.Get(2)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(2)))))
        ]);
        let bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    }
    GetWorldToInnerBaseMatrix() {
        let translation = Matrix.Identity(4);
        let basechange = Matrix.Identity(4);
        let xx = this.axis.GetOrthogonnal();
        let yy = this.axis.Cross(xx).Normalized();
        for (let index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.axis.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    }
    ComputeMesh(sampling, onDone) {
        let points = new PointCloud();
        points.Reserve(4 * sampling + 2);
        let xx = this.axis.GetOrthogonnal();
        let yy = this.axis.Cross(xx).Normalized();
        let radials = [];
        for (let ii = 0; ii < sampling; ii++) {
            let phi = 2.0 * ii * Math.PI / sampling;
            let c = Math.cos(phi);
            let s = Math.sin(phi);
            let radial = xx.Times(c).Plus(yy.Times(s));
            radials.push(radial.Times(this.radius));
        }
        let northCenter = this.center.Plus(this.axis.Times(this.height / 2));
        let southCenter = this.center.Minus(this.axis.Times(this.height / 2));
        points.PushPoint(northCenter);
        points.PushPoint(southCenter);
        //North face
        for (let ii = 0; ii < radials.length; ii++) {
            points.PushPoint(northCenter.Plus(radials[ii]));
        }
        //South face
        for (let ii = 0; ii < radials.length; ii++) {
            points.PushPoint(southCenter.Plus(radials[ii]));
        }
        //Double points to separate normals
        for (let ii = 0; ii < radials.length; ii++) {
            points.PushPoint(northCenter.Plus(radials[ii]));
        }
        for (let ii = 0; ii < radials.length; ii++) {
            points.PushPoint(southCenter.Plus(radials[ii]));
        }
        let mesh = new Mesh(points);
        mesh.Reserve(4 * sampling);
        //North pole
        let northShift = 2;
        for (let ii = 0; ii < sampling; ii++) {
            mesh.PushFace([0, ii + northShift, ((ii + 1) % sampling) + northShift]);
        }
        //South pole
        let southShift = sampling + 2;
        for (let ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii + southShift, 1, ((ii + 1) % sampling) + southShift]);
        }
        //Strips
        let shift = southShift + sampling;
        for (let ii = 0; ii < sampling; ii++) {
            let ia = ii;
            let ib = (ii + 1) % sampling;
            let ja = 0;
            let jb = sampling;
            let aa = ia + ja + shift;
            let ab = ia + jb + shift;
            let bb = ib + jb + shift;
            let ba = ib + ja + shift;
            mesh.PushFace([aa, ab, ba]);
            mesh.PushFace([ba, ab, bb]);
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    }
    RayIntersection(ray, wrapper) {
        let worldToBase = this.GetWorldToInnerBaseMatrix();
        let innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
        let innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));
        //haveing p[t] = (innerFrom[i]+t*innerDir[i])
        //Solve p[t].x^2+p[t].y^2=radius for each i<3
        let aa = 0;
        let bb = 0;
        let cc = 0;
        for (let index = 0; index < 2; index++) {
            aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
            bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
            cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
        }
        //Solve [t] : aa.t^2 + bb.t + cc = radius
        let halfHeight = this.height / 2.0;
        let sqrRadius = this.radius * this.radius;
        cc -= sqrRadius;
        let dd = bb * bb - 4.0 * aa * cc;
        let result = new Picking(wrapper);
        let nbResults = 0;
        function acceptValue(value) {
            let point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
            if (Math.abs(point.Get(2)) <= halfHeight) {
                result.Add(value);
                nbResults++;
            }
        }
        if (Math.abs(dd) < 0.0000001) {
            acceptValue(-bb / 2.0 * aa);
        }
        else if (dd > 0.) {
            acceptValue((-bb + Math.sqrt(dd)) / (2.0 * aa));
            acceptValue((-bb - Math.sqrt(dd)) / (2.0 * aa));
        }
        if (nbResults < 2 && Math.abs(innerDir.GetValue(2, 0)) > 0.000001) {
            //test bounding disks
            //solve [t] : p[t].z = halfHeight
            let values = [
                (halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0),
                (-halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0)
            ];
            for (let ii = 0; ii < 2; ii++) {
                let value = values[ii];
                let point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
                if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= sqrRadius) {
                    result.Add(value);
                }
            }
        }
        return result;
    }
    Distance(point) {
        let delta = point.Minus(this.center);
        let hyp = delta.SqrNorm();
        let adj = this.axis.Dot(delta);
        let op = Math.sqrt(hyp - (adj * adj));
        return Math.abs(op - this.radius);
    }
    ComputeBounds(points) {
        let min = 0;
        let max = 0;
        for (let ii = 0; ii < points.Size(); ii++) {
            let d = points.GetPoint(ii).Minus(this.center).Dot(this.axis);
            if (ii == 0 || d < min) {
                min = d;
            }
            if (ii == 0 || d > max) {
                max = d;
            }
        }
        let d = 0.5 * (min + max);
        this.center = this.center.Plus(this.axis.Times(d));
        this.height = max - min;
    }
    static InitialGuessForFitting(cloud) {
        let gsphere = new GaussianSphere(cloud);
        let plane = Geometry.PlaneFitting(gsphere);
        let center = Geometry.Centroid(cloud);
        let radius = 0;
        let size = cloud.Size();
        for (let index = 0; index < size; index++) {
            radius += cloud.GetPoint(index).Minus(center).Cross(plane.normal).Norm();
        }
        radius /= size;
        return new Cylinder(center, plane.normal, radius, 0);
    }
    FitToPoints(points) {
        let self = this;
        let lsFitting = new LeastSquaresFitting(CylinderFitting.Parameters(this.center, this.axis, this.radius), new CylinderFitting(this), points, 'Computing best fitting cylinder');
        lsFitting.SetNext(() => self.FinalizeFitting(points));
        lsFitting.Start();
        return lsFitting;
    }
    FinalizeFitting(points) {
        //Compute actual cylinder center and bounds along the axis
        let zmin = null;
        let zmax = null;
        let size = points.Size();
        for (let index = 0; index < size; index++) {
            let z = points.GetPoint(index).Minus(this.center).Dot(this.axis);
            if (zmin === null || zmin > z) {
                zmin = z;
            }
            if (zmax === null || zmax < z) {
                zmax = z;
            }
        }
        this.center = this.center.Plus(this.axis.Times((zmax + zmin) / 2.0));
        this.height = zmax - zmin;
    }
}
class CylinderFitting {
    constructor(cylinder) {
        this.cylinder = cylinder;
    }
    static Parameters(center, axis, radius) {
        let theta = Geometry.GetTheta(axis);
        let phi = Geometry.GetPhi(axis);
        let xaxis = Geometry.GetXAxis(theta, phi);
        let yaxis = Geometry.GetYAxis(theta, phi);
        let x = xaxis.Dot(center);
        let y = yaxis.Dot(center);
        return [x, y, theta, phi, radius];
    }
    static GetCenter(params) {
        let theta = CylinderFitting.GetTheta(params);
        let phi = CylinderFitting.GetPhi(params);
        let x = CylinderFitting.GetX(params);
        let y = CylinderFitting.GetY(params);
        return Geometry.GetXAxis(theta, phi).Times(x).Plus(Geometry.GetYAxis(theta, phi).Times(y));
    }
    static GetAxis(params) {
        return Geometry.GetZAxis(CylinderFitting.GetTheta(params), CylinderFitting.GetPhi(params));
    }
    static GetX(params) {
        return params[0];
    }
    static GetY(params) {
        return params[1];
    }
    static GetTheta(params) {
        return params[2];
    }
    static GetPhi(params) {
        return params[3];
    }
    static GetRadius(params) {
        return params[4];
    }
    Distance(params, point) {
        let theta = CylinderFitting.GetTheta(params);
        let phi = CylinderFitting.GetPhi(params);
        let x = CylinderFitting.GetX(params);
        let y = CylinderFitting.GetY(params);
        let radius = CylinderFitting.GetRadius(params);
        let xaxis = Geometry.GetXAxis(theta, phi);
        let yaxis = Geometry.GetYAxis(theta, phi);
        let dx = point.Dot(xaxis) - x;
        let dy = point.Dot(yaxis) - y;
        return Math.sqrt(dx ** 2 + dy ** 2) - radius;
    }
    DistanceGradient(params, point) {
        let theta = CylinderFitting.GetTheta(params);
        let phi = CylinderFitting.GetPhi(params);
        let x = CylinderFitting.GetX(params);
        let y = CylinderFitting.GetY(params);
        let xaxis = Geometry.GetXAxis(theta, phi);
        let yaxis = Geometry.GetYAxis(theta, phi);
        let zaxis = Geometry.GetZAxis(theta, phi);
        let waxis = Geometry.GetWAxis(theta, phi);
        let px = point.Dot(xaxis);
        let py = point.Dot(yaxis);
        let pz = point.Dot(zaxis);
        let pw = point.Dot(waxis);
        let dx = px - x;
        let dy = py - y;
        let dist = Math.sqrt((dx ** 2) + (dy ** 2));
        let ddx = -dx / dist;
        let ddy = -dy / dist;
        let ddtheta = -dx * pz / dist;
        let ddphi = ((Math.cos(theta) * dx * py) - (dy * pw)) / dist;
        let ddradius = -1;
        return [ddx, ddy, ddtheta, ddphi, ddradius];
    }
    NotifyNewSolution(params) {
        this.cylinder.center = CylinderFitting.GetCenter(params);
        this.cylinder.axis = CylinderFitting.GetAxis(params);
        this.cylinder.radius = CylinderFitting.GetRadius(params);
    }
}
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/cylinder.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
class PCLCylinder extends PCLShape {
    constructor(cylinder) {
        super(NameProvider.GetName('Cylinder'), cylinder);
        this.cylinder = cylinder;
    }
    GetShape() {
        return this.cylinder;
    }
    GetGeometry() {
        let self = this;
        let geometry = new Properties();
        geometry.Push(new VectorProperty('Center', () => self.cylinder.center, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', () => self.cylinder.axis, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Radius', () => self.cylinder.radius, self.GeometryChangeHandler((value) => self.cylinder.radius = value)));
        geometry.Push(new NumberProperty('Height', () => self.cylinder.height, self.GeometryChangeHandler((value) => self.cylinder.height = value)));
        return geometry;
    }
    GetSerializationID() {
        return PCLCylinder.SerializationID;
    }
    SerializePrimitive(serializer) {
        let cylinder = this.cylinder;
        serializer.PushParameter('center', (s) => {
            s.PushFloat32(cylinder.center.Get(0));
            s.PushFloat32(cylinder.center.Get(1));
            s.PushFloat32(cylinder.center.Get(2));
        });
        serializer.PushParameter('axis', (s) => {
            s.PushFloat32(cylinder.axis.Get(0));
            s.PushFloat32(cylinder.axis.Get(1));
            s.PushFloat32(cylinder.axis.Get(2));
        });
        serializer.PushParameter('radius', (s) => {
            s.PushFloat32(cylinder.radius);
        });
        serializer.PushParameter('height', (s) => {
            s.PushFloat32(cylinder.height);
        });
    }
    GetParsingHandler() {
        return new PCLCylinderParsingHandler();
    }
}
PCLCylinder.SerializationID = 'CYLINDER';
class PCLCylinderParsingHandler extends PCLPrimitiveParsingHandler {
    constructor() {
        super();
    }
    ProcessPrimitiveParam(paramname, parser) {
        switch (paramname) {
            case 'center':
                this.center = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'axis':
                this.axis = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'radius':
                this.radius = parser.reader.GetNextFloat32();
                return true;
            case 'height':
                this.height = parser.reader.GetNextFloat32();
                return true;
        }
        return false;
    }
    FinalizePrimitive() {
        let cylinder = new Cylinder(this.center, this.axis, this.radius, this.height);
        return new PCLCylinder(cylinder);
    }
}
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
class Cone extends Shape {
    constructor(apex, axis, angle, height) {
        super();
        this.apex = apex;
        this.axis = axis;
        this.angle = angle;
        this.height = height;
    }
    ComputeBoundingBox() {
        let radius = Math.tan(this.angle) * this.height;
        let size = new Vector([
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(0)))),
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(1)))),
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(2))))
        ]);
        let bb = new BoundingBox();
        bb.Set(this.apex.Plus(this.axis.Times(this.height)), size);
        bb.Add(this.apex);
        return bb;
    }
    ApplyTransform(transform) {
        let c = this.apex.Plus(this.axis.Times(this.height * 0.5));
        this.axis = transform.TransformVector(this.axis).Normalized();
        this.height *= transform.scalefactor;
        c = transform.TransformPoint(c);
        this.apex = c.Minus(this.axis.Times(this.height * 0.5));
    }
    GetWorldToInnerBaseMatrix() {
        let translation = Matrix.Identity(4);
        let basechange = Matrix.Identity(4);
        let xx = this.axis.GetOrthogonnal();
        let yy = this.axis.Cross(xx).Normalized();
        for (let index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.axis.Get(index));
            translation.SetValue(index, 3, -this.apex.Get(index));
        }
        return basechange.Multiply(translation);
    }
    ComputeMesh(sampling, onDone) {
        let points = new PointCloud();
        points.Reserve(1 + 3 * sampling);
        let xx = this.axis.GetOrthogonnal();
        let yy = this.axis.Cross(xx).Normalized();
        let radius = this.height * Math.tan(this.angle);
        let radials = [];
        for (let ii = 0; ii < sampling; ii++) {
            let phi = 2.0 * ii * Math.PI / sampling;
            let c = Math.cos(phi);
            let s = Math.sin(phi);
            let radial = xx.Times(c).Plus(yy.Times(s));
            radials.push(radial.Times(radius));
        }
        let center = this.apex.Plus(this.axis.Times(this.height));
        points.PushPoint(center);
        //Face circle (double points for normals compuation)
        for (let ii = 0; ii < radials.length; ii++) {
            points.PushPoint(center.Plus(radials[ii]));
        }
        for (let ii = 0; ii < radials.length; ii++) {
            points.PushPoint(this.apex);
        }
        for (let ii = 0; ii < radials.length; ii++) {
            points.PushPoint(center.Plus(radials[ii]));
        }
        let mesh = new Mesh(points);
        mesh.Reserve(2 * sampling);
        let shift = 1;
        //Face
        for (let ii = 0; ii < sampling; ii++) {
            mesh.PushFace([0, ii + shift, ((ii + 1) % sampling) + shift]);
        }
        //Strips
        shift += sampling;
        for (let ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii + shift + sampling, ii + shift, ((ii + 1) % sampling) + shift + sampling]);
            mesh.PushFace([ii + shift + sampling, ((ii + 1) % sampling) + shift, ((ii + 1) % sampling) + shift + sampling]);
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    }
    RayIntersection(ray, wrapper) {
        let worldToBase = this.GetWorldToInnerBaseMatrix();
        let innerFrom = Homogeneous.ToVector(worldToBase.Multiply(new HomogeneousPoint(ray.from)));
        let innerDir = Homogeneous.ToVector(worldToBase.Multiply(new HomogeneousVector(ray.dir)));
        //having p[t] = (innerFrom[i]+t*innerDir[i])
        //Solve p[t].x^2+p[t].y^2-(p[t].z * tan(a))^2=0 for each i<3
        let aa = .0;
        let bb = .0;
        let cc = .0;
        let tana = Math.tan(this.angle);
        for (let index = 0; index < 3; index++) {
            let coef = (index == 2) ? (-tana * tana) : 1.0;
            aa += coef * innerDir.Get(index) * innerDir.Get(index);
            bb += coef * 2.0 * innerDir.Get(index) * innerFrom.Get(index);
            cc += coef * innerFrom.Get(index) * innerFrom.Get(index);
        }
        //Solve [t] aa.t^2 + bb.t + cc.t = 0
        let dd = bb * bb - 4.0 * aa * cc;
        let result = new Picking(wrapper);
        let nbResults = 0;
        let height = this.height;
        function acceptValue(value) {
            let point = innerFrom.Plus(innerDir.Times(value));
            if (0 <= point.Get(2) && point.Get(2) <= height) {
                result.Add(value);
                nbResults++;
            }
        }
        if (Math.abs(dd) < 0.0000001) {
            acceptValue(-bb / 2.0 * aa);
        }
        else if (dd > 0.) {
            acceptValue((-bb + Math.sqrt(dd)) / (2.0 * aa));
            acceptValue((-bb - Math.sqrt(dd)) / (2.0 * aa));
        }
        if (nbResults < 2 && Math.abs(innerDir.Get(2)) > 0.000001) {
            let radius = tana * height;
            //test bounding disks
            //solve [t] : p[t].z = this.height
            let value = (this.height - innerFrom.Get(2)) / innerDir.Get(2);
            let point = innerFrom.Plus(innerDir.Times(value));
            if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (radius * radius)) {
                result.Add(value);
            }
        }
        return result;
    }
    Distance(point) {
        let delta = point.Minus(this.apex);
        let dist = delta.Norm();
        let beyondApex = (delta.Dot(this.axis)) < (-Math.sin(this.angle) * dist);
        if (beyondApex) {
            return dist;
        }
        else {
            return (Math.cos(this.angle) * delta.Cross(this.axis).Norm()) - (Math.sin(this.angle) * delta.Dot(this.axis));
        }
    }
    ComputeBounds(points) {
        let max = 0;
        for (let ii = 0; ii < points.Size(); ii++) {
            let d = points.GetPoint(ii).Minus(this.apex).Dot(this.axis);
            if (ii == 0 || d > max) {
                max = d;
            }
        }
        this.height = max;
    }
    static InitialGuessForFitting(cloud) {
        let gsphere = new GaussianSphere(cloud);
        let plane = Geometry.PlaneFitting(gsphere);
        let planeheight = plane.center.Norm();
        let angle = Math.asin(planeheight);
        let size = cloud.Size();
        let planes = new Array(size);
        for (let index = 0; index < size; index++) {
            planes[index] = new PlaneFittingResult(cloud.GetPoint(index), gsphere.GetPoint(index));
        }
        let apex = Geometry.PlanesIntersection(planes);
        //Handle axis orientation : make it point to he cloud centroid ... otherwise, we could face ill-conditionned matrices during the fitting step
        let delta = Geometry.Centroid(cloud).Minus(apex);
        if (plane.normal.Dot(delta) < 0) {
            plane.normal = plane.normal.Times(-1);
        }
        return new Cone(apex, plane.normal, angle, 0);
    }
    FitToPoints(points) {
        let self = this;
        let lsFitting = new LeastSquaresFitting(ConeFitting.Parameters(this.apex, this.axis, this.angle), new ConeFitting(this), points, 'Computing best fitting cone');
        lsFitting.SetNext(() => self.FinalizeFitting(points));
        lsFitting.Start();
        return lsFitting;
    }
    FinalizeFitting(points) {
        //Compute actual cone height and axis direction
        let zmax = null;
        let size = points.Size();
        for (let index = 0; index < size; index++) {
            let z = points.GetPoint(index).Minus(this.apex).Dot(this.axis);
            if (zmax === null || Math.abs(zmax) < Math.abs(z)) {
                zmax = z;
            }
        }
        if (zmax < 0) {
            this.axis = this.axis.Times(-1);
        }
        this.height = Math.abs(zmax);
    }
}
class ConeFitting {
    constructor(cone) {
        this.cone = cone;
    }
    static Parameters(apex, axis, angle) {
        let theta = Geometry.GetTheta(axis);
        let phi = Geometry.GetPhi(axis);
        let result = apex.Clone().Flatten();
        result.push(theta);
        result.push(phi);
        result.push(angle);
        return result;
    }
    static GetApex(params) {
        return new Vector(params.slice(0, 3));
    }
    static GetAxis(params) {
        return Geometry.GetZAxis(ConeFitting.GetTheta(params), ConeFitting.GetPhi(params));
    }
    static GetTheta(params) {
        return params[3];
    }
    static GetPhi(params) {
        return params[4];
    }
    static GetAngle(params) {
        return params[5];
    }
    static IsBeyondApex(apexToPoint, axis, angle) {
        return (apexToPoint.Dot(axis)) < (-Math.sin(angle) * apexToPoint.Norm());
    }
    Distance(params, point) {
        let apex = ConeFitting.GetApex(params);
        let axis = ConeFitting.GetAxis(params);
        let angle = ConeFitting.GetAngle(params);
        let delta = point.Minus(apex);
        if (ConeFitting.IsBeyondApex(delta, axis, angle)) {
            return delta.Norm();
        }
        else {
            return (Math.cos(angle) * delta.Cross(axis).Norm()) - (Math.sin(angle) * delta.Dot(axis));
        }
    }
    DistanceGradient(params, point) {
        let apex = ConeFitting.GetApex(params);
        let theta = ConeFitting.GetTheta(params);
        let phi = ConeFitting.GetPhi(params);
        let zaxis = Geometry.GetZAxis(theta, phi);
        let angle = ConeFitting.GetAngle(params);
        let delta = point.Minus(apex);
        if (ConeFitting.IsBeyondApex(delta, zaxis, angle)) {
            delta.Normalized();
            let result = delta.Times(-1).Flatten();
            result.push(0);
            result.push(0);
            result.push(0);
            return result;
        }
        else {
            let xaxis = Geometry.GetXAxis(theta, phi);
            let yaxis = Geometry.GetYAxis(theta, phi);
            let ca = Math.cos(angle);
            let sa = Math.sin(angle);
            let ss = delta.Dot(zaxis);
            let cc = delta.Cross(zaxis).Norm();
            let ff = (ca * ss / cc) + sa;
            let ddtheta = -ff * delta.Dot(xaxis);
            let ddphi = -Math.sin(theta) * ff * delta.Dot(yaxis);
            let ddapex = delta.Times(-ca / cc).Plus(zaxis.Times(ff));
            let ddangle = (-sa * cc) - (ca * ss);
            let result = ddapex.Flatten();
            result.push(ddtheta);
            result.push(ddphi);
            result.push(ddangle);
            return result;
        }
    }
    NotifyNewSolution(params) {
        this.cone.apex = ConeFitting.GetApex(params);
        this.cone.axis = ConeFitting.GetAxis(params);
        this.cone.angle = ConeFitting.GetAngle(params);
    }
}
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/cone.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
class PCLCone extends PCLShape {
    constructor(cone) {
        super(NameProvider.GetName('Cone'), cone);
        this.cone = cone;
    }
    GetShape() {
        return this.cone;
    }
    GetGeometry() {
        let self = this;
        let geometry = new Properties();
        geometry.Push(new VectorProperty('Apex', () => self.cone.apex, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', () => self.cone.axis, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Angle', () => Geometry.RadianToDegree(self.cone.angle), self.GeometryChangeHandler((value) => self.cone.angle = Geometry.DegreeToRadian(value))));
        geometry.Push(new NumberProperty('Height', () => self.cone.height, self.GeometryChangeHandler((value) => self.cone.height = value)));
        return geometry;
    }
    GetSerializationID() {
        return PCLCone.SerializationID;
    }
    SerializePrimitive(serializer) {
        let cone = this.cone;
        serializer.PushParameter('apex', (s) => {
            s.PushFloat32(cone.apex.Get(0));
            s.PushFloat32(cone.apex.Get(1));
            s.PushFloat32(cone.apex.Get(2));
        });
        serializer.PushParameter('axis', (s) => {
            s.PushFloat32(cone.axis.Get(0));
            s.PushFloat32(cone.axis.Get(1));
            s.PushFloat32(cone.axis.Get(2));
        });
        serializer.PushParameter('angle', (s) => {
            s.PushFloat32(cone.angle);
        });
        serializer.PushParameter('height', (s) => {
            s.PushFloat32(cone.height);
        });
    }
    GetParsingHandler() {
        return new PCLConeParsingHandler();
    }
}
PCLCone.SerializationID = 'CONE';
class PCLConeParsingHandler extends PCLPrimitiveParsingHandler {
    constructor() {
        super();
    }
    ProcessPrimitiveParam(paramname, parser) {
        switch (paramname) {
            case 'apex':
                this.apex = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'axis':
                this.axis = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'angle':
                this.angle = parser.reader.GetNextFloat32();
                return true;
            case 'height':
                this.height = parser.reader.GetNextFloat32();
                return true;
        }
        return false;
    }
    FinalizePrimitive() {
        let cone = new Cone(this.apex, this.axis, this.angle, this.height);
        return new PCLCone(cone);
    }
}
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
class Torus extends Shape {
    constructor(center, axis, greatRadius, smallRadius) {
        super();
        this.center = center;
        this.axis = axis;
        this.greatRadius = greatRadius;
        this.smallRadius = smallRadius;
    }
    ComputeMesh(sampling, onDone) {
        let points = new PointCloud();
        points.Reserve(sampling * sampling);
        let xx = this.axis.GetOrthogonnal();
        let yy = this.axis.Cross(xx).Normalized();
        for (let ii = 0; ii < sampling; ii++) {
            let phi = 2.0 * ii * Math.PI / sampling;
            let c = Math.cos(phi);
            let s = Math.sin(phi);
            let radiusVect = xx.Times(c).Plus(yy.Times(s));
            let faceCenter = this.center.Plus(radiusVect.Times(this.greatRadius));
            for (let jj = 0; jj < sampling; jj++) {
                let theta = 2.0 * jj * Math.PI / sampling;
                let ct = Math.cos(theta);
                let st = Math.sin(theta);
                points.PushPoint(faceCenter.Plus(radiusVect.Times(this.smallRadius * ct)).Plus(this.axis.Times(this.smallRadius * st)));
            }
        }
        let mesh = new Mesh(points);
        mesh.Reserve(2 * sampling * sampling);
        for (let ii = 0; ii < sampling; ii++) {
            let ia = ii * sampling;
            let ib = ((ii + 1) % sampling) * sampling;
            for (let jj = 0; jj < sampling; jj++) {
                let ja = jj;
                let jb = ((jj + 1) % sampling);
                //            [ia]        [ib]
                //   [ja] ---- aa -------- ba
                //             |           |
                //   [jb] ---- ab -------- bb
                let aa = ia + ja;
                let ab = ia + jb;
                let bb = ib + jb;
                let ba = ib + ja;
                mesh.PushFace([ab, aa, ba]);
                mesh.PushFace([ab, ba, bb]);
            }
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    }
    ComputeBoundingBox() {
        let proj = new Vector([this.axis.Get(0), this.axis.Get(1)]);
        let size = new Vector([
            Math.sqrt(1 - (this.axis.Get(0) * this.axis.Get(0))) * this.greatRadius + this.smallRadius,
            Math.sqrt(1 - (this.axis.Get(1) * this.axis.Get(1))) * this.greatRadius + this.smallRadius,
            proj.Norm() * this.greatRadius + this.smallRadius
        ]);
        let bb = new BoundingBox();
        bb.Set(this.center, size.Times(2.0));
        return bb;
    }
    GetWorldToInnerBaseMatrix() {
        let translation = Matrix.Identity(4);
        let basechange = Matrix.Identity(4);
        let xx = this.axis.GetOrthogonnal();
        let yy = this.axis.Cross(xx).Normalized();
        for (let index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.axis.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    }
    RayIntersection(ray, wrapper) {
        let worldToBase = this.GetWorldToInnerBaseMatrix();
        let innerFromMatrix = worldToBase.Multiply(new HomogeneousPoint(ray.from));
        let innerDirMatrix = worldToBase.Multiply(new HomogeneousVector(ray.dir));
        let innerDir = new Vector([innerDirMatrix.GetValue(0, 0), innerDirMatrix.GetValue(1, 0), innerDirMatrix.GetValue(2, 0)]);
        let innerFrom = new Vector([innerFromMatrix.GetValue(0, 0), innerFromMatrix.GetValue(1, 0), innerFromMatrix.GetValue(2, 0)]);
        let grr = this.greatRadius * this.greatRadius;
        let srr = this.smallRadius * this.smallRadius;
        let alpha = innerDir.Dot(innerDir);
        let beta = 2.0 * innerDir.Dot(innerFrom);
        let gamma = innerFrom.Dot(innerFrom) + grr - srr;
        innerDir.Set(2, 0);
        innerFrom.Set(2, 0);
        let eta = innerDir.Dot(innerDir);
        let mu = 2.0 * innerDir.Dot(innerFrom);
        let nu = innerFrom.Dot(innerFrom);
        //Quartic defining the equation of the torus
        let quartic = new Polynomial([
            (gamma * gamma) - (4.0 * grr * nu),
            (2.0 * beta * gamma) - (4.0 * grr * mu),
            (beta * beta) + (2.0 * alpha * gamma) - (4.0 * grr * eta),
            2.0 * alpha * beta,
            alpha * alpha
        ]);
        let init = this.GetBoundingBox().RayIntersection(ray);
        let roots = quartic.FindRealRoots(init.distance);
        let result = new Picking(wrapper);
        for (let index = 0; index < roots.length; index++) {
            result.Add(roots[index]);
        }
        return result;
    }
    Distance(point) {
        let d = point.Minus(this.center);
        let aa = this.greatRadius - this.axis.Cross(d).Norm();
        let bb = this.axis.Dot(d);
        return Math.abs(Math.sqrt(aa * aa + bb * bb) - this.smallRadius);
    }
    ApplyTransform(transform) {
        this.axis = transform.TransformVector(this.axis).Normalized();
        this.center = transform.TransformPoint(this.center);
        this.greatRadius *= transform.scalefactor;
        this.smallRadius *= transform.scalefactor;
    }
    ComputeBounds(points) {
        //NA
    }
    static InitialGuessForFitting(cloud) {
        const nbSeeds = 32;
        let seeds = cloud.Sample(nbSeeds);
        let split = [];
        let nbNeighours = Math.max(Math.floor(cloud.Size() / seeds.Size()), 150);
        for (let index = 0; index < seeds.Size(); index++) {
            let neighbours = cloud.KNearestNeighbours(seeds.GetPoint(index), nbNeighours);
            split.push(neighbours.AsSubCloud());
        }
        ;
        // Fit a rough cylinder in each octant
        let cylinders = [];
        for (let index = 0; index < split.length; index++) {
            if (split[index].Size() < 10)
                continue;
            let localCloud = split[index].ToPointCloud();
            let localCylinder = Cylinder.InitialGuessForFitting(localCloud);
            localCylinder.ComputeBounds(localCloud);
            cylinders.push(localCylinder);
        }
        if (cylinders.length < 3)
            return null;
        // Guess the parameters from the rough cylinders
        let cylindersAxes = new PointCloud;
        let smallRadius = 0;
        for (let index = 0; index < cylinders.length; index++) {
            cylindersAxes.PushPoint(cylinders[index].axis);
            smallRadius += cylinders[index].radius;
        }
        smallRadius /= cylinders.length;
        let axis = Geometry.PlaneFitting(cylindersAxes).normal;
        let cylindersPlanes = [];
        let cylindersCenter = new Vector([0, 0, 0]);
        for (let index = 0; index < cylinders.length; index++) {
            cylindersPlanes.push(new PlaneFittingResult(cylinders[index].center, cylinders[index].axis));
            cylindersCenter.Add(cylinders[index].center.Times(1.0 / cylinders.length));
        }
        cylindersPlanes.push(new PlaneFittingResult(cylindersCenter, axis));
        let center = Geometry.PlanesIntersection(cylindersPlanes);
        let greatRadius = 0;
        for (let index = 0; index < cylinders.length; index++)
            greatRadius += center.Minus(cylinders[index].center).Norm();
        greatRadius /= cylinders.length;
        return new Torus(center, axis, greatRadius, smallRadius);
    }
    FitToPoints(points) {
        let lsFitting = new LeastSquaresFitting(TorusFitting.Parameters(this.center, this.axis, this.smallRadius, this.greatRadius), new TorusFitting(this), points, 'Computing best fitting torus');
        lsFitting.Start();
        return lsFitting;
    }
}
class TorusFitting {
    constructor(torus) {
        this.torus = torus;
    }
    static Parameters(center, axis, smallRadius, greatRadius) {
        let spherical = Vector.CartesianToSpherical(axis).Normalized();
        let params = center.coordinates.slice();
        params.push(spherical.Get(0));
        params.push(spherical.Get(1));
        params.push(smallRadius);
        params.push(greatRadius);
        return params;
    }
    static GetCenter(params) {
        return new Vector(params.slice(0, 3));
    }
    static GetPhi(params) {
        return params[3];
    }
    static GetTheta(params) {
        return params[4];
    }
    static GetAxis(params) {
        let spherical = Vector.Spherical(TorusFitting.GetPhi(params), TorusFitting.GetTheta(params), 1);
        return Vector.SphericalToCartesian(spherical);
    }
    static GetSmallRadius(params) {
        return params[5];
    }
    static GetGreatRadius(params) {
        return params[6];
    }
    Distance(params, point) {
        let axis = TorusFitting.GetAxis(params).Normalized();
        let delta = point.Minus(TorusFitting.GetCenter(params));
        let vect2D = new Vector([
            TorusFitting.GetGreatRadius(params) - axis.Cross(delta).Norm(),
            axis.Dot(delta)
        ]);
        return vect2D.Norm() - TorusFitting.GetSmallRadius(params);
    }
    DistanceGradient(params, point) {
        let delta = point.Minus(TorusFitting.GetCenter(params));
        let theta = TorusFitting.GetTheta(params);
        let phi = TorusFitting.GetPhi(params);
        let radius = TorusFitting.GetGreatRadius(params);
        let spherical = Vector.Spherical(phi, theta, 1);
        let uu = Vector.SphericalToCartesian(spherical, SphericalRepresentation.AzimuthColatitude);
        let vv = Vector.SphericalToCartesian(spherical, SphericalRepresentation.AzimuthLatitude);
        let ww = uu.Cross(vv);
        let dd = delta.Cross(uu).Norm();
        let ss = Math.sqrt(delta.SqrNorm() + (radius * radius) - (2. * radius * dd));
        let dTheta = radius * delta.Dot(uu) * delta.Dot(vv) / (dd * ss);
        let dPhi = radius * Math.sin(theta) * delta.Dot(uu) * delta.Dot(ww) / (dd * ss);
        let dRadius = (radius - dd) / ss;
        let dCenter = delta.Minus(delta.Minus(uu.Times(delta.Dot(uu))).Times(radius / dd)).Times(-1. / ss);
        let gradient = dCenter.coordinates.slice();
        gradient.push(dPhi);
        gradient.push(dTheta);
        gradient.push(-1);
        gradient.push(dRadius);
        return gradient;
    }
    NotifyNewSolution(params) {
        this.torus.center = TorusFitting.GetCenter(params);
        this.torus.axis = TorusFitting.GetAxis(params).Normalized();
        this.torus.smallRadius = TorusFitting.GetSmallRadius(params);
        this.torus.greatRadius = TorusFitting.GetGreatRadius(params);
    }
}
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/torus.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
class PCLTorus extends PCLShape {
    constructor(torus) {
        super(NameProvider.GetName('Torus'), torus);
        this.torus = torus;
    }
    GetShape() {
        return this.torus;
    }
    GetGeometry() {
        let self = this;
        let geometry = new Properties();
        geometry.Push(new VectorProperty('Center', () => self.torus.center, false, this.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', () => self.torus.axis, true, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Great Radius', () => self.torus.greatRadius, this.GeometryChangeHandler((value) => self.torus.greatRadius = value)));
        geometry.Push(new NumberProperty('Small Radius', () => self.torus.smallRadius, this.GeometryChangeHandler((value) => self.torus.smallRadius = value)));
        return geometry;
    }
    GetSerializationID() {
        return PCLTorus.SerializationID;
    }
    SerializePrimitive(serializer) {
        let torus = this.torus;
        serializer.PushParameter('center', (s) => {
            s.PushFloat32(torus.center.Get(0));
            s.PushFloat32(torus.center.Get(1));
            s.PushFloat32(torus.center.Get(2));
        });
        serializer.PushParameter('axis', (s) => {
            s.PushFloat32(torus.axis.Get(0));
            s.PushFloat32(torus.axis.Get(1));
            s.PushFloat32(torus.axis.Get(2));
        });
        serializer.PushParameter('smallradius', (s) => {
            s.PushFloat32(torus.smallRadius);
        });
        serializer.PushParameter('greatradius', (s) => {
            s.PushFloat32(torus.greatRadius);
        });
    }
    GetParsingHandler() {
        return new PCLTorusParsingHandler();
    }
}
PCLTorus.SerializationID = 'TORUS';
class PCLTorusParsingHandler extends PCLPrimitiveParsingHandler {
    constructor() {
        super();
    }
    ProcessPrimitiveParam(paramname, parser) {
        switch (paramname) {
            case 'center':
                this.center = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'axis':
                this.axis = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'greatradius':
                this.greatradius = parser.reader.GetNextFloat32();
                return true;
            case 'smallradius':
                this.smallradius = parser.reader.GetNextFloat32();
                return true;
        }
        return false;
    }
    FinalizePrimitive() {
        let torus = new Torus(this.center, this.axis, this.greatradius, this.smallradius);
        return new PCLTorus(torus);
    }
}
/// <reference path="delegate.ts" />
/// <reference path="../../gui/objects/pclnode.ts" />
/// <reference path="../../gui/controls/dialog.ts" />
class ScanFromCurrentViewPointAction extends Action {
    constructor(group, deletgate) {
        super('Scan from current viewpoint', 'Create an new point cloud by simulating a LIDAR scanning of the group contents, from the current view point');
        this.group = group;
        this.deletgate = deletgate;
    }
    Enabled() {
        return this.group.IsScannable();
    }
    Trigger() {
        let self = this;
        let dialog = new Dialog(
        //Ok has been clicked
        (properties) => {
            return self.LaunchScan(properties);
        }, 
        //Cancel has been clicked
        () => true);
        dialog.InsertValue(ScanFromCurrentViewPointAction.hSamplingTitle, 500);
        dialog.InsertValue(ScanFromCurrentViewPointAction.vSamplingTitle, 500);
        dialog.InsertValue(ScanFromCurrentViewPointAction.Noise, 0);
    }
    LaunchScan(properties) {
        let hsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.hSamplingTitle));
        let vsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.vSamplingTitle));
        let noise = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.Noise));
        if (isNaN(hsampling) || isNaN(vsampling) || isNaN(noise) || hsampling < 0 || vsampling < 0 || noise < 0 || noise > 100) {
            return false;
        }
        this.deletgate.ScanFromCurrentViewPoint(this.group, hsampling, vsampling, noise / 100);
        return true;
    }
}
ScanFromCurrentViewPointAction.hSamplingTitle = 'Horizontal Sampling';
ScanFromCurrentViewPointAction.vSamplingTitle = 'Vertical Sampling';
ScanFromCurrentViewPointAction.Noise = 'Noise (% of time flight)';
/// <reference path="pclnode.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="pclshape.ts" />
/// <reference path="pclplane.ts" />
/// <reference path="pclsphere.ts" />
/// <reference path="pclcylinder.ts" />
/// <reference path="pclcone.ts" />
/// <reference path="pcltorus.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../../controler/actions/scanfromcurrentviewpoint.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../files/pclserializer.ts" />
class PCLGroup extends PCLNode {
    constructor(name, supportsPrimitivesCreation = true) {
        super(name);
        this.supportsPrimitivesCreation = supportsPrimitivesCreation;
        this.children = [];
        this.folded = true;
    }
    SetFolding(f) {
        let changed = f !== this.folded;
        this.folded = f;
        if (changed) {
            this.NotifyChange(this, ChangeType.Folding);
        }
    }
    ToggleFolding() {
        this.SetFolding(!this.folded);
    }
    DrawNode(drawingContext) {
        if (this.visible) {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index].Draw(drawingContext);
            }
        }
    }
    RayIntersection(ray) {
        let picked = null;
        for (var index = 0; index < this.children.length; index++) {
            if (this.children[index].visible) {
                let intersection = this.children[index].RayIntersection(ray);
                if (picked == null || (intersection && intersection.Compare(picked) < 0)) {
                    picked = intersection;
                }
            }
        }
        return picked;
    }
    GetDistance(p) {
        let dist = null;
        for (let index = 0; index < this.children.length; index++) {
            let d = this.children[index].GetDistance(p);
            if (dist == null || d < dist) {
                dist = d;
            }
        }
        return dist;
    }
    Add(son) {
        if (son.owner) {
            son.owner.Remove(son);
        }
        son.owner = this;
        this.children.push(son);
        this.NotifyChange(this, ChangeType.Children | ChangeType.Properties);
    }
    Insert(node, refnode, mode) {
        if (node.owner) {
            node.owner.Remove(node);
        }
        node.owner = this;
        let index = this.children.indexOf(refnode);
        this.children.splice(mode == PCLInsertionMode.Before ? index : (index + 1), 0, node);
        this.NotifyChange(this, ChangeType.Children | ChangeType.Properties);
    }
    Remove(son) {
        let position = -1;
        for (var index = 0; position < 0 && index < this.children.length; index++) {
            if (this.children[index] === son) {
                position = index;
            }
        }
        if (position >= 0) {
            son.owner = null;
            this.children.splice(position, 1);
            this.NotifyChange(this, ChangeType.Children | ChangeType.Display | ChangeType.Properties);
        }
    }
    GetBoundingBox() {
        let boundingbox = new BoundingBox();
        for (var index = 0; index < this.children.length; index++) {
            let bb = this.children[index].GetBoundingBox();
            if (bb && bb.IsValid()) {
                boundingbox.Add(bb.min);
                boundingbox.Add(bb.max);
            }
        }
        return boundingbox;
    }
    Apply(proc) {
        if (!super.Apply(proc)) {
            return false;
        }
        for (var index = 0; index < this.children.length; index++) {
            if (this.children[index].Apply(proc) === false) {
                return false;
            }
        }
        return true;
    }
    GetChildren() {
        return this.children;
    }
    GetActions(delegate) {
        let self = this;
        let result = super.GetActions(delegate);
        result.push(null);
        if (this.folded) {
            result.push(new SimpleAction('Unfold', () => {
                self.folded = false;
                self.NotifyChange(self, ChangeType.Folding);
            }));
        }
        else {
            result.push(new SimpleAction('Fold', () => {
                self.folded = true;
                self.NotifyChange(self, ChangeType.Folding);
            }));
        }
        if (this.supportsPrimitivesCreation) {
            result.push(null);
            result.push(new SimpleAction('New group', this.WrapNodeCreator(this.GetGroupCreator()), 'A group is a hiearchical item that can be used to organize objects.'));
            result.push(new SimpleAction('New plane', this.WrapNodeCreator(this.GetPlaneCreator())));
            result.push(new SimpleAction('New sphere', this.WrapNodeCreator(this.GetSphereCreator())));
            result.push(new SimpleAction('New cylinder', this.WrapNodeCreator(this.GetCylinderCreator())));
            result.push(new SimpleAction('New cone', this.WrapNodeCreator(this.GetConeCreator())));
            result.push(new SimpleAction('New torus', this.WrapNodeCreator(this.GetTorusCreator())));
            result.push(new ScanFromCurrentViewPointAction(this, delegate));
        }
        return result;
    }
    FillProperties() {
        if (this.properties) {
            let self = this;
            let children = new NumberProperty('Children', () => self.children.length, null);
            children.SetReadonly();
            this.properties.Push(children);
        }
    }
    WrapNodeCreator(creator) {
        let self = this;
        return () => {
            let node = creator();
            self.Add(node);
            node.NotifyChange(node, ChangeType.NewItem);
        };
    }
    GetGroupCreator() {
        return () => {
            return new PCLGroup(NameProvider.GetName('Group'));
        };
    }
    GetPlaneCreator() {
        return () => {
            let plane = new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1);
            return new PCLPlane(plane);
        };
    }
    GetSphereCreator() {
        return () => {
            let sphere = new Sphere(new Vector([0, 0, 0]), 1);
            return new PCLSphere(sphere);
        };
    }
    GetCylinderCreator() {
        return () => {
            let cylinder = new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1);
            return new PCLCylinder(cylinder);
        };
    }
    GetConeCreator() {
        return () => {
            let cone = new Cone(new Vector([0, 0, 0]), new Vector([0, 0, 1]), Math.PI / 6.0, 1);
            return new PCLCone(cone);
        };
    }
    GetTorusCreator() {
        return () => {
            let torus = new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1);
            return new PCLTorus(torus);
        };
    }
    IsScannable() {
        return !this.Apply((p) => !(p instanceof PCLShape || p instanceof PCLMesh));
    }
    GetDisplayIcon() {
        return 'fa-folder' + (this.folded ? '' : '-open');
    }
    GetSerializationID() {
        return PCLGroup.SerializationID;
    }
    SerializeNode(serializer) {
        let self = this;
        if (!this.supportsPrimitivesCreation) {
            serializer.PushParameter('noprimitives');
        }
        for (let index = 0; index < this.children.length; index++) {
            serializer.PushParameter('child', () => {
                self.children[index].Serialize(serializer);
            });
        }
    }
    GetParsingHandler() {
        return new PCLGroupParsingHandler();
    }
}
PCLGroup.SerializationID = 'GROUP';
class PCLGroupParsingHandler extends PCLNodeParsingHandler {
    constructor() {
        super();
        this.children = [];
    }
    ProcessNodeParam(paramname, parser) {
        switch (paramname) {
            case 'noprimitives':
                this.noprimitives = true;
                return true;
            case 'child':
                let child = parser.ProcessNextObject();
                if (!(child instanceof PCLNode)) {
                    throw 'group children are expected to be valid nodes';
                }
                if (child) {
                    this.children.push(child);
                }
                return true;
        }
        return false;
    }
    GetObject() {
        return new PCLGroup(this.name, !this.noprimitives);
    }
    FinalizeNode() {
        let group = this.GetObject();
        for (let index = 0; index < this.children.length; index++) {
            group.Add(this.children[index]);
        }
        return group;
    }
}
/// <reference path="../../gui/objects/pclgroup.ts" />
class ScalarField {
    constructor(values) {
        this.values = values || new Float32Array([]);
        this.nbvalues = this.values.length;
        this.min = null;
        this.max = null;
    }
    Reserve(capacity) {
        if (capacity > this.nbvalues) {
            let values = new Float32Array(capacity);
            for (let index = 0; index < this.nbvalues; index++) {
                values[index] = this.values[index];
            }
            this.values = values;
        }
    }
    GetValue(index) {
        return this.values[index];
    }
    SetValue(index, value) {
        this.values[index] = value;
        if (this.min === null || value < this.min) {
            this.min = value;
        }
        if (this.max === null || value > this.max) {
            this.max = value;
        }
    }
    PushValue(value) {
        this.SetValue(this.nbvalues, value);
        this.nbvalues++;
    }
    Size() {
        return this.nbvalues;
    }
    Min() {
        if (this.min === null) {
            for (let index = 0; index < this.nbvalues; index++) {
                if (this.min === null || this.values[index] < this.min) {
                    this.min = this.values[index];
                }
            }
        }
        return this.min;
    }
    Max() {
        if (this.max === null) {
            for (let index = 0; index < this.nbvalues; index++) {
                if (this.max === null || this.values[index] > this.max) {
                    this.max = this.values[index];
                }
            }
        }
        return this.max;
    }
}
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/geometry.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="shapes/shape.ts" />
/// <reference path="shapes/plane.ts" />
/// <reference path="shapes/sphere.ts" />
/// <reference path="shapes/cylinder.ts" />
/// <reference path="../tools/longprocess.ts" />
class Ransac {
    constructor(cloud, generators = null, nbFailure, noise) {
        this.cloud = cloud;
        this.generators = generators;
        this.nbFailure = nbFailure;
        this.noise = noise;
        this.nbPoints = 3;
        this.ignore = new Array(this.cloud.Size());
        for (let ii = 0; ii < this.cloud.Size(); ii++) {
            this.ignore[ii] = false;
        }
        this.remainingPoints = this.cloud.Size();
    }
    SetGenerators(generators) {
        this.generators = generators;
    }
    IsDone() {
        return this.remainingPoints > 0;
    }
    FindBestFittingShape(onDone) {
        let step = new RansacStepProcessor(this);
        let finalizer = new RansacStepFinalizer(this);
        step.SetNext(finalizer)
            .SetNext((s) => onDone(s.best));
        step.Start();
        return step;
    }
    PickPoints() {
        let points = [];
        while (points.length < this.nbPoints) {
            let index = Math.floor(Math.random() * this.cloud.Size());
            if (!this.ignore[index]) {
                for (let ii = 0; ii < points.length; ii++) {
                    if (index === points[ii].index)
                        index = null;
                }
                if (index != null && index < this.cloud.Size()) {
                    points.push(new PickedPoints(index, this.cloud.GetPoint(index), this.cloud.GetNormal(index)));
                }
            }
        }
        return points;
    }
    GenerateCandidate(points) {
        //Generate a candidate shape
        let candidates = [];
        for (let ii = 0; ii < this.generators.length; ii++) {
            let shape = this.generators[ii](points);
            if (shape != null) {
                candidates.push(new Candidate(shape));
            }
        }
        //Compute scores and keep the best candidate
        let candidate = null;
        for (let ii = 0; ii < candidates.length; ii++) {
            candidates[ii].ComputeScore(this.cloud, this.noise, this.ignore);
            if (candidate == null || candidate.score > candidates[ii].score) {
                candidate = candidates[ii];
            }
        }
        return candidate;
    }
    static RansacPlane(points) {
        let result = new Plane(points[0].point, points[0].normal, 0);
        return result;
    }
    static RansacSphere(points) {
        let r1 = new Ray(points[0].point, points[0].normal);
        let r2 = new Ray(points[1].point, points[1].normal);
        let center = Geometry.LinesIntersection(r1, r2);
        let radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());
        return new Sphere(center, radius);
    }
    static RansacCylinder(points) {
        let r1 = new Ray(points[0].point, points[0].normal);
        let r2 = new Ray(points[1].point, points[1].normal);
        let center = Geometry.LinesIntersection(r1, r2);
        let axis = r1.dir.Cross(r2.dir);
        let radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());
        return new Cylinder(center, axis, radius, 0);
    }
    static RansacCone(points) {
        let axis = points[2].normal.Minus(points[0].normal).Cross(points[1].normal.Minus(points[0].normal));
        axis.Normalize();
        let hh = axis.Dot(points[0].normal);
        let angle = Math.asin(hh);
        let planes = [
            new PlaneFittingResult(points[0].point, points[0].normal),
            new PlaneFittingResult(points[1].point, points[1].normal),
            new PlaneFittingResult(points[2].point, points[2].normal)
        ];
        let apex = Geometry.PlanesIntersection(planes);
        if (axis.Dot(points[0].point.Minus(apex)) < 0) {
            axis = axis.Times(-1);
        }
        return new Cone(apex, axis, angle, 0);
    }
}
class PickedPoints {
    constructor(index, point, normal) {
        this.index = index;
        this.point = point;
        this.normal = normal;
    }
}
class Candidate {
    constructor(shape) {
        this.shape = shape;
    }
    ComputeScore(cloud, noise, ignore) {
        this.score = 0;
        this.points = [];
        //Suboptimal. TODO : use the KDTree to grant fast access to the shapes neighbours
        for (let ii = 0; ii < cloud.Size(); ii++) {
            if (!ignore[ii]) {
                let dist = this.shape.Distance(cloud.GetPoint(ii));
                if (dist > noise) {
                    dist = noise;
                }
                else {
                    this.points.push(ii);
                }
                this.score += dist * dist;
            }
        }
    }
}
class RansacStepProcessor extends LongProcess {
    constructor(ransac) {
        super('Searching for a new shape in the point cloud');
        this.ransac = ransac;
        this.nbTrials = 0;
        this.progress = 0;
    }
    get Done() {
        return this.nbTrials >= this.ransac.nbFailure;
    }
    get Current() {
        return this.progress;
    }
    get Target() {
        return this.ransac.nbFailure;
    }
    Step() {
        let points = this.ransac.PickPoints();
        let candidate = this.ransac.GenerateCandidate(points);
        this.nbTrials++;
        if (this.nbTrials > this.progress) {
            this.progress = this.nbTrials;
        }
        if (candidate != null) {
            if (this.best == null || this.best.score > candidate.score) {
                this.best = candidate;
                this.nbTrials = 0;
            }
        }
    }
}
class RansacStepFinalizer extends Process {
    constructor(ransac) {
        super();
        this.ransac = ransac;
    }
    Initialize(ransacstep) {
        this.best = ransacstep.best;
    }
    Run(ondone) {
        let fitting = this.best.shape.FitToPoints(new PointSubCloud(this.ransac.cloud, this.best.points));
        if (fitting) {
            fitting.SetNext(ondone);
        }
        else {
            ondone();
        }
    }
    Finalize() {
        this.best.ComputeScore(this.ransac.cloud, this.ransac.noise, this.ransac.ignore);
        this.best.shape.ComputeBounds(new PointSubCloud(this.ransac.cloud, this.best.points));
        for (let index = 0; index < this.best.points.length; index++) {
            this.ransac.ignore[this.best.points[index]] = true;
            this.ransac.remainingPoints--;
        }
    }
}
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../../files/pclserializer.ts" />
//=================================================
// The PCLScalar field extends the scalar field by providing
// - a name
// - color settings for display prupose (color scale)
// - a range to be displayed
//=================================================
class PCLScalarField extends ScalarField {
    constructor(name, values) {
        super(values);
        this.name = name;
        this.colormin = [0, 0, 1];
        this.colormax = [1, 0, 0];
        this.displaymin = null;
        this.displaymax = null;
    }
    NotifyChange() {
        if (this.onChange) {
            this.onChange();
        }
    }
    GetDisplayMin() {
        return this.displaymin === null ? this.Min() : this.displaymin;
    }
    SetDisplayMin(v) {
        this.displaymin = v;
        this.NotifyChange();
    }
    GetDisplayMax() {
        return this.displaymax === null ? this.Max() : this.displaymax;
    }
    SetDisplayMax(v) {
        this.displaymax = v;
        this.NotifyChange();
    }
    GetSerializationID() {
        return PCLScalarField.SerializationID;
    }
    SetColorMin(c) {
        this.colormin = c;
        this.NotifyChange();
    }
    SetColorMax(c) {
        this.colormax = c;
        this.NotifyChange();
    }
    Serialize(serializer) {
        serializer.Start(this);
        let self = this;
        serializer.PushParameter('name', (s) => {
            s.PushString(self.name);
        });
        if (this.displaymin) {
            serializer.PushParameter('displaymin', (s) => {
                s.PushFloat32(this.displaymin);
            });
        }
        if (this.displaymax) {
            serializer.PushParameter('displaymax', (s) => {
                s.PushFloat32(this.displaymax);
            });
        }
        serializer.PushParameter('colormin', (s) => {
            s.PushFloat32(this.colormin[0]);
            s.PushFloat32(this.colormin[1]);
            s.PushFloat32(this.colormin[2]);
        });
        serializer.PushParameter('colormax', (s) => {
            s.PushFloat32(this.colormax[0]);
            s.PushFloat32(this.colormax[1]);
            s.PushFloat32(this.colormax[2]);
        });
        serializer.PushParameter('values', (s) => {
            s.PushInt32(self.Size());
            for (let index = 0; index < self.Size(); index++) {
                s.PushFloat32(self.GetValue(index));
            }
        });
        serializer.End(this);
    }
    GetParsingHandler() {
        return new PCLScalarFieldParsingHandler();
    }
}
PCLScalarField.DensityFieldName = 'Density';
PCLScalarField.NoiseFieldName = 'Noise';
PCLScalarField.SerializationID = 'SCALARFIELD';
class PCLScalarFieldParsingHandler {
    constructor() {
    }
    ProcessParam(paramname, parser) {
        switch (paramname) {
            case 'name':
                this.name = parser.GetStringValue();
                return true;
            case 'displaymin':
                this.displaymin = parser.reader.GetNextFloat32();
                return true;
            case 'displaymax':
                this.displaymax = parser.reader.GetNextFloat32();
                return true;
            case 'colormin':
                this.colormin = [
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ];
                return true;
            case 'colormax':
                this.colormax = [
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ];
                return true;
            case 'values':
                let nbvalues = parser.reader.GetNextInt32();
                this.values = new Float32Array(nbvalues);
                for (let index = 0; index < nbvalues; index++) {
                    this.values[index] = parser.reader.GetNextFloat32();
                }
                return true;
        }
        return false;
    }
    Finalize() {
        let scalarfield = new PCLScalarField(this.name, this.values);
        scalarfield.colormin = this.colormin;
        scalarfield.colormax = this.colormax;
        if (this.displaymin) {
            scalarfield.displaymin = this.displaymin;
        }
        if (this.displaymax) {
            scalarfield.displaymax = this.displaymax;
        }
        return scalarfield;
    }
}
/// <reference path="../../model/pointcloud.ts" />
/// <reference path="../../controler/actions/pointcloudactions.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/booleanproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />
/// <reference path="pclscalarfield.ts" />
/// <reference path="../../files/pclserializer.ts" />
//=================================================
// The PCLPointcloud provides an interface to interact with a point cloud
// - Show the point cloud
// - Perform actions on the point cloud
// - Get/set the point cloud properties
//=================================================
class PCLPointCloud extends PCLPrimitive {
    constructor(cloud = null) {
        super(NameProvider.GetName('PointCloud'));
        this.cloud = cloud;
        this.fields = [];
        this.currentfield = null;
        this.drawing = new PointCloudDrawing();
        if (!this.cloud) {
            this.cloud = new PointCloud();
        }
    }
    PushScalarField(field) {
        let self = this;
        this.fields.push(field);
        field.onChange = () => self.NotifyChange(this, ChangeType.Display | ChangeType.ColorScale);
    }
    AddScalarField(name, values = null) {
        let field = new PCLScalarField(name, values);
        if (field.Size() == 0) {
            field.Reserve(this.cloud.Size());
        }
        else if (field.Size() !== this.cloud.Size()) {
            throw 'Cannot bind a scalar field whose size does not match (got: ' + field.Size() + ', expected: ' + this.cloud.Size();
        }
        this.PushScalarField(field);
        this.AddScaralFieldProperty(this.fields.length - 1);
        return field;
    }
    GetDisplayIcon() {
        return 'fa-cloud';
    }
    GetScalarField(name) {
        for (let index = 0; index < this.fields.length; index++) {
            if (this.fields[index].name === name) {
                return this.fields[index];
            }
        }
        return null;
    }
    SetCurrentField(name, disableLighting = true) {
        for (let index = 0; index < this.fields.length; index++) {
            if (this.fields[index].name === name) {
                this.currentfield = index;
                if (disableLighting) {
                    this.lighting = false;
                }
                this.NotifyChange(this, ChangeType.Display | ChangeType.Properties | ChangeType.ColorScale);
                return true;
            }
        }
        this.currentfield = null;
        return false;
    }
    GetCurrentField() {
        if (this.currentfield !== null) {
            return this.fields[this.currentfield];
        }
        return null;
    }
    RayIntersection(ray) {
        let result = this.cloud.RayIntersection(ray);
        result.object = this;
        return result;
    }
    GetDistance(p) {
        return this.cloud.Distance(p);
    }
    GetPrimitiveBoundingBox() {
        return this.cloud.boundingbox;
    }
    GetActions(delegate) {
        let cloud = this;
        let result = super.GetActions(delegate);
        result.push(new ExportPointCloudFileAction(this));
        result.push(null);
        if (this.cloud.HasNormals()) {
            result.push(new ClearNormalsAction(this));
        }
        else {
            result.push(new ComputeNormalsAction(this));
        }
        result.push(new GaussianSphereAction(this));
        result.push(null);
        result.push(new ConnectedComponentsAction(this));
        result.push(new ComputeDensityAction(this));
        result.push(new ComputeNoiseAction(this));
        result.push(null);
        result.push(new RansacDetectionAction(this));
        result.push(new FindBestFittingShapeAction(this));
        return result;
    }
    TransformPrivitive(transform) {
        this.cloud.ApplyTransform(transform);
        this.InvalidateDrawing();
    }
    FillProperties() {
        super.FillProperties();
        if (this.properties) {
            let self = this;
            let points = new NumberProperty('Points', () => self.cloud.Size(), null);
            points.SetReadonly();
            this.properties.Push(points);
            if (this.fields.length) {
                let fieldsProperty = new PropertyGroup(PCLPointCloud.ScalarFieldPropertyName);
                for (let index = 0; index < this.fields.length; index++) {
                    fieldsProperty.Add(this.GetScalarFieldProperty(index));
                }
                this.properties.Push(fieldsProperty);
            }
        }
    }
    AddScaralFieldProperty(index) {
        if (this.properties) {
            let fieldsProperty = this.properties.GetPropertyByName(PCLPointCloud.ScalarFieldPropertyName);
            if (!fieldsProperty) {
                fieldsProperty = new PropertyGroup(PCLPointCloud.ScalarFieldPropertyName);
                this.properties.Push(fieldsProperty);
            }
            fieldsProperty.Add(this.GetScalarFieldProperty(index));
        }
    }
    GetScalarFieldProperty(index) {
        let self = this;
        return new BooleanProperty(this.fields[index].name, () => (index === self.currentfield), (value) => {
            self.currentfield = value ? index : null;
            self.NotifyChange(self, ChangeType.ColorScale);
        });
    }
    DrawPrimitive(drawingContext) {
        let field = this.currentfield !== null ? this.fields[this.currentfield] : null;
        this.drawing.FillBuffers(this.cloud, field, drawingContext);
        this.drawing.BindBuffers(this.lighting, !!field, drawingContext);
        this.drawing.Draw(drawingContext);
    }
    InvalidateDrawing() {
        this.drawing.Clear();
        this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
    }
    GetCSVData() {
        var result = 'x;y;z';
        if (this.cloud.HasNormals()) {
            result += ';nx;ny;nz';
        }
        for (let field = 0; field < this.fields.length; field++) {
            result += ';' + this.fields[field].name.replace(';', '_');
        }
        result += '\n';
        for (let index = 0; index < this.cloud.Size(); index++) {
            let point = this.cloud.GetPoint(index);
            result += point.Get(0) + ';' +
                point.Get(1) + ';' +
                point.Get(2);
            if (this.cloud.HasNormals()) {
                let normal = this.cloud.GetNormal(index);
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
    GetSerializationID() {
        return PCLPointCloud.SerializationID;
    }
    SerializePrimitive(serializer) {
        let self = this;
        serializer.PushParameter('points', (s) => {
            s.PushInt32(self.cloud.pointssize);
            for (let index = 0; index < self.cloud.pointssize; index++) {
                s.PushFloat32(self.cloud.points[index]);
            }
        });
        if (this.cloud.HasNormals()) {
            serializer.PushParameter('normals', (s) => {
                s.PushInt32(self.cloud.normalssize);
                for (let index = 0; index < self.cloud.normalssize; index++) {
                    s.PushFloat32(self.cloud.normals[index]);
                }
            });
        }
        for (let index = 0; index < this.fields.length; index++) {
            serializer.PushParameter('scalarfield', (s) => {
                self.fields[index].Serialize(serializer);
            });
        }
    }
    GetParsingHandler() {
        return new PCLPointCloudParsingHandler();
    }
}
PCLPointCloud.ScalarFieldPropertyName = 'Scalar fields';
PCLPointCloud.SerializationID = 'POINTCLOUD';
class PCLPointCloudParsingHandler extends PCLPrimitiveParsingHandler {
    constructor() {
        super();
        this.fields = [];
    }
    ProcessPrimitiveParam(paramname, parser) {
        switch (paramname) {
            case 'points':
                let nbpoints = parser.reader.GetNextInt32();
                this.points = new Float32Array(nbpoints);
                for (let index = 0; index < nbpoints; index++) {
                    this.points[index] = parser.reader.GetNextFloat32();
                }
                return true;
            case 'normals':
                let nbnormals = parser.reader.GetNextInt32();
                this.normals = new Float32Array(nbnormals);
                for (let index = 0; index < nbnormals; index++) {
                    this.normals[index] = parser.reader.GetNextFloat32();
                }
                return true;
            case 'scalarfield':
                let field = parser.ProcessNextObject();
                if (!(field instanceof PCLScalarField)) {
                    return false;
                }
                this.fields.push(field);
                return true;
        }
        return false;
    }
    FinalizePrimitive() {
        let cloud = new PCLPointCloud(new PointCloud(this.points, this.normals));
        for (let index = 0; index < this.fields.length; index++) {
            cloud.PushScalarField(this.fields[index]);
        }
        return cloud;
    }
}
class PointCloudDrawing {
    constructor() {
        this.glNormalsBuffer = null;
        this.glPointsBuffer = null;
    }
    FillBuffers(cloud, field, ctx) {
        this.cloudsize = cloud.Size();
        if (!this.glPointsBuffer) {
            this.glPointsBuffer = new FloatArrayBuffer(cloud.points, ctx, 3);
        }
        if (cloud.HasNormals() && !this.glNormalsBuffer) {
            this.glNormalsBuffer = new FloatArrayBuffer(cloud.normals, ctx, 3);
        }
        if (field) {
            if (!this.glScalarBuffer || this.bufferedScalarField !== field) {
                this.glScalarBuffer = new FloatArrayBuffer(field.values, ctx, 1);
                this.bufferedScalarField = field;
            }
            ctx.gl.uniform1f(ctx.minscalarvalue, field.GetDisplayMin());
            ctx.gl.uniform1f(ctx.maxscalarvalue, field.GetDisplayMax());
            ctx.gl.uniform3fv(ctx.minscalarcolor, field.colormin);
            ctx.gl.uniform3fv(ctx.maxscalarcolor, field.colormax);
        }
    }
    BindBuffers(uselighting, usescalars, ctx) {
        this.glPointsBuffer.BindAttribute(ctx.vertices);
        if (uselighting && this.glNormalsBuffer) {
            ctx.EnableNormals(true);
            this.glNormalsBuffer.BindAttribute(ctx.normals);
        }
        else {
            ctx.EnableNormals(false);
        }
        if (usescalars && this.glScalarBuffer) {
            ctx.EnableScalars(true);
            this.glScalarBuffer.BindAttribute(ctx.scalarvalue);
        }
        else {
            ctx.EnableScalars(false);
        }
    }
    Draw(ctx) {
        ctx.gl.drawArrays(ctx.gl.POINTS, 0, this.cloudsize);
        ctx.EnableScalars(false);
    }
    Clear() {
        if (this.glPointsBuffer) {
            this.glPointsBuffer.Clear();
            this.glPointsBuffer = null;
        }
        if (this.glNormalsBuffer) {
            this.glNormalsBuffer.Clear();
            this.glNormalsBuffer = null;
        }
        if (this.glScalarBuffer) {
            this.glScalarBuffer.Clear();
            this.glScalarBuffer = null;
        }
    }
}
/// <reference path="pclshape.ts" />
/// <reference path="pclplane.ts" />
/// <reference path="pclsphere.ts" />
/// <reference path="pclcone.ts" />
/// <reference path="pclcylinder.ts" />
/// <reference path="pcltorus.ts" />
/// <reference path="../../model/shapes/plane.ts" />
/// <reference path="../../model/shapes/sphere.ts" />
/// <reference path="../../model/shapes/cone.ts" />
/// <reference path="../../model/shapes/cylinder.ts" />
/// <reference path="../../model/shapes/torus.ts" />
class PCLShapeWrapper {
    constructor(shape) {
        this.shape = shape;
    }
    GetPCLShape() {
        let result;
        if (this.shape instanceof Plane) {
            result = new PCLPlane(this.shape);
        }
        else if (this.shape instanceof Sphere) {
            result = new PCLSphere(this.shape);
        }
        else if (this.shape instanceof Cone) {
            result = new PCLCone(this.shape);
        }
        else if (this.shape instanceof Cylinder) {
            result = new PCLCylinder(this.shape);
        }
        else if (this.shape instanceof Torus) {
            result = new PCLTorus(this.shape);
        }
        else {
            throw 'PCL Shapes wrapping error : Cannot handle "' + (typeof this.shape) + '" as a valid shape type';
        }
        return result;
    }
}
class FileExporter {
    static ExportFile(filename, filecontent, filetype) {
        let link = document.createElement('a');
        link.onclick = function () {
            var url = window.URL;
            var blob = new Blob([filecontent], { type: filetype });
            link.href = url.createObjectURL(blob);
            link.target = '_blank';
            link.download = filename;
            if (link.parentElement) {
                link.parentElement.removeChild(link);
            }
        };
        link.click();
    }
}
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
class PCLCloudAction extends Action {
    constructor(cloud, message, hint = null) {
        super(message, hint);
        this.cloud = cloud;
    }
    GetPCLCloud() {
        return this.cloud;
    }
    GetCloud() {
        return this.GetPCLCloud().cloud;
    }
}
//===================================================
// Generic cloud process
//===================================================
class CloudProcess extends IterativeLongProcess {
    constructor(cloud, message) {
        super(cloud.Size(), message);
        this.cloud = cloud;
    }
    GetResult() {
        return null;
    }
}
//===================================================
// Shapes detection
//===================================================
class RansacDetectionAction extends PCLCloudAction {
    constructor(cloud) {
        super(cloud, 'Detect shapes ...', 'Try to detect as many shapes as possible in the selected point cloud (using the RANSAC algorithm)');
    }
    Enabled() {
        return this.GetCloud().HasNormals();
    }
    Trigger() {
        let self = this;
        var dialog = new Dialog((d) => { return self.InitializeAndLauchRansac(d); }, (d) => { return true; });
        dialog.InsertValue('Failures', 100);
        dialog.InsertValue('Noise', 0.1);
        dialog.InsertTitle('Shapes to detect');
        dialog.InsertCheckBox('Planes', true);
        dialog.InsertCheckBox('Spheres', true);
        dialog.InsertCheckBox('Cylinders', true);
        dialog.InsertCheckBox('Cones', true);
    }
    InitializeAndLauchRansac(properties) {
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
    Stopable() {
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
        let done = target - this.ransac.remainingPoints;
        this.progress.Update(done, target);
        if (this.ransac.remainingPoints > this.ransac.nbPoints && !this.stoped) {
            setTimeout(() => {
                self.pendingstep = self.ransac.FindBestFittingShape((s) => self.HandleResult(s));
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
    HandleResult(candidate) {
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
    constructor(cloud) {
        this.cloud = cloud;
        this.shapes = [];
        this.errors = [];
    }
    AddFittingResult(shape) {
        let error = 0;
        let size = this.cloud.Size();
        for (let index = 0; index < size; index++) {
            error += shape.Distance(this.cloud.GetPoint(index)) ** 2;
        }
        error /= size;
        this.shapes.push(shape);
        this.errors.push(error);
    }
    GetBestShape() {
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
    ShowResult(bestShapeIndex) {
        let message = 'Shapes fitting results :\n';
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
    constructor(cloud) {
        super(cloud, 'Find the best fitting shape ...', 'Compute the shape (plane, sphere, cylinder, cone) that best fits the whole selected point cloud (assuming the point cloud samples a single shape)');
    }
    Enabled() {
        return true;
    }
    Trigger() {
        let self = this;
        var dialog = new Dialog((d) => { return self.ComputeBestFittingShape(d); }, (d) => { return true; });
        dialog.InsertTitle('Shapes to be tested');
        dialog.InsertCheckBox('Plane', true);
        dialog.InsertCheckBox('Sphere', true);
        dialog.InsertCheckBox('Cylinder', true);
        dialog.InsertCheckBox('Cone', true);
        dialog.InsertCheckBox('Torus', true);
    }
    ComputeBestFittingShape(properties) {
        let cloud = this.GetCloud();
        this.results = new ShapeFittingResult(cloud);
        let fittingProcesses = [];
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
class LSFittingProcess extends Process {
    constructor(fittingResult) {
        super();
        this.fittingResult = fittingResult;
    }
    Run(ondone) {
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
}
class PlaneFittingProcess extends LSFittingProcess {
    constructor(fittingResult) {
        super(fittingResult);
    }
    GetInitialGuess() {
        return new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 0);
    }
}
class SphereFittingProcess extends LSFittingProcess {
    constructor(fittingResult) {
        super(fittingResult);
    }
    GetInitialGuess(cloud) {
        return Sphere.InitialGuessForFitting(cloud);
    }
}
class CylinderFittingProcess extends LSFittingProcess {
    constructor(fittingResult) {
        super(fittingResult);
    }
    GetInitialGuess(cloud) {
        return Cylinder.InitialGuessForFitting(cloud);
    }
}
class ConeFittingProcess extends LSFittingProcess {
    constructor(fittingResult) {
        super(fittingResult);
    }
    GetInitialGuess(cloud) {
        return Cone.InitialGuessForFitting(cloud);
    }
}
class TorusFittingProcess extends LSFittingProcess {
    constructor(fittingResult) {
        super(fittingResult);
    }
    GetInitialGuess(cloud) {
        return Torus.InitialGuessForFitting(cloud);
    }
}
//===================================================
// Normals computation
//===================================================
class ComputeNormalsAction extends PCLCloudAction {
    constructor(cloud) {
        super(cloud, 'Compute normals', 'Compute the vectors normal to the surface sampled by this point cloud');
    }
    Enabled() {
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
    constructor(cloud, k) {
        super(cloud.Size(), 'Computing normals (' + cloud.Size() + ' data points)');
        this.cloud = cloud;
        this.k = k;
    }
    Initialize() {
        if (this.cloud.normals.length != this.cloud.points.length) {
            this.cloud.normals = new Float32Array(this.cloud.points.length);
        }
        this.cloud.ClearNormals();
    }
    Iterate(step) {
        var normal = this.cloud.ComputeNormal(step, this.k);
        this.cloud.PushNormal(normal);
    }
}
;
class NormalsHarmonizer extends RegionGrowthProcess {
    constructor(cloud, k) {
        super(cloud, k, 'Harmonizing normals (' + cloud.Size() + ' data points)');
    }
    ProcessPoint(cloud, index, knn, region) {
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
}
;
class ClearNormalsAction extends PCLCloudAction {
    constructor(cloud) {
        super(cloud, 'Clear normals', 'Clear previously computed normals');
    }
    Enabled() {
        return this.GetCloud().HasNormals();
    }
    Trigger() {
        this.GetCloud().ClearNormals();
        this.GetPCLCloud().InvalidateDrawing();
    }
}
class GaussianSphereAction extends PCLCloudAction {
    constructor(cloud) {
        super(cloud, 'Extract the gaussian sphere', 'Builds a new point cloud made of the point cloud normals. The resulting point cloud will sample the unit sphere (since normals are unit vectors) - hence the name.');
    }
    Enabled() {
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
    constructor(cloud) {
        super(cloud, 'Compute connected components', 'Split the point cloud into connected subsets');
    }
    Enabled() {
        return true;
    }
    Trigger() {
        let k = 30;
        let self = this;
        let ondone = (b) => self.GetPCLCloud().NotifyChange(b.result, ChangeType.NewItem);
        let builder = new ConnecterComponentsBuilder(this.GetCloud(), k, this.GetPCLCloud().name);
        builder.SetNext(ondone);
        builder.Start();
    }
}
class ConnecterComponentsBuilder extends RegionGrowthProcess {
    constructor(cloud, k, prefix) {
        super(cloud, k, 'Computing connected components');
        this.result = new PCLGroup(prefix + ' - connected components');
    }
    ProcessPoint(cloud, index, knn, region) {
        if (region >= this.result.children.length)
            this.result.Add(new PCLPointCloud());
        let component = this.result.children[region].cloud;
        component.PushPoint(cloud.GetPoint(index));
        if (cloud.HasNormals())
            component.PushNormal(cloud.GetNormal(index));
    }
}
//===================================================
// Density
//===================================================
class ComputeDensityAction extends PCLCloudAction {
    constructor(cloud) {
        super(cloud, 'Compute density', 'Estimate the points density at each point of the cloud, and assign the corresponding scalar field');
    }
    Enabled() {
        return !this.GetPCLCloud().GetScalarField(PCLScalarField.DensityFieldName);
    }
    Trigger() {
        let k = 30;
        let density = new DensityComputer(this.GetPCLCloud(), k);
        density.Start();
    }
}
class DensityComputer extends IterativeLongProcess {
    constructor(cloud, k) {
        super(cloud.cloud.Size(), 'Computing points density');
        this.cloud = cloud;
        this.k = k;
    }
    Initialize() {
        this.scalarfield = this.cloud.AddScalarField(PCLScalarField.DensityFieldName);
    }
    Finalize() {
        this.cloud.SetCurrentField(PCLScalarField.DensityFieldName);
    }
    Iterate(step) {
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
    constructor(cloud) {
        super(cloud, 'Estimate noise', 'Estimate the noise, based on the mean weighted distance to the local planar surface at each point (requires normals).');
    }
    Enabled() {
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
    constructor(cloud, k) {
        super(cloud.cloud.Size(), 'Computing points noise');
        this.cloud = cloud;
        this.k = k;
    }
    Initialize() {
        this.scalarfield = this.cloud.AddScalarField(PCLScalarField.NoiseFieldName);
    }
    Finalize() {
        this.cloud.SetCurrentField(PCLScalarField.NoiseFieldName);
    }
    Iterate(step) {
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
    constructor(cloud, target) {
        super(cloud, 'Compute distances', 'Compute distances from a point cloud to another object');
        this.target = target;
    }
    GetFieldName() {
        return 'Distance to "' + this.target.name + '"';
    }
    Enabled() {
        return !this.GetPCLCloud().GetScalarField(this.GetFieldName());
    }
    Trigger() {
        let noise = new DistancesComputer(this.GetPCLCloud(), this.target, this.GetFieldName());
        noise.Start();
    }
}
class DistancesComputer extends IterativeLongProcess {
    constructor(cloud, target, fieldName) {
        super(cloud.cloud.Size(), 'Computing distances');
        this.cloud = cloud;
        this.target = target;
        this.fieldName = fieldName;
    }
    Initialize() {
        this.scalarfield = this.cloud.AddScalarField(this.fieldName);
    }
    Finalize() {
        this.cloud.SetCurrentField(this.fieldName);
    }
    Iterate(step) {
        let cloud = this.cloud.cloud;
        this.scalarfield.PushValue(this.target.GetDistance(cloud.GetPoint(step)));
    }
}
//===================================================
// Registration
//===================================================
class RegistrationAction extends PCLCloudAction {
    constructor(cloud, reference) {
        super(cloud, 'Register', 'Compte the rigid motion that fits "' + cloud.name + '" to "' + reference.name + '"');
        this.reference = reference;
    }
    Enabled() {
        return true;
    }
    Trigger() {
        let self = this;
        let overlapLabel = 'Overlap (%)';
        let maxiterationsLabel = 'Max iterations';
        let dialog = new Dialog((d) => {
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
        }, (d) => { return true; });
        dialog.InsertTitle('Registration settings (Trimmed Iterative Closest Points)');
        dialog.InsertValue(overlapLabel, 100);
        dialog.InsertValue(maxiterationsLabel, 20);
    }
}
//===================================================
// File export
//===================================================
class ExportPointCloudFileAction extends PCLCloudAction {
    constructor(cloud) {
        super(cloud, 'Export CSV file');
    }
    Enabled() {
        return true;
    }
    Trigger() {
        FileExporter.ExportFile(this.GetPCLCloud().name + '.csv', this.GetPCLCloud().GetCSVData(), 'text/csv');
    }
}
/// <reference path="binarystream.ts" />
class BinaryWriter extends BinaryStream {
    constructor(size) {
        super(size ? new ArrayBuffer(size) : null);
    }
    PushUInt8(value) {
        if (this.stream) {
            this.stream.setUint8(this.cursor, value);
        }
        this.cursor++;
        this.lastvalue = value;
    }
    PushInt32(value) {
        if (this.stream) {
            this.stream.setInt32(this.cursor, value, this.endianness == Endianness.LittleEndian);
        }
        this.cursor += 4;
        this.lastvalue = value;
    }
    PushFloat32(value) {
        if (this.stream) {
            this.stream.setFloat32(this.cursor, value, this.endianness == Endianness.LittleEndian);
        }
        this.cursor += 4;
        this.lastvalue = value;
    }
    PushString(value) {
        for (let index = 0; index < value.length; index++) {
            if (this.stream) {
                this.stream.setUint8(this.cursor, value.charCodeAt(index));
            }
            this.cursor++;
            this.lastvalue = value[index];
        }
    }
    PushUILenghedString(value) {
        this.PushUInt8(value.length);
        this.PushString(value);
    }
}
class FileLoader {
    constructor() {
    }
}
/// <reference path="fileloader.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />
class CsvLoader extends FileLoader {
    constructor(content) {
        super();
        this.parser = new CSVParser(content);
    }
    Load(ondone, onerror) {
        this.parser.SetNext((p) => {
            if (p.error) {
                onerror(p.error);
            }
            else {
                ondone(p.pclcloud);
            }
        });
        this.parser.Start();
    }
}
class CSVParser extends IterativeLongProcess {
    constructor(content) {
        super(0, 'Parsing CSV file content');
        this.separator = ';';
        this.reader = new BinaryReader(content);
        this.error = null;
    }
    Initialize(caller) {
        this.header = null;
        this.rawheader = null;
        this.headermapping = null;
        this.done = false;
        this.pclcloud = new PCLPointCloud();
        this.nbsteps = this.reader.CountAsciiOccurences('\n');
        this.pclcloud.cloud.Reserve(this.nbsteps);
        this.reader.Reset();
    }
    Iterate(step) {
        var line = this.ParseCurrentLine();
        if (line) {
            if (!this.header) {
                this.SetHeader(line);
            }
            else {
                var point = this.GetVector(line, CSVParser.PointCoordinates);
                let cloud = this.pclcloud.cloud;
                let fields = this.pclcloud.fields;
                if (point) {
                    cloud.PushPoint(point);
                    var normal = this.GetVector(line, CSVParser.NormalCoordinates);
                    if (normal) {
                        cloud.PushNormal(normal);
                    }
                    for (let index = 0; index < fields.length; index++) {
                        let field = fields[index];
                        field.PushValue(this.GetValue(line, field.name));
                    }
                }
            }
        }
        else {
            this.done = true;
        }
    }
    get Done() { return this.done || !!this.error; }
    SetHeader(line) {
        this.header = {};
        this.rawheader = line;
        for (let index = 0; index < line.length; index++) {
            var key = line[index];
            if (this.headermapping) {
                if (key in this.headermapping) {
                    key = this.headermapping[key];
                }
                else {
                    this.error = 'Cannot map "' + key + '" to a valid data, given the specified CSV mapping';
                    key = null;
                }
            }
            if (key) {
                let ciKey = key.toLocaleLowerCase();
                this.header[ciKey] = index;
                if (!this.IsCoordinate(ciKey)) {
                    this.pclcloud.AddScalarField(key).Reserve(this.nbsteps);
                }
            }
        }
    }
    IsCoordinate(key) {
        let coords = CSVParser.PointCoordinates.concat(CSVParser.NormalCoordinates);
        for (let index = 0; index < coords.length; index++) {
            if (key == coords[index]) {
                return true;
            }
        }
        return false;
    }
    ParseCurrentLine() {
        if (this.reader.Eof()) {
            return null;
        }
        var line = this.reader.GetAsciiLine();
        if (line) {
            return line.split(this.separator);
        }
        return null;
    }
    GetValue(line, key) {
        let ciKey = key.toLocaleLowerCase();
        if (ciKey in this.header) {
            let index = this.header[ciKey];
            try {
                return parseFloat(line[index]);
            }
            catch (e) {
            }
        }
        return null;
    }
    GetVector(line, data) {
        let result = [];
        for (let index = 0; index < data.length; index++) {
            let value = this.GetValue(line, data[index]);
            if (value !== null) {
                result.push(value);
            }
            else {
                return null;
            }
        }
        return new Vector(result);
    }
}
CSVParser.PointCoordinates = ['x', 'y', 'z'];
CSVParser.NormalCoordinates = ['nx', 'ny', 'nz'];
/// <reference path="fileloader.ts" />
/// <reference path="pclserializer.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../gui/objects/pclnode.ts" />
/// <reference path="../gui/objects/pclgroup.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />
/// <reference path="../gui/objects/pclmesh.ts" />
/// <reference path="../gui/objects/pclplane.ts" />
/// <reference path="../gui/objects/pclsphere.ts" />
/// <reference path="../gui/objects/pclcylinder.ts" />
/// <reference path="../gui/objects/pclcone.ts" />
/// <reference path="../gui/objects/pcltorus.ts" />
/// <reference path="../gui/objects/pclscalarfield.ts" />
/// <reference path="../gui/opengl/materials.ts" />
class PCLLoader extends FileLoader {
    constructor(content) {
        super();
        this.parser = new PCLParser(content, this);
    }
    Load(ondone, onError) {
        try {
            this.parser.ProcessHeader();
            let result = this.parser.ProcessNextObject();
            if (!(result instanceof PCLNode)) {
                onError('The file content is not a valid node object.');
            }
            else if (!this.parser.Done()) {
                onError('The file does not contain a single root node.');
            }
            else {
                ondone(result);
            }
        }
        catch (error) {
            onError(error);
        }
    }
    GetHandler(objecttype) {
        if (Scene.SerializationID === objecttype) {
            return new SceneParsingHandler();
        }
        if (PCLGroup.SerializationID === objecttype) {
            return new PCLGroupParsingHandler();
        }
        if (Light.SerializationID === objecttype) {
            return new LightParsingHandler();
        }
        if (LightsContainer.SerializationID === objecttype) {
            return new LightsContainerParsingHandler();
        }
        if (PCLPointCloud.SerializationID === objecttype) {
            return new PCLPointCloudParsingHandler();
        }
        if (PCLMesh.SerializationID === objecttype) {
            return new PCLMeshParsingHandler();
        }
        if (PCLPlane.SerializationID === objecttype) {
            return new PCLPlaneParsingHandler();
        }
        if (PCLSphere.SerializationID === objecttype) {
            return new PCLSphereParsingHandler();
        }
        if (PCLCylinder.SerializationID === objecttype) {
            return new PCLCylinderParsingHandler();
        }
        if (PCLCone.SerializationID === objecttype) {
            return new PCLConeParsingHandler();
        }
        if (PCLTorus.SerializationID === objecttype) {
            return new PCLTorusParsingHandler();
        }
        if (Material.SerializationID === objecttype) {
            return new MaterialParsingHandler();
        }
        if (PCLScalarField.SerializationID === objecttype) {
            return new PCLScalarFieldParsingHandler();
        }
        return null;
    }
}
/// <reference path="fileloader.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="../model/pointcloud.ts" />
/// <reference path="../model/mesh.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />
/// <reference path="../gui/objects/pclmesh.ts" />
var PLYFormat;
(function (PLYFormat) {
    PLYFormat[PLYFormat["Ascii"] = 0] = "Ascii";
    PLYFormat[PLYFormat["Binary"] = 1] = "Binary";
})(PLYFormat || (PLYFormat = {}));
class PlyDefinition {
    constructor(name, type, params) {
        this.name = name;
        this.type = type;
        this.params = params;
    }
}
class PlyElement {
    constructor(name, count) {
        this.name = name;
        this.count = count;
        this.definition = [];
        this.items = [];
    }
    PushDefinitionProperty(name, type, params) {
        //Check the property has not already been defined
        for (let index = 0; index < this.definition.length; index++) {
            if (this.definition[index].name == name) {
                throw 'the property \"' + name + '\" already exists for element \"' + this.name + '\"';
            }
        }
        this.definition.push(new PlyDefinition(name, type, params));
    }
    GetNextValue(reader, format, type) {
        if (reader.Eof()) {
            throw 'reached end of file while parsing PLY items';
        }
        switch (format) {
            case PLYFormat.Ascii:
                {
                    let value = reader.GetAsciiWord(true);
                    if (value == '') {
                        throw 'reached end of line while parsing PLY item (incomplete item specification with regard to defintion of ' + this.name + ')';
                    }
                    switch (type) {
                        case 'uchar':
                        case 'int':
                            return parseInt(value);
                        case 'float':
                            return parseFloat(value);
                    }
                    break;
                }
            case PLYFormat.Binary:
                {
                    switch (type) {
                        case 'uchar':
                        case 'uint8':
                            return reader.GetNextUInt8();
                        case 'int':
                        case 'int32':
                            return reader.GetNextInt32();
                        case 'float':
                        case 'float32':
                            return reader.GetNextFloat32();
                    }
                    break;
                }
        }
        return null;
    }
    ParseItem(reader, format) {
        let storedItem = {};
        for (let index = 0; index < this.definition.length; index++) {
            if (this.definition[index].type == 'list') {
                let length = this.GetNextValue(reader, format, this.definition[index].params[0]);
                let values = new Array(length);
                for (let cursor = 0; cursor < length; cursor++) {
                    values[cursor] = this.GetNextValue(reader, format, this.definition[index].params[1]);
                }
                storedItem[this.definition[index].name] = values;
            }
            else {
                storedItem[this.definition[index].name] = this.GetNextValue(reader, format, this.definition[index].type);
            }
        }
        return storedItem;
    }
    PushItem(reader, format) {
        let expected;
        let found;
        if (this.definition.length == 0) {
            throw 'no definition provided for element \"' + this.name + '\"';
        }
        this.items.push(this.ParseItem(reader, format));
        if (format == PLYFormat.Ascii) {
            reader.GetAsciiLine();
        }
    }
    IsFilled() {
        return (this.count == this.items.length);
    }
    GetItem(index) {
        return this.items[index];
    }
    NbItems() {
        return this.items.length;
    }
}
//////////////////////////////////////
// Elements collection handler
//////////////////////////////////////
class PlyElements {
    constructor() {
        this.elements = [];
        this.current = 0;
    }
    PushElement(name, count) {
        this.elements.push(new PlyElement(name, count));
        this.current = this.elements.length - 1;
    }
    GetCurrent() {
        if (this.current < this.elements.length) {
            return this.elements[this.current];
        }
        return null;
    }
    GetElement(name) {
        for (let index = 0; index < this.elements.length; index++) {
            if (this.elements[index].name == name) {
                return this.elements[index];
            }
        }
        return null;
    }
    ResetCurrent() {
        this.current = 0;
    }
    NbElements() {
        return this.elements.length;
    }
    PushItem(reader, format) {
        let currentElement = null;
        while ((currentElement = this.GetCurrent()) != null && currentElement.IsFilled()) {
            this.current++;
        }
        if (currentElement == null) {
            throw 'all the elements have been filled with items.';
        }
        currentElement.PushItem(reader, format);
    }
}
//////////////////////////////////////////
// PLY File Loader
//////////////////////////////////////////
class PlyLoader extends FileLoader {
    constructor(content) {
        super();
        this.reader = new BinaryReader(content);
        this.elements = new PlyElements();
    }
    Load(onloaded, onerror) {
        function Error(message) {
            throw 'PLY ERROR : ' + message;
        }
        try {
            //Firt line shoul be 'PLY'
            if (this.reader.Eof() || this.reader.GetAsciiLine().toLowerCase() != 'ply') {
                Error('this is not a valid PLY file (line 1)');
            }
            //Second line indicates the PLY format
            let format;
            if (!this.reader.Eof()) {
                let parts = this.reader.GetAsciiLine().split(' ');
                if (parts.length == 3 || parts[0].toLowerCase() != 'format') {
                    let formatstr = parts[1].toLowerCase();
                    if (formatstr === 'binary_big_endian') {
                        format = PLYFormat.Binary;
                        this.reader.endianness = Endianness.BigEndian;
                    }
                    else if (formatstr === 'binary_little_endian') {
                        format = PLYFormat.Binary;
                        this.reader.endianness = Endianness.LittleEndian;
                    }
                    else if (formatstr === 'ascii') {
                        format = PLYFormat.Ascii;
                    }
                    else {
                        Error('unsuported PLY format "' + formatstr + '" (line 2)');
                    }
                }
                else {
                    Error('invalid ply format specification (line 2)');
                }
            }
            else {
                Error('this is not a valid PLY file (line 2)');
            }
            //Then should be the header
            let inHeader = true;
            do {
                if (this.reader.Eof()) {
                    Error('unexpected end of file while parsing header');
                }
                let currentLine = this.reader.GetAsciiLine().split(' ');
                switch (currentLine[0].toLowerCase()) {
                    case 'element':
                        if (currentLine.length == 3) {
                            this.elements.PushElement(currentLine[1].toLowerCase(), //name
                            parseInt(currentLine[2]) //count
                            );
                        }
                        else {
                            Error("element definition format error");
                        }
                        break;
                    case 'property':
                        try {
                            let currentElement = this.elements.GetCurrent();
                            if (currentLine) {
                                if (currentLine.length > 2) {
                                    currentElement.PushDefinitionProperty(currentLine[currentLine.length - 1].toLowerCase(), //name
                                    currentLine[1].toLowerCase(), //type
                                    (currentLine.length > 3) ? currentLine.slice(2, -1) : null);
                                }
                                else {
                                    Error("property definition format error");
                                }
                            }
                            else {
                                Error('unexpected property, while no element has been introduced');
                            }
                        }
                        catch (exception) {
                            Error(exception);
                        }
                        break;
                    case 'comment':
                    case 'obj_info':
                        //ignore
                        break;
                    case 'end_header':
                        inHeader = false;
                        break;
                    default:
                        Error('unexpected header line');
                }
            } while (inHeader);
            if (this.elements.NbElements() == 0) {
                Error('no element definition has been found in file header');
            }
            //Read PLY body content
            this.elements.ResetCurrent();
            let loader = new ItemsLoader(this.reader, this.elements, format);
            loader
                .SetNext(new CloudBuilder(this.elements))
                .SetNext(new MeshBuilder(this.elements))
                .SetNext(new Finalizer())
                .SetNext((f) => onloaded(f.result));
            loader.Start();
        }
        catch (error) {
            onerror(error);
        }
    }
}
//////////////////////////////////////////
// PLY elements loading process
//////////////////////////////////////////
class ItemsLoader extends LongProcess {
    constructor(reader, elements, format) {
        super('Parsing PLY content');
        this.reader = reader;
        this.elements = elements;
        this.format = format;
    }
    Step() {
        try {
            this.elements.PushItem(this.reader, this.format);
        }
        catch (exception) {
            Error(exception);
        }
    }
    get Done() { return this.reader.Eof(); }
    get Current() { return this.reader.stream.byteOffset; }
    get Target() { return this.reader.stream.byteLength; }
}
//////////////////////////////////////////
// Build point cloud from loaded ply vertices
//////////////////////////////////////////
class CloudBuilder extends IterativeLongProcess {
    constructor(elements) {
        super(0, 'Loading PLY vertices');
        this.elements = elements;
    }
    Initialize(caller) {
        this.vertices = this.elements.GetElement('vertex');
        if (this.vertices) {
            this.nbsteps = this.vertices.NbItems();
            this.cloud = new PointCloud();
            this.cloud.Reserve(this.nbsteps);
        }
    }
    Iterate(step) {
        let vertex = this.vertices.GetItem(step);
        this.cloud.PushPoint(new Vector([vertex.x, vertex.y, vertex.z]));
    }
}
//////////////////////////////////////////
// Build mesh from loaded ply faces, if any
//////////////////////////////////////////
class MeshBuilder extends IterativeLongProcess {
    constructor(elements) {
        super(0, 'Loading PLY mesh');
        this.elements = elements;
    }
    Initialize(caller) {
        this.faces = this.elements.GetElement('face');
        if (this.faces) {
            if (!caller.cloud)
                throw "faces defined without vertices";
            this.nbsteps = this.faces.NbItems();
            this.result = new Mesh(caller.cloud);
            this.result.Reserve(this.nbsteps);
        }
        else {
            this.result = new PCLPointCloud(caller.cloud);
        }
    }
    Iterate(step) {
        let face = this.faces.GetItem(step);
        let mesh = this.result;
        mesh.PushFace(face.vertex_indices);
    }
}
//////////////////////////////////////////
//  Finalize the result
//////////////////////////////////////////
class Finalizer extends Process {
    constructor() {
        super();
    }
    Initialize(caller) {
        if (caller.result instanceof Mesh) {
            this.result = new PCLMesh(caller.result);
        }
        else {
            this.result = caller.result;
        }
    }
    Run(ondone) {
        if (this.result instanceof PCLMesh) {
            let mesh = this.result.mesh;
            mesh.ComputeNormals((m) => {
                m.ComputeOctree(ondone);
                return true;
            });
        }
        else {
            ondone();
        }
    }
}
class Interval {
    constructor() {
        this.min = null;
        this.max = null;
    }
    Add(n) {
        if (this.min === null || n < this.min)
            this.min = n;
        if (this.max === null || n > this.max)
            this.max = n;
    }
    IsValid() {
        return this.min !== null && this.max !== null;
    }
}
/// <reference path="drawingcontext.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/interval.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="../../controler/controler.ts" />
class ScreenDimensions {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}
class Base {
    constructor(right, up, lookAt, distance) {
        this.right = right;
        this.up = up;
        this.lookAt = lookAt;
        this.distance = distance;
    }
}
class Camera {
    constructor(context) {
        this.at = new Vector([10.0, 10.0, 10.0]);
        this.to = new Vector([.0, .0, .0]);
        this.up = new Vector([.0, 1.0, .0]);
        this.depthRange = new Interval();
        this.fov = Math.PI / 4;
        this.InititalizeDrawingContext(context);
    }
    InititalizeDrawingContext(context) {
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
    GetInnerBase() {
        let lookAt = this.to.Minus(this.at);
        let d = lookAt.Norm();
        lookAt = lookAt.Times(1. / d);
        let right = lookAt.Cross(this.up).Normalized();
        let up = right.Cross(lookAt).Normalized();
        return { right: right, up: up, lookAt: lookAt, distance: d };
    }
    GetModelViewMatrix() {
        let innerBase = this.GetInnerBase();
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
    GetProjectionMatrix() {
        let near = this.depthRange.min;
        let far = this.depthRange.max;
        if (near < 0)
            near = 0;
        if (far <= near)
            far = near + 0.0001;
        let aspectRatio = this.screen.width / this.screen.height;
        var projection = Matrix.Null(4, 4);
        var f = 1. / Math.tan(this.fov / 2.);
        projection.SetValue(0, 0, f / aspectRatio);
        projection.SetValue(1, 1, f);
        projection.SetValue(2, 2, -(near + far) / (far - near));
        projection.SetValue(2, 3, -(2.0 * near * far) / (far - near));
        projection.SetValue(3, 2, -1.0);
        return projection;
    }
    GetTranslationVector(dx, dy) {
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
    Pan(dx, dy) {
        let delta = this.GetTranslationVector(dx, dy);
        this.at = this.at.Plus(delta);
        this.to = this.to.Plus(delta);
    }
    TrackBallProjection(x, y) {
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
    GetRotationMatrix(fromx, fromy, tox, toy) {
        let from = this.TrackBallProjection(fromx, fromy).Normalized();
        let to = this.TrackBallProjection(tox, toy).Normalized();
        let angle = Math.acos(from.Dot(to));
        let axis = to.Cross(from).Normalized();
        return Matrix.Rotation(axis, angle);
    }
    Rotate(fromx, fromy, tox, toy) {
        let rotation = this.GetRotationMatrix(fromx, fromy, tox, toy);
        let p = this.at.Minus(this.to);
        p = Homogeneous.ToVector(rotation.Multiply(new HomogeneousPoint(p)));
        this.at = this.to.Plus(p);
        this.up = Homogeneous.ToVector(rotation.Multiply(new HomogeneousVector(this.up)));
    }
    Zoom(d) {
        this.Distance *= Math.pow(0.9, d);
    }
    GetPosition() {
        return this.at;
    }
    SetPosition(p) {
        this.at = p;
    }
    ComputeProjection(v, applyViewPort) {
        let u;
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
        return w;
    }
    ComputeInvertedProjection(p) {
        var u;
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
    CenterOnBox(box) {
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
    GetDirection() {
        return this.to.Minus(this.at).Normalized();
    }
    SetDirection(dir, upv) {
        this.at = this.to.Minus(dir.Normalized().Times(this.Distance));
        this.up = upv;
    }
    get Distance() {
        return this.to.Minus(this.at).Norm();
    }
    set Distance(d) {
        this.at = this.to.Minus(this.GetDirection().Times(d));
    }
    UpdateDepthRange(scene) {
        let vertices = scene.GetBoundingBox().GetVertices();
        let dir = this.GetDirection();
        this.depthRange = new Interval;
        for (let index = 0; index < vertices.length; index++) {
            let z = vertices[index].Minus(this.at).Dot(dir);
            this.depthRange.Add(z);
        }
        return this.depthRange;
    }
}
class FrameBuffer {
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.textures = new Map();
        this.fbo = gl.createFramebuffer();
        this.ColorTexture();
    }
    Delete() {
        this.gl.deleteFramebuffer(this.fbo);
        this.fbo = null;
    }
    Activate(b = true) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, b ? this.fbo : null);
    }
    ColorTexture() {
        return this.AttachTexture(this.gl.COLOR_ATTACHMENT0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE);
    }
    DepthTexture() {
        return this.AttachTexture(this.gl.DEPTH_ATTACHMENT, this.gl.DEPTH_COMPONENT32F, this.gl.DEPTH_COMPONENT, this.gl.FLOAT);
    }
    Check() {
        this.Activate();
        let status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        if (status != this.gl.FRAMEBUFFER_COMPLETE)
            throw "Unexpected frame buffer status: " + status;
    }
    AttachTexture(attachment, internalFormat, format, storage) {
        if (attachment in this.textures)
            return this.textures[attachment];
        let previousFBO = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        let texture = this.gl.createTexture();
        let level = 0;
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, this.width, this.height, 0, format, storage, null);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, texture, level);
        if (previousFBO != this.fbo)
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, previousFBO);
        this.textures[attachment] = texture;
        return texture;
    }
}
/// <reference path="pclgroup.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../files/pclserializer.ts" />
class LightsContainer extends PCLGroup {
    constructor(name) {
        super(name || NameProvider.GetName('Lights'), false);
    }
    GetActions(delegate) {
        let result = super.GetActions(delegate);
        result.push(null);
        result.push(new NewLightAction(this));
        return result;
    }
    GetSerializationID() {
        return LightsContainer.SerializationID;
    }
    GetParsingHandler() {
        return new LightsContainerParsingHandler();
    }
}
LightsContainer.SerializationID = 'LIGHTSSET';
class LightsContainerParsingHandler extends PCLGroupParsingHandler {
    constructor() {
        super();
    }
    GetObject() {
        return new LightsContainer(this.name);
    }
}
class NewLightAction extends Action {
    constructor(container) {
        super('New light', 'Add up to ' + DrawingContext.NbMaxLights + ' light sources');
        this.container = container;
    }
    Trigger() {
        let light = new Light(new Vector([100.0, 100.0, 100.0]));
        this.container.Add(light);
    }
    Enabled() {
        return this.container.children.length < DrawingContext.NbMaxLights;
    }
}
/// <reference path="pclnode.ts" />
/// <reference path="lightscontainer.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/buffer.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/colorproperty.ts" />
/// <reference path="../../controler/controler.ts" />
/// <reference path="../../files/pclserializer.ts" />
class Light extends PCLNode {
    constructor(position) {
        super(NameProvider.GetName("Light"));
        this.position = position;
        this.color = [1.0, 1.0, 1.0];
    }
    PrepareRendering(drawingContext) {
        var shapetransform = Matrix.Identity(4);
        drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));
        if (!this.glPointsBuffer) {
            this.glPointsBuffer = new FloatArrayBuffer(new Float32Array(this.position.Flatten()), drawingContext, 3);
        }
        this.glPointsBuffer.BindAttribute(drawingContext.vertices);
        drawingContext.gl.uniform3fv(drawingContext.color, new Float32Array(this.color));
        drawingContext.EnableNormals(false);
        drawingContext.EnableScalars(false);
    }
    DrawNode(drawingContext) {
        this.PrepareRendering(drawingContext);
        drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, 1);
    }
    RayIntersection(ray) {
        return new Picking(null);
    }
    GetBoundingBox() {
        return null;
    }
    FillProperties() {
        if (this.properties) {
            let self = this;
            this.properties.Push(new VectorProperty('Position', () => self.position, false, () => { }));
            this.properties.Push(new ColorProperty('Color', () => self.color, (newColor) => self.color = newColor));
        }
    }
    GetDisplayIcon() {
        return 'fa-lightbulb-o';
    }
    GetPosition() {
        return this.position;
    }
    SetPositon(p) {
        this.position = p;
    }
    GetDistance(p) {
        return p.Minus(this.position).Norm();
    }
    GetSerializationID() {
        return Light.SerializationID;
    }
    SerializeNode(serializer) {
        let self = this;
        serializer.PushParameter('position', (s) => {
            s.PushFloat32(self.position.Get(0));
            s.PushFloat32(self.position.Get(1));
            s.PushFloat32(self.position.Get(2));
        });
        serializer.PushParameter('color', (s) => {
            s.PushFloat32(self.color[0]);
            s.PushFloat32(self.color[1]);
            s.PushFloat32(self.color[2]);
        });
    }
    GetParsingHandler() {
        return new LightParsingHandler();
    }
}
Light.SerializationID = 'LIGHT';
class LightParsingHandler extends PCLNodeParsingHandler {
    constructor() {
        super();
    }
    ProcessNodeParam(paramname, parser) {
        switch (paramname) {
            case 'position':
                this.position = new Vector([
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ]);
                return true;
            case 'color':
                this.color = [
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32(),
                    parser.reader.GetNextFloat32()
                ];
                return true;
        }
        return false;
    }
    FinalizeNode() {
        let light = new Light(this.position);
        light.color = this.color;
        return light;
    }
}
/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="light.ts" />
/// <reference path="lightscontainer.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />
class Scene extends PCLGroup {
    constructor(initialize = true) {
        super("Scene");
        this.deletable = false;
        if (initialize) {
            this.children = [null, null];
            this.Contents = new PCLGroup("Objects");
            this.Contents.deletable = false;
            this.Lights = new LightsContainer("Lights");
            this.Lights.deletable = false;
            this.Lights.visible = false;
            this.Lights.folded = true;
            let defaultLight = new Light(new Vector([10.0, 10.0, 10.0]));
            this.Lights.Add(defaultLight);
            defaultLight.deletable = false;
        }
    }
    get Contents() {
        return this.children[1];
    }
    set Contents(c) {
        this.children[1] = c;
        c.owner = this;
    }
    get Lights() {
        return this.children[0];
    }
    set Lights(l) {
        this.children[0] = l;
        l.owner = this;
    }
    GetDisplayIcon() {
        return 'fa-desktop';
    }
    GetSerializationID() {
        return Scene.SerializationID;
    }
    GetParsingHandler() {
        return new SceneParsingHandler();
    }
}
Scene.SerializationID = 'SCENE';
class SceneParsingHandler extends PCLGroupParsingHandler {
    constructor() {
        super();
    }
    GetObject() {
        return new Scene(false);
    }
}
/// <reference path="framebuffer.ts" />
/// <reference path="../objects/scene.ts" />
class EDLFilter {
    constructor(context) {
        this.context = context;
        this.Resize(this.context);
        this.shaders = new Shaders(this.context.gl, "RawVertexShader", "EDLFragmentShader");
        this.shaders.Use();
        this.color = this.shaders.Uniform("colorTexture");
        this.depth = this.shaders.Uniform("depthTexture");
        this.nbhPos = this.shaders.Uniform("Neighbors");
        this.expScale = this.shaders.Uniform("ExpFactor");
        this.zMin = this.shaders.Uniform("DepthMin");
        this.zMax = this.shaders.Uniform("DepthMax");
        this.width = this.shaders.Uniform("ScreenWidth");
        this.height = this.shaders.Uniform("ScreenHeight");
        this.nbhPositions = new Float32Array([
            -1., -1.,
            -1., 0.,
            -1., 1.,
            0., 1.,
            1., 1.,
            0., 1.,
            -1., 1.,
            -1., 0
        ]);
        this.points = new FloatArrayBuffer(new Float32Array([
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0,
        ]), this.context, 3);
        this.textCoords = new FloatArrayBuffer(new Float32Array([
            0., 0.,
            1., 0.,
            1., 1.,
            0., 1.
        ]), this.context, 2);
        this.indices = new ElementArrayBuffer([
            0, 1, 2,
            0, 2, 3
        ], this.context, true);
        this.vertices = this.shaders.Attribute("VertexPosition");
        this.context.gl.enableVertexAttribArray(this.vertices);
        this.uv = this.shaders.Attribute("TextureCoordinate");
        this.context.gl.enableVertexAttribArray(this.uv);
    }
    Resize(context) {
        if (this.fbo)
            this.fbo.Delete();
        let width = context.renderingArea.width;
        let height = context.renderingArea.height;
        this.fbo = new FrameBuffer(context.gl, width, height);
    }
    Dispose() {
        this.fbo.Activate(false);
        this.fbo.Delete();
        this.fbo = null;
    }
    CollectRendering() {
        this.fbo.Activate();
        let gl = this.context.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
    }
    Render(camera, scene) {
        let gl = this.context.gl;
        gl.flush();
        this.shaders.Use();
        this.fbo.Activate(false);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fbo.ColorTexture());
        gl.uniform1i(this.color, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.fbo.DepthTexture());
        gl.uniform1i(this.depth, 1);
        let width = this.context.renderingArea.width;
        let height = this.context.renderingArea.height;
        gl.uniform2fv(this.nbhPos, this.nbhPositions);
        gl.uniform1f(this.expScale, 4.);
        gl.uniform1f(this.zMin, camera.depthRange.min);
        gl.uniform1f(this.zMax, camera.depthRange.max);
        gl.uniform1f(this.width, width);
        gl.uniform1f(this.height, height);
        gl.viewport(0, 0, width, height);
        this.textCoords.BindAttribute(this.uv);
        this.points.BindAttribute(this.vertices);
        this.indices.Bind();
        gl.drawElements(gl.TRIANGLES, 6, this.context.GetIntType(true), 0);
        gl.flush();
    }
}
class Random {
    static Uniform(start = 0, end = 1) {
        let r = Math.random();
        return start + r * (end - start);
    }
    static Gaussian(mean = 0, sigma = 1) {
        let x, y, u;
        //Box-muller transform
        do {
            x = Random.Uniform(-1, 1);
            y = Random.Uniform(-1, 1);
            u = x ** 2 + y ** 2;
        } while (u == 0 || u > 1);
        let r = x * Math.sqrt(-2 * Math.log(u) / u);
        return mean + r * sigma;
    }
}
/// <reference path="../controls/control.ts" />
/// <reference path="drawingcontext.ts" />
/// <reference path="camera.ts" />
/// <reference path="edlfilter.ts" />
/// <reference path="../objects/scene.ts" />
/// <reference path="../objects/pclnode.ts" />
/// <reference path="../objects/light.ts" />
/// <reference path="../objects/pclpointcloud.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../tools/longprocess.ts" />
/// <reference path="../../tools/random.ts" />
/// <reference path="../../model/pointcloud.ts" />
class Renderer {
    constructor(className) {
        //Create a canvas to display the scene
        this.sceneRenderingArea = document.createElement('canvas');
        this.sceneRenderingArea.className = className;
        this.drawingcontext = new DrawingContext(this.sceneRenderingArea);
        this.camera = new Camera(this.drawingcontext);
        this.activeFilter = null;
        this.drawingcontext.rendering.Register(this);
    }
    UseEDL(b) {
        if (b === true) {
            if (!this.activeFilter)
                this.activeFilter = new EDLFilter(this.drawingcontext);
        }
        else if (b === false) {
            if (this.activeFilter) {
                this.activeFilter.Dispose();
                this.activeFilter = null;
            }
        }
        return !!this.activeFilter;
    }
    GetElement() {
        return this.sceneRenderingArea;
    }
    Draw(scene) {
        this.drawingcontext.shaders.Use();
        var gl = this.drawingcontext.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        //Set the lights positions and colors
        let nbLights = 0;
        for (var index = 0; index < scene.Lights.children.length; index++) {
            let light = scene.Lights.children[index];
            if (light.visible) {
                gl.uniform3fv(this.drawingcontext.lightpositions[nbLights], new Float32Array(light.position.Flatten()));
                gl.uniform3fv(this.drawingcontext.lightcolors[nbLights], new Float32Array(light.color));
                nbLights++;
            }
        }
        gl.uniform1i(this.drawingcontext.nblights, nbLights);
        //Set the camera position
        this.camera.UpdateDepthRange(scene);
        this.camera.InititalizeDrawingContext(this.drawingcontext);
        //Perform rendering
        if (scene) {
            if (this.activeFilter)
                this.activeFilter.CollectRendering();
            scene.Draw(this.drawingcontext);
            if (this.activeFilter)
                this.activeFilter.Render(this.camera, scene);
        }
    }
    RefreshSize() {
        this.Resize(this.sceneRenderingArea.scrollWidth, this.sceneRenderingArea.scrollHeight);
    }
    Resize(width, height) {
        this.drawingcontext.renderingArea.width = width;
        this.drawingcontext.renderingArea.height = height;
        this.camera.screen.width = width;
        this.camera.screen.height = height;
    }
    GetRay(x, y, aperture) {
        let point = this.camera.ComputeInvertedProjection(new Vector([x, y, -1.0]));
        return new Ray(this.camera.at, point.Minus(this.camera.at).Normalized(), aperture);
    }
    ResolveRayIntersection(ray, root) {
        return root.RayIntersection(ray);
    }
    PickObject(x, y, scene) {
        let ray = this.GetRay(x, y, Geometry.DegreeToRadian(2));
        let picked = this.ResolveRayIntersection(ray, scene.Contents);
        if (picked != null && picked.HasIntersection()) {
            return picked.object;
        }
        return null;
    }
    ScanFromCurrentViewPoint(group, hsampling, vsampling, noise) {
        let scanner = new SceneScanner(this, group, hsampling, vsampling, noise);
        scanner.SetNext((s) => {
            let cloud = new PCLPointCloud(s.cloud);
            group.Add(cloud);
            cloud.NotifyChange(cloud, ChangeType.NewItem);
        });
        scanner.Start();
    }
    OnRenderingTypeChange(renderingType) {
        let shouldUseEDL = renderingType.EDL();
        if (this.UseEDL() != shouldUseEDL)
            this.UseEDL(shouldUseEDL);
    }
}
class SceneScanner extends LongProcess {
    constructor(renderer, group, width, height, noise = 0) {
        super('Scanning the scene (' + width + 'x' + height + ')');
        this.renderer = renderer;
        this.group = group;
        this.width = width;
        this.height = height;
        this.noise = noise;
        this.currenti = 0;
        this.currentj = 0;
    }
    Initialize() {
        this.cloud = new PointCloud();
        this.cloud.Reserve(this.width * this.height);
    }
    Stopable() {
        return true;
    }
    Step() {
        let screen = this.renderer.camera.screen;
        let x = screen.width * (this.currenti / this.width);
        let y = screen.height * (this.currentj / this.height);
        let ray = this.renderer.GetRay(x, y);
        let intersection = this.renderer.ResolveRayIntersection(ray, this.group);
        if (intersection && intersection.HasIntersection()) {
            let dist = Random.Gaussian(intersection.distance, this.noise);
            let point = ray.from.Plus(ray.dir.Times(dist));
            this.cloud.PushPoint(point);
        }
        this.currentj++;
        if (this.currentj >= this.height) {
            this.currentj = 0;
            this.currenti++;
        }
    }
    get Current() { return this.currenti * this.width + this.currentj; }
    get Target() { return this.width * this.height; }
}
;
/// <reference path="control.ts" />
class Pannel {
    constructor(classname = "") {
        this.pannel = document.createElement('div');
        this.pannel.className = classname;
    }
    GetElement() {
        return this.pannel;
    }
    AddControl(control) {
        this.pannel.appendChild(control.GetElement());
    }
    RemoveControl(control) {
        this.pannel.removeChild(control.GetElement());
    }
    Clear() {
        while (this.pannel.lastChild) {
            this.pannel.removeChild(this.pannel.lastChild);
        }
    }
}
/// <reference path="control.ts" />
/// <reference path="pannel.ts" />
var HandlePosition;
(function (HandlePosition) {
    HandlePosition[HandlePosition["None"] = 0] = "None";
    HandlePosition[HandlePosition["Left"] = 1] = "Left";
    HandlePosition[HandlePosition["Top"] = 2] = "Top";
    HandlePosition[HandlePosition["Right"] = 3] = "Right";
    HandlePosition[HandlePosition["Bottom"] = 4] = "Bottom";
})(HandlePosition || (HandlePosition = {}));
;
class Handle {
    constructor(owner, position) {
        this.owner = owner;
        this.position = position;
        let self = this;
        this.handle = document.createElement('div');
        this.handle.className = 'HideablePannelHandle';
        this.handle.setAttribute("Position", HandlePosition[position]);
        this.handle.onclick = (event) => {
            if (!self.owner.pinned)
                self.owner.SwitchVisibility();
        };
        this.UpdateCursor();
    }
    GetElement() {
        return this.handle;
    }
    RefreshSize() {
        switch (this.position) {
            case HandlePosition.Left:
            case HandlePosition.Right:
                this.handle.style.height = this.owner.GetElement().clientHeight + 'px';
                break;
            case HandlePosition.Top:
            case HandlePosition.Bottom:
                this.handle.style.width = this.owner.GetElement().clientWidth + 'px';
            default:
                break;
        }
    }
    UpdateCursor() {
        let orientation = '';
        let visible = this.owner.visible;
        switch (this.position) {
            case HandlePosition.Left:
                orientation = visible ? 'e' : 'w';
                break;
            case HandlePosition.Right:
                orientation = visible ? 'w' : 'e';
                break;
            case HandlePosition.Top:
                orientation = visible ? 's' : 'n';
                break;
            case HandlePosition.Bottom:
                orientation = visible ? 'n' : 's';
                break;
            default: break;
        }
        this.handle.style.cursor = orientation + '-resize';
    }
}
class HideablePannel extends Pannel {
    constructor(classname = "", handlePosition = HandlePosition.None) {
        super(classname);
        this.container = new Pannel('HideablePannelContainer');
        super.AddControl(this.container);
        if (handlePosition !== HandlePosition.None) {
            this.handle = new Handle(this, handlePosition);
            super.AddControl(this.handle);
        }
        this.originalWidth = null;
        this.originalHeight = null;
        this.visible = true;
        this.originalvisibility = true;
        this.pinned = false;
    }
    AddControl(control) {
        this.container.AddControl(control);
    }
    Show() {
        if (!this.visible) {
            let pannel = this.GetElement();
            if (this.originalWidth !== null) {
                pannel.style.width = this.originalWidth + 'px';
            }
            if (this.originalHeight !== null) {
                pannel.style.height = this.originalHeight + 'px';
            }
            this.visible = true;
            this.originalvisibility = true;
            this.RefreshSize();
            if (this.handle) {
                this.handle.UpdateCursor();
            }
        }
    }
    Hide() {
        if (this.visible) {
            let pannel = this.GetElement();
            let handle = this.handle.GetElement();
            switch (this.handle.position) {
                case HandlePosition.Left:
                case HandlePosition.Right:
                    this.originalWidth = pannel.clientWidth;
                    pannel.style.width = handle.clientWidth + 'px';
                    break;
                case HandlePosition.Top:
                case HandlePosition.Bottom:
                    this.originalHeight = pannel.clientHeight;
                    pannel.style.height = handle.clientHeight + 'px';
                    break;
                default: break;
            }
            this.visible = false;
            this.originalvisibility = false;
            if (this.handle) {
                this.handle.UpdateCursor();
            }
        }
    }
    TemporaryHide() {
        let visbilityToRestore = this.visible;
        this.Hide();
        this.originalvisibility = visbilityToRestore;
    }
    RestoreVisibility() {
        if (this.originalvisibility) {
            this.Show();
        }
        else {
            this.Hide();
        }
    }
    SwitchVisibility() {
        if (this.visible) {
            this.Hide();
        }
        else {
            this.Show();
        }
    }
    RefreshSize() {
        switch (this.handle.position) {
            case HandlePosition.Left:
            case HandlePosition.Right:
                this.GetElement().style.width = this.container.GetElement().clientWidth +
                    this.handle.GetElement().clientWidth + 'px';
                break;
            case HandlePosition.Top:
            case HandlePosition.Bottom:
                this.GetElement().style.height = this.container.GetElement().clientHeight +
                    this.handle.GetElement().clientHeight + 'px';
                break;
            default: break;
        }
        if (this.handle) {
            this.handle.RefreshSize();
        }
    }
}
/// <reference path="control.ts" />
/// <reference path="hint.ts" />
/// <reference path="../../controler/actions/action.ts" />
class PopupItem {
    constructor(action) {
        this.action = action;
        this.item = document.createElement('div');
        if (action) {
            this.item.className = 'PopupOption';
            if (action.Enabled()) {
                this.item.onclick = this.ItemClicked(action);
            }
            else {
                this.item.className += 'Inactive';
            }
            let itemLabel = document.createTextNode(action.GetLabel());
            this.item.appendChild(itemLabel);
            if (action.hintMessage) {
                this.hint = new Hint(this, action.hintMessage);
            }
        }
        else {
            this.item.className = 'PopupSeparator';
        }
    }
    ItemClicked(action) {
        let self = this;
        return function () {
            action.Run();
            if (self.hint) {
                self.hint.Hide();
            }
            Popup.DestroyCurrent();
        };
    }
    GetElement() {
        return this.item;
    }
}
/// <reference path="control.ts" />
/// <reference path="popupitem.ts" />
/// <reference path="../../controler/actions/action.ts" />
class Popup {
    constructor(owner, actions) {
        this.actions = actions;
        this.popupContainer = document.createElement('div');
        this.popupContainer.className = 'Popup';
        this.popupContainer.id = 'Popup';
        let element;
        if (owner instanceof HTMLElement)
            element = owner;
        else
            element = owner.GetElement();
        let rect = element.getBoundingClientRect();
        this.popupContainer.style.top = rect.bottom + 'px';
        this.popupContainer.style.left = rect.left + 'px';
        this.popupContainer.onmouseleave = function () {
            Popup.DestroyCurrent();
        };
        document.body.appendChild(this.popupContainer);
        this.items = [];
        let popupContent = ((typeof actions == 'function') ? actions() : actions);
        for (let index = 0; index < popupContent.length; index++) {
            let popupItem = new PopupItem(popupContent[index]);
            this.items.push(PopupItem);
            this.popupContainer.appendChild(popupItem.GetElement());
        }
    }
    static DestroyCurrent() {
        if (this.current) {
            let popupElement = this.current.GetElement();
            popupElement.parentNode.removeChild(popupElement);
        }
        this.current = null;
    }
    static CreatePopup(owner, actions) {
        Popup.DestroyCurrent();
        this.current = new Popup(owner, actions);
        return this.current;
    }
    GetElement() {
        return this.popupContainer;
    }
}
var DraggingType;
(function (DraggingType) {
    DraggingType[DraggingType["Vertical"] = 1] = "Vertical";
    DraggingType[DraggingType["Horizontal"] = 2] = "Horizontal";
    DraggingType[DraggingType["Both"] = 3] = "Both";
})(DraggingType || (DraggingType = {}));
class Draggable {
    constructor(draggingtype = DraggingType.Both) {
        this.draggingtype = draggingtype;
    }
    MakeDraggable() {
        let element = this.GetElement();
        let self = this;
        element.onmousedown = (event) => {
            self.InitializeDragging(event);
        };
    }
    InitializeDragging(event) {
        event = event || window.event;
        this.tracker = new MouseTracker(event);
        this.dragged = false;
        let self = this;
        this.mousemovebackup = document.onmousemove;
        document.onmousemove = (event) => {
            self.UpdateDragging(event);
        };
        this.mouseupbackup = document.onmouseup;
        document.onmouseup = (event) => {
            self.Finalize(event);
        };
    }
    UpdateDragging(event) {
        let element = this.GetElement();
        let delta = this.tracker.UpdatePosition(event);
        let dx = this.draggingtype & DraggingType.Horizontal ? delta.dx : 0;
        let dy = this.draggingtype & DraggingType.Vertical ? delta.dy : 0;
        if (this.Authorized(dx, dy)) {
            if (dx) {
                if (element.style.left) {
                    element.style.left = this.GetModifiedPosition(element.style.left, dx);
                }
                else if (element.style.right) {
                    element.style.right = this.GetModifiedPosition(element.style.right, -dx);
                }
                else {
                    throw 'Dragging only applies to positioned elements';
                }
                this.dragged = true;
            }
            if (dy) {
                if (element.style.top) {
                    element.style.top = this.GetModifiedPosition(element.style.top, dy);
                }
                else if (element.style.bottom) {
                    element.style.bottom = this.GetModifiedPosition(element.style.bottom, -dy);
                }
                else {
                    throw 'Dragging only applies to positioned elements';
                }
                this.dragged = true;
                this.OnMove();
            }
        }
    }
    GetModifiedPosition(pos, delta) {
        let value = parseInt(pos, 10);
        let suffix = pos.replace(value.toString(), '');
        let result = (value + delta) + suffix;
        return result;
    }
    Finalize(event) {
        document.onmousemove = this.mousemovebackup;
        document.onmouseup = this.mouseupbackup;
        if (this.dragged) {
            this.OnDrop(event);
        }
        else {
            this.OnClick();
        }
    }
    OnClick() {
    }
    OnMove() {
    }
    Authorized(dx, dy) {
        return true;
    }
}
/// <reference path="../control.ts" />
/// <reference path="../draggable.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
/// <reference path="../../../tools/stringutils.ts" />
class ColorScaleBoundsContainer {
    constructor(field) {
        this.field = field;
        this.container = document.createElement('div');
        this.container.className = 'ColorScaleBoundsContainer';
        this.lower = new ColorScaleLowerBound(this, (c) => field.SetColorMin(c));
        this.upper = new ColorScaleUpperBound(this, (c) => field.SetColorMax(c));
        this.container.appendChild(this.lower.GetElement());
        this.container.appendChild(this.upper.GetElement());
        let hintmsg = 'Click the value to change the corresponding bound color.\n';
        hintmsg += 'Drag the value up/down to set the range of displayable values.';
        new Hint(this, hintmsg);
    }
    GetElement() {
        return this.container;
    }
    Refresh() {
        this.lower.SetValue(this.field.GetDisplayMin());
        this.lower.SetColor(this.field.colormin);
        this.upper.SetValue(this.field.GetDisplayMax());
        this.upper.SetColor(this.field.colormax);
    }
    GetHeight() {
        return this.container.getBoundingClientRect().height;
    }
}
class ColorScaleBound extends Draggable {
    constructor(owner, onColorChange) {
        super(DraggingType.Vertical);
        this.owner = owner;
        this.container = document.createElement('div');
        this.container.className = 'ColorScaleBound';
        this.value = document.createTextNode('');
        this.container.appendChild(this.value);
        this.color = document.createElement('input');
        this.color.type = 'color';
        this.color.style.display = 'None';
        this.container.appendChild(this.color);
        let self = this;
        this.color.onchange = () => {
            self.UpdateColor();
            onColorChange(StringUtils.StrToRGBf(self.color.value));
        };
        this.MakeDraggable();
    }
    OnClick() {
        this.color.click();
    }
    GetElement() {
        return this.container;
    }
    OnDrop() {
    }
    SetValue(v, updatepos = true) {
        this.value.data = Number(v).toFixed(2);
        let min = this.owner.field.Min();
        let max = this.owner.field.Max();
        let ratio = (v - min) / (max - min);
        this.UpdatePosition(ratio);
    }
    SetColor(color) {
        let colorStr = StringUtils.RGBfToStr(color);
        this.color.value = colorStr;
        this.UpdateColor();
    }
    UpdateColor() {
        this.container.style.color = this.color.value;
    }
}
class ColorScaleLowerBound extends ColorScaleBound {
    constructor(owner, onColorChange) {
        super(owner, onColorChange);
        this.container.classList.add('Lower');
    }
    Authorized(dx, dy) {
        let top = parseInt(this.container.style.top, 10) + dy;
        let min = this.owner.GetHeight() - parseInt(this.owner.upper.container.style.bottom, 10);
        return min <= top && top <= this.owner.GetHeight();
    }
    UpdatePosition(ratio) {
        this.container.style.top = ((1.0 - ratio) * this.owner.GetHeight()) + 'px';
    }
    OnMove() {
        let ratio = parseInt(this.container.style.top) / this.owner.GetHeight();
        let min = this.owner.field.Min();
        let max = this.owner.field.Max();
        let value = min + ((1.0 - ratio) * (max - min));
        this.value.data = Number(value).toFixed(2);
        this.owner.field.SetDisplayMin(value);
    }
}
class ColorScaleUpperBound extends ColorScaleBound {
    constructor(owner, onColorChange) {
        super(owner, onColorChange);
        this.container.classList.add('Upper');
    }
    Authorized(dx, dy) {
        let bottom = parseInt(this.container.style.bottom, 10) - dy;
        let min = this.owner.GetHeight() - parseInt(this.owner.lower.container.style.top, 10);
        return min <= bottom && bottom <= this.owner.GetHeight();
    }
    UpdatePosition(ratio) {
        this.container.style.bottom = (ratio * this.owner.GetHeight()) + 'px';
    }
    OnMove() {
        let ratio = parseInt(this.container.style.bottom) / this.owner.GetHeight();
        let min = this.owner.field.Min();
        let max = this.owner.field.Max();
        let value = min + (ratio * (max - min));
        this.value.data = Number(value).toFixed(2);
        this.owner.field.SetDisplayMax(value);
    }
}
/// <reference path="../../opengl/drawingcontext.ts" />
/// <reference path="../control.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
class ColorScaleRenderer {
    constructor() {
        this.scaleRenderingArea = document.createElement('canvas');
        this.scaleRenderingArea.className = 'ColorRenderer';
        this.drawingcontext = new DrawingContext(this.scaleRenderingArea);
        this.points = new FloatArrayBuffer(new Float32Array([
            1.0, -1.0, 0.0,
            -1.0, -1.0, 0.0,
            -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0
        ]), this.drawingcontext, 3);
        this.indices = new ElementArrayBuffer([
            0, 1, 2,
            2, 3, 0
        ], this.drawingcontext, true);
        let indentity = Matrix.Identity(4);
        this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.modelview, false, indentity.values);
        this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.projection, false, indentity.values);
        this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.shapetransform, false, indentity.values);
        this.drawingcontext.EnableNormals(false);
        this.drawingcontext.EnableScalars(true);
    }
    Refresh(field) {
        this.drawingcontext.gl.viewport(0, 0, this.scaleRenderingArea.width, this.scaleRenderingArea.height);
        this.drawingcontext.gl.clear(this.drawingcontext.gl.COLOR_BUFFER_BIT | this.drawingcontext.gl.DEPTH_BUFFER_BIT);
        let min = field.GetDisplayMin();
        let max = field.GetDisplayMax();
        this.drawingcontext.gl.uniform1f(this.drawingcontext.minscalarvalue, min);
        this.drawingcontext.gl.uniform1f(this.drawingcontext.maxscalarvalue, max);
        this.drawingcontext.gl.uniform3fv(this.drawingcontext.minscalarcolor, field.colormin);
        this.drawingcontext.gl.uniform3fv(this.drawingcontext.maxscalarcolor, field.colormax);
        min = field.Min();
        max = field.Max();
        let scalars = new FloatArrayBuffer(new Float32Array([min, min, max, max]), this.drawingcontext, 1);
        this.points.BindAttribute(this.drawingcontext.vertices);
        scalars.BindAttribute(this.drawingcontext.scalarvalue);
        this.indices.Bind();
        this.drawingcontext.gl.drawElements(this.drawingcontext.gl.TRIANGLES, 6, this.drawingcontext.GetIntType(true), 0);
    }
    GetElement() {
        return this.scaleRenderingArea;
    }
    GetColor(v) {
        let gl = this.drawingcontext.gl;
        let pixel = new Uint8Array(4);
        gl.readPixels(0, Math.round(v * gl.drawingBufferHeight), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        return StringUtils.RGBiToStr(pixel);
    }
}
/// <reference path="scalarfield.ts" />
class Histogram {
    constructor(values, nbchunks) {
        if (nbchunks <= 0) {
            throw "Invalid histogram parameter : " + nbchunks;
        }
        this.chunkcounters = new Array(nbchunks);
        for (let index = 0; index < nbchunks; index++) {
            this.chunkcounters[index] = 0;
        }
        this.minvalue = values.Min();
        this.maxvalue = values.Max();
        this.total = values.Size();
        this.maxcounter = 0;
        let chunkwidth = (this.maxvalue - this.minvalue) / nbchunks;
        for (let index = 0; index < values.Size(); index++) {
            let chunkindex = Math.floor((values.GetValue(index) - this.minvalue) / chunkwidth);
            if (chunkindex == nbchunks) {
                chunkindex--;
            }
            this.chunkcounters[chunkindex]++;
            if (this.chunkcounters[chunkindex] > this.maxcounter) {
                this.maxcounter = this.chunkcounters[chunkindex];
            }
        }
    }
    Size() {
        return this.chunkcounters.length;
    }
    GetChunk(chunkindex = null) {
        if (chunkindex === null) {
            return new HistogramChunk(this, this.minvalue, this.maxvalue, this.total);
        }
        let histowidth = this.maxvalue - this.minvalue;
        let chunkwidth = histowidth / this.chunkcounters.length;
        return new HistogramChunk(this, this.minvalue + (chunkindex * chunkwidth), this.minvalue + ((chunkindex + 1) * chunkwidth), this.chunkcounters[chunkindex]);
    }
}
class HistogramChunk {
    constructor(histogram, from, to, count) {
        this.histogram = histogram;
        this.from = from;
        this.to = to;
        this.count = count;
    }
    GetStartingValue() {
        return this.from;
    }
    GetNormalizedStartingValue() {
        return (this.from - this.histogram.minvalue) / (this.histogram.maxvalue - this.histogram.minvalue);
    }
    GetEndingValue() {
        return this.to;
    }
    GetNormalizedEndingValue() {
        return (this.to - this.histogram.minvalue) / (this.histogram.maxvalue - this.histogram.minvalue);
    }
    GetWidth() {
        return this.to - this.from;
    }
    GetNormalizedWidth() {
        return this.GetWidth() / (this.histogram.maxvalue - this.histogram.minvalue);
    }
    GetCount() {
        return this.count;
    }
    GetNormalizedCount() {
        return this.count / this.histogram.total;
    }
    GetMaxNormalizedCount() {
        return this.count /= this.histogram.maxcounter;
    }
}
/// <reference path="../control.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
/// <reference path="../../../model/histogram.ts" />
class HistogramViewer {
    constructor(scalarfield, color = null) {
        this.scalarfield = scalarfield;
        this.color = color;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'HistogramViewer';
        this.nbrequestedchunks = 30;
        let self = this;
        this.canvas.onwheel = (event) => {
            self.nbrequestedchunks += event.deltaY > 0 ? -1 : 1;
            if (self.nbrequestedchunks < 1) {
                self.nbrequestedchunks = 1;
            }
            self.Refresh();
            event.stopPropagation();
        };
        let hintmsg = 'Histogram of values for field "' + scalarfield.name + '"\n';
        hintmsg += 'You can modify the number of classes in the histogram by scrolling up / down (using the mouse wheel)';
        new Hint(this, hintmsg);
    }
    Refresh() {
        let histogram = new Histogram(this.scalarfield, this.nbrequestedchunks);
        let ctx = this.canvas.getContext('2d');
        let width = this.canvas.width;
        let height = this.canvas.height;
        ctx.fillStyle = 'white';
        ctx.clearRect(0, 0, width, height);
        for (var index = 0; index < histogram.Size(); index++) {
            let chunck = histogram.GetChunk(index);
            if (this.color) {
                let midvalue = 0.5 * (chunck.GetStartingValue() + chunck.GetEndingValue());
                ctx.fillStyle = this.color(midvalue);
            }
            ctx.fillRect(0, height * (1.0 - chunck.GetNormalizedEndingValue()), chunck.GetMaxNormalizedCount() * width, chunck.GetNormalizedWidth() * height);
        }
    }
    IsCollapsed() {
        return this.canvas.classList.contains(HistogramViewer.CollapsedClassName);
    }
    Collapse() {
        if (!this.IsCollapsed()) {
            this.canvas.classList.add(HistogramViewer.CollapsedClassName);
        }
    }
    Expand() {
        if (this.IsCollapsed()) {
            this.canvas.classList.remove(HistogramViewer.CollapsedClassName);
        }
    }
    GetElement() {
        return this.canvas;
    }
}
HistogramViewer.CollapsedClassName = 'Collapsed';
/// <reference path="scalebounds.ts" />
/// <reference path="scalerenderer.ts" />
/// <reference path="histogramviewer.ts" />
/// <reference path="../pannel.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
class ColorScale extends Pannel {
    constructor(field) {
        super('ColorScale');
        this.field = field;
        this.renderer = new ColorScaleRenderer();
        this.bounds = new ColorScaleBoundsContainer(this.field);
        this.histo = new HistogramViewer(this.field, (v) => self.GetColor(v));
        this.AddControl(this.bounds);
        this.AddControl(this.renderer);
        this.AddControl(this.histo);
        let self = this;
        this.renderer.GetElement().onclick = () => {
            self.histo.IsCollapsed() ? self.histo.Expand() : self.histo.Collapse();
        };
        this.histo.GetElement().onclick = () => {
            self.histo.Collapse();
        };
        let hintmsg = 'Color scale for field "' + field.name + '".\n';
        hintmsg += 'Click this element to show/hide the values histogram. You can also modify the scale boundaries.';
        new Hint(this.renderer, hintmsg);
    }
    GetColor(value) {
        let ratio = (value - this.field.Min()) / (this.field.Max() - this.field.Min());
        return this.renderer.GetColor(ratio);
    }
    static Show(field) {
        if (this.instance && this.instance.field !== field) {
            this.Hide();
        }
        if (!this.instance) {
            this.instance = new ColorScale(field);
            if (!ColorScale.showHisto) {
                this.instance.histo.Collapse();
            }
            document.body.appendChild(this.instance.GetElement());
        }
        return this.instance;
    }
    static Hide() {
        if (this.instance) {
            ColorScale.showHisto = this.instance.histo && !this.instance.histo.IsCollapsed();
            document.body.removeChild(this.instance.GetElement());
            delete this.instance;
        }
    }
    Refresh() {
        this.renderer.Refresh(this.field);
        this.bounds.Refresh();
        this.histo.Refresh();
    }
}
ColorScale.showHisto = true;
/// <reference path="control.ts" />
/// <reference path="popup.ts" />
/// <reference path="../objects/pclnode.ts" />
/// <reference path="../objects/pclgroup.ts" />
/// <reference path="../datahandler.ts" />
/// <reference path="./colorscale/colorscale.ts" />
class DataItem {
    //Here we go
    constructor(item, dataHandler) {
        this.item = item;
        this.dataHandler = dataHandler;
        this.uuid = DataItem.ItemsCache.length;
        DataItem.ItemsCache.push(this);
        this.sons = [];
        this.container = document.createElement('div');
        this.container.className = 'TreeItemContainer';
        this.container.id = DataItem.GetId(this.uuid);
        this.itemContentContainer = document.createElement('div');
        this.itemContentContainer.className = item.selected ? 'SelectedSceneItem' : 'SceneItem';
        this.container.appendChild(this.itemContentContainer);
        //Diplay a small icon to show the itam nature
        this.itemIcon = document.createElement('i');
        this.itemIcon.className = 'ItemIcon fa ' + this.item.GetDisplayIcon();
        this.itemContentContainer.appendChild(this.itemIcon);
        if (this.item instanceof PCLGroup) {
            this.itemIcon.onclick = this.ItemFolded();
            this.itemContentContainer.ondblclick = this.ItemFolded();
        }
        let self = this;
        //Quick actions (visibility, menu, deletion)
        this.visibilityIcon = document.createElement('i');
        this.visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
        this.itemContentContainer.appendChild(this.visibilityIcon);
        this.visibilityIcon.onclick = (ev) => self.ViewClicked();
        let menuIcon = document.createElement('i');
        menuIcon.className = 'ItemAction fa fa-ellipsis-h';
        this.itemContentContainer.appendChild(menuIcon);
        menuIcon.onclick = (ev) => this.ItemMenu(ev);
        let deletionIcon = null;
        if (this.item.deletable) {
            deletionIcon = document.createElement('i');
            deletionIcon.className = 'ItemAction fa fa-trash';
            this.itemContentContainer.appendChild(deletionIcon);
            deletionIcon.onclick = (ev) => self.DeletionClicked(ev);
        }
        //The item name by itself
        let itemNameContainer = document.createElement('span');
        itemNameContainer.className = 'ItemNameContainer';
        this.itemName = document.createTextNode(this.item.name);
        itemNameContainer.appendChild(this.itemName);
        this.itemContentContainer.appendChild(itemNameContainer);
        //Handle left/right click on the item title
        this.itemContentContainer.onclick = (ev) => self.ItemClicked(ev);
        this.itemContentContainer.oncontextmenu = (ev) => this.ItemMenu(ev);
        //Handle Drag'n drop
        this.InitializeDrapNDrop();
        //Populate children
        this.itemChildContainer = document.createElement('div');
        this.itemChildContainer.className = 'ItemChildContainer';
        if (item instanceof PCLGroup) {
            this.UpdateGroupFolding(item);
        }
        this.container.appendChild(this.itemChildContainer);
        let children = item.GetChildren();
        for (let index = 0; index < children.length; index++) {
            this.AddSon(children[index]);
        }
        //Bind HTML content to match the actual state of the item
        item.AddChangeListener(this);
        item.AddChangeListener(this.dataHandler.selection);
    }
    static GetItemById(id) {
        let key = parseInt(id.replace(DataItem.IdPrefix, ''), 10);
        return DataItem.ItemsCache[key];
    }
    static GetId(uuid) {
        return DataItem.IdPrefix + uuid;
    }
    ClearDrapNDropStyles() {
        this.itemChildContainer.classList.remove('DropInside');
        this.container.classList.remove('DropBefore');
        this.container.classList.remove('DropAfter');
    }
    IsValidDragTaget() {
        return !(this.item instanceof Light) &&
            !(this.item.owner instanceof Scene) &&
            !(this.item instanceof Scene);
    }
    InitializeDrapNDrop() {
        if (!this.IsValidDragTaget())
            return;
        this.container.draggable = true;
        this.container.ondragstart = (ev) => {
            ev.stopPropagation();
            ev.dataTransfer.setData("application/my-app", (ev.target).id);
            ev.dataTransfer.dropEffect = 'move';
            if (PCLNode.IsPCLContainer(this.item)) {
                this.item.SetFolding(true);
            }
        };
        this.container.ondragover = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (!this.IsValidDragTaget())
                return;
            ev.dataTransfer.dropEffect = 'move';
            let target = (ev.target);
            if (PCLNode.IsPCLContainer(this.item) && target.classList.contains('ItemIcon')) {
                this.itemChildContainer.classList.add('DropInside');
                this.item.SetFolding(false);
            }
            else {
                if (ev.offsetY > this.itemContentContainer.clientHeight / 2) {
                    this.container.classList.remove('DropBefore');
                    this.container.classList.add('DropAfter');
                }
                else {
                    this.container.classList.remove('DropAfter');
                    this.container.classList.add('DropBefore');
                }
            }
        };
        this.container.ondragleave = (ev) => {
            ev.stopPropagation();
            this.ClearDrapNDropStyles();
        };
        this.container.ondragend = (ev) => {
            this.ClearDrapNDropStyles();
        };
        this.container.ondrop = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            let sourceId = ev.dataTransfer.getData("application/my-app");
            let source = DataItem.GetItemById(sourceId).item;
            let target = this.item;
            if (PCLNode.IsPCLContainer(target) && ev.target.classList.contains('ItemIcon')) {
                target.Add(source);
            }
            else {
                if (ev.offsetY > this.itemContentContainer.clientHeight / 2) {
                    (target.owner).Insert(source, target, PCLInsertionMode.After);
                }
                else {
                    (target.owner).Insert(source, target, PCLInsertionMode.Before);
                }
            }
            this.ClearDrapNDropStyles();
        };
    }
    // Hierarchy management
    AddSon(item, index = null) {
        let son = new DataItem(item, this.dataHandler);
        if (index === null) {
            this.sons.push(son);
            this.itemChildContainer.appendChild(son.GetContainerElement());
        }
        else {
            this.sons.splice(index, 0, son);
            this.itemChildContainer.insertBefore(son.GetContainerElement(), this.itemChildContainer.childNodes[index]);
        }
    }
    RemoveSon(index) {
        this.sons.splice(index, 1);
        this.itemChildContainer.removeChild(this.itemChildContainer.childNodes[index]);
    }
    SwapSons(a, b) {
        let son = this.sons[a];
        this.sons[a] = this.sons[b];
        this.sons[b] = son;
        let container = this.itemChildContainer;
        let child = container.removeChild(container.childNodes[a]);
        container.insertBefore(container.childNodes[b], container.childNodes[a]);
        container.insertBefore(child, container.childNodes.length > b ? container.childNodes[b] : null);
    }
    FindSon(item) {
        for (let index = 0; index < this.sons.length; index++) {
            if (this.sons[index].item === item)
                return index;
        }
        return -1;
    }
    Refresh() {
        if (this.item instanceof PCLGroup) {
            this.UpdateGroupFolding(this.item);
        }
        this.itemName.data = this.item.name;
        this.itemContentContainer.className = this.item.selected ? 'SelectedSceneItem' : 'SceneItem';
        this.itemIcon.className = 'ItemIcon fa ' + this.item.GetDisplayIcon();
        this.visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
    }
    RefreshChildsList() {
        let children = this.item.GetChildren();
        //First - check for insertions
        for (let index = 0; index < children.length; index++) {
            let child = children[index];
            let sonIndex = this.FindSon(child);
            if (sonIndex < 0) {
                this.AddSon(child, index);
            }
            else if (sonIndex != index) {
                this.SwapSons(sonIndex, index);
            }
        }
        //Now sons equals item.children from 0 to item.chidren.length. The remaining nodes must be removed
        while (this.sons.length > children.length) {
            this.RemoveSon(children.length);
        }
    }
    //Whenever the data changes, handle it
    NotifyChange(source, change) {
        this.Refresh();
        if (change & ChangeType.Creation) {
            if (!source.owner) {
                let owner = this.dataHandler.GetNewItemOwner();
                owner.Add(source);
            }
            this.dataHandler.DeclareNewItem(source);
        }
        if (change & ChangeType.Children) {
            this.RefreshChildsList();
        }
        if (change & ChangeType.Display) {
            this.dataHandler.AskRendering();
        }
        if (change & ChangeType.ColorScale) {
            this.dataHandler.RefreshColorScale();
        }
        if (change & ChangeType.Properties) {
            this.dataHandler.UpdateProperties();
        }
        if (change & ChangeType.TakeFocus) {
            this.dataHandler.FocusOnItem(source);
        }
    }
    //Group folding management - When clicking a group icon
    ItemFolded() {
        let self = this;
        return function (event) {
            self.item.ToggleFolding();
            self.CancelBubbling(event);
        };
    }
    UpdateGroupFolding(item) {
        this.itemChildContainer.style.display = item.folded ? 'none' : 'block';
    }
    //When left - clicking an item
    ItemClicked(ev) {
        let event = ev || window.event;
        if (event.ctrlKey) {
            this.item.ToggleSelection();
        }
        else {
            this.dataHandler.selection.SingleSelect(this.item);
            new TemporaryHint('You can select multiple items by pressing the CTRL key when clicking an element');
        }
        this.CancelBubbling(event);
    }
    //When right - clicking an item
    ItemMenu(ev) {
        let event = ev || window.event;
        if (!this.item.selected) {
            if (event.ctrlKey) {
                this.item.Select(true);
            }
            else {
                this.dataHandler.selection.SingleSelect(this.item);
            }
        }
        let actions = this.dataHandler.selection.GetActions(this.dataHandler.GetActionsDelegate());
        if (actions) {
            Popup.CreatePopup(this.itemContentContainer, actions);
        }
        this.CancelBubbling(event);
        return false;
    }
    //When clicking the visibility icon next to an item
    ViewClicked() {
        this.item.ToggleVisibility();
    }
    //When clicking the deletion icon next to an item
    DeletionClicked(ev) {
        let event = ev || window.event;
        if (confirm('Are you sure you want to delete "' + this.item.name + '" ?')) {
            this.item.Select(false);
            this.item.owner.Remove(this.item);
            this.CancelBubbling(event);
        }
    }
    CancelBubbling(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        else {
            event.cancelBubble = true;
        }
    }
    GetElement() {
        return this.container;
    }
    GetContainerElement() {
        return this.container;
    }
}
//Fast access to all the data items
DataItem.ItemsCache = [];
DataItem.IdPrefix = 'DataItem#';
/// <reference path="objects/pclnode.ts" />
/// <reference path="controls/properties/properties.ts" />
/// <reference path="../controler/actions/action.ts" />
/// <reference path="../model/boundingbox.ts" />
class SelectionList {
    constructor(changeHandler) {
        this.changeHandler = changeHandler;
        this.items = [];
    }
    RegisterListenableItem(item) {
        item.AddChangeListener(this);
        this.UpdateSelectionList(item);
    }
    NotifyChange(node, type) {
        if (type === ChangeType.Selection) {
            this.UpdateSelectionList(node);
        }
    }
    UpdateSelectionList(item) {
        let itemIndex = this.items.indexOf(item);
        if (item.selected && itemIndex < 0) {
            this.items.push(item);
            if (this.changeHandler) {
                this.changeHandler.OnSelectionChange(this);
            }
        }
        else if (!item.selected && itemIndex >= 0) {
            this.items.splice(itemIndex, 1);
            if (this.changeHandler) {
                this.changeHandler.OnSelectionChange(this);
            }
        }
    }
    GetBoundingBox() {
        let box = new BoundingBox();
        for (let index = 0; index < this.items.length; index++) {
            box.AddBoundingBox(this.items[index].GetBoundingBox());
        }
        return box;
    }
    Size() {
        return this.items.length;
    }
    GetProperties() {
        if (this.Size() == 1) {
            return this.items[0].GetProperties();
        }
        else if (this.Size() > 1) {
            if (!this.ownProperties) {
                let self = this;
                this.ownProperties = new Properties();
                this.ownProperties.Push(new NumberProperty('Selected items', () => self.Size(), null));
            }
            return this.ownProperties;
        }
        return null;
    }
    GetActions(delegate) {
        let actions = [];
        let self = this;
        if (this.Size() > 1) {
            actions.push(new SimpleAction('Hide all', () => this.ShowAll(false), 'Hide all the selected items'));
            actions.push(new SimpleAction('Show all', () => this.ShowAll(true), 'Show all the selected items'));
            actions.push(null);
        }
        if (this.Size() == 1) {
            actions = this.items[0].GetActions(delegate);
        }
        else if (this.Size() == 2) {
            let cloudindex = this.FindFirst(n => n instanceof PCLPointCloud);
            if (cloudindex >= 0) {
                actions = actions || [];
                let cloud = this.items[cloudindex];
                let other = this.items[1 - cloudindex];
                actions.push(new ComputeDistancesAction(cloud, other));
            }
            if (this.items[0] instanceof PCLPointCloud && this.items[1] instanceof PCLPointCloud) {
                actions.push(new RegistrationAction(this.items[0], this.items[1]));
            }
        }
        return actions;
    }
    FindFirst(test) {
        for (let index = 0; index < this.items.length; index++) {
            if (test(this.items[index]))
                return index;
        }
        return -1;
    }
    ShowAll(b) {
        for (let index = 0; index < this.Size(); index++) {
            this.items[index].SetVisibility(b);
        }
    }
    GetSingleSelection() {
        return this.items.length == 1 ? this.items[0] : null;
    }
    SingleSelect(node) {
        let changeHandler = this.changeHandler;
        this.changeHandler = null;
        if (node) {
            node.Select(true);
        }
        while (this.items.length) {
            let length = this.items.length;
            let last = this.items[length - 1];
            if (last != node) {
                last.Select(false);
            }
            if (this.items.length == length) {
                this.items.pop();
            }
        }
        if (node) {
            this.items.push(node);
        }
        this.changeHandler = changeHandler;
        this.changeHandler.OnSelectionChange(this);
    }
}
/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/pannel.ts" />
/// <reference path="controls/dataitem.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="objects/pclgroup.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="app.ts" />
/// <reference path="selectionlist.ts" />
/// <reference path="opengl/renderer.ts" />
/// <reference path="../controler/actions/delegate.ts" />
class DataHandler extends HideablePannel {
    constructor(scene, ownerView) {
        super('DataWindow', HandlePosition.Right);
        this.scene = scene;
        this.ownerView = ownerView;
        this.selection = new SelectionList(ownerView);
        this.dataArea = new Pannel('DataArea');
        this.propertiesArea = new Pannel('PropertiesArea');
        this.AddControl(this.dataArea);
        this.dataArea.AddControl(new DataItem(scene, this));
        this.AddControl(this.propertiesArea);
    }
    ReplaceScene(scene) {
        this.scene = scene;
        this.propertiesArea.Clear();
        this.dataArea.Clear();
        this.dataArea.AddControl(new DataItem(scene, this));
        this.AskRendering();
    }
    Resize(width, height) {
        let pannel = this.GetElement();
        pannel.style.height = (height - 2 * pannel.offsetTop) + 'px';
        this.RefreshSize();
        this.HandlePropertiesWindowVisibility();
    }
    HandlePropertiesWindowVisibility() {
        let pannel = this.GetElement();
        let dataArea = this.dataArea.GetElement();
        let propertiesArea = this.propertiesArea.GetElement();
        if (this.selection.GetProperties()) {
            let height = pannel.clientHeight / 2;
            dataArea.style.height = height + 'px';
            var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
            height -= delta;
            dataArea.style.height = height + 'px';
            propertiesArea.style.height = dataArea.style.height;
            dataArea.style.borderBottom = '1px solid lightGray';
            propertiesArea.style.borderTop = '1px solid darkGray';
        }
        else {
            let height = pannel.clientHeight;
            dataArea.style.height = height + 'px';
            var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
            height -= delta;
            dataArea.style.height = height + 'px';
            propertiesArea.style.height = "0px";
            dataArea.style.borderBottom = '';
            propertiesArea.style.borderTop = '';
        }
    }
    DeclareNewItem(item) {
        this.selection.RegisterListenableItem(item);
    }
    OnSelectionChange(selection) {
        this.UpdateProperties();
        this.ownerView.RefreshRendering();
        this.RefreshColorScale();
    }
    FocusOnItem(item) {
        this.selection.SingleSelect(item);
        this.ownerView.FocusOnCurrentSelection();
    }
    UpdateProperties() {
        let properties = this.selection.GetProperties();
        if (this.currentProperties !== properties) {
            this.currentProperties = properties;
            this.propertiesArea.Clear();
            if (properties) {
                this.propertiesArea.AddControl(properties);
            }
        }
        if (properties) {
            properties.Refresh();
        }
        this.HandlePropertiesWindowVisibility();
    }
    RefreshColorScale() {
        let item = this.selection.GetSingleSelection();
        if (item && (item instanceof PCLPointCloud)) {
            let cloud = item;
            let field = cloud.GetCurrentField();
            if (field)
                ColorScale.Show(field).Refresh();
            else
                ColorScale.Hide();
        }
        else
            ColorScale.Hide();
    }
    GetNewItemOwner() {
        let item = this.selection.GetSingleSelection();
        let owner = (item && item.owner && !(item instanceof LightsContainer)) ?
            item :
            this.scene.Contents;
        if (owner instanceof PCLGroup)
            return owner;
        return owner.owner;
    }
    GetSceneRenderer() {
        return this.ownerView.sceneRenderer;
    }
    GetActionsDelegate() {
        return this.ownerView;
    }
    AskRendering() {
        this.ownerView.RefreshRendering();
    }
}
/// <reference path="control.ts" />
/// <reference path="button.ts" />
class ComboBox {
    constructor(label, actions, isactive = null, hintMessage) {
        var self = this;
        this.button = new Button(new ActivableAction(label, () => {
            let options;
            if (Action.IsActionProvider(actions)) {
                options = actions.GetActions();
            }
            else {
                options = actions;
            }
            if (options && options.length) {
                Popup.CreatePopup(self.button, options);
            }
        }, isactive || (() => { true; }), hintMessage));
        this.UpdateEnabledState();
    }
    GetElement() {
        return this.button.GetElement();
    }
    UpdateEnabledState() {
        this.button.UpdateEnabledState();
    }
}
/// <reference path="control.ts" />
class ProgressBar {
    constructor(onstop = null) {
        this.control = document.createElement('div');
        this.control.className = 'ProgressControl';
        this.message = document.createElement('div');
        this.message.className = 'ProgressMessage';
        this.control.appendChild(this.message);
        this.container = document.createElement('div');
        this.container.className = 'ProgressContainer';
        this.control.appendChild(this.container);
        this.progress = document.createElement('div');
        this.progress.className = 'ProgressBar';
        this.container.appendChild(this.progress);
        this.nestedcontainer = document.createElement('div');
        this.nestedcontainer.className = 'NestedProgressContainer';
        this.control.appendChild(this.nestedcontainer);
        this.lastupdate = null;
        this.refreshtime = 10;
        this.updatedelay = 500;
    }
    Initialize(message, stopable = null) {
        this.SetMessage(message);
        this.Show();
        if (stopable && stopable.Stopable()) {
            let stopbtn = document.createElement('div');
            stopbtn.className = 'ProgressStop';
            stopbtn.innerText = 'Stop';
            stopbtn.onclick = () => stopable.Stop();
            this.control.appendChild(stopbtn);
        }
    }
    Finalize() {
        this.Delete();
    }
    RefreshDelay() {
        return this.refreshtime;
    }
    SetMessage(message) {
        this.message.innerHTML = '';
        this.message.appendChild(document.createTextNode(message));
    }
    Show() {
        if (ProgressBar.CurrentProgress) {
            ProgressBar.CurrentProgress.nestedcontainer.appendChild(this.control);
        }
        else {
            document.body.appendChild(this.control);
            ProgressBar.CurrentProgress = this;
        }
    }
    Delete() {
        if (this.control.parentNode && this.control.parentNode.contains(this.control)) {
            this.control.parentNode.removeChild(this.control);
        }
        if (ProgressBar.CurrentProgress === this) {
            ProgressBar.CurrentProgress = null;
        }
    }
    Update(current, total) {
        let now = (new Date()).getTime();
        if (this.lastupdate == null || (now - this.lastupdate) > this.updatedelay) {
            this.progress.innerText = (current / total * 100).toFixed(1) + '%';
            this.progress.style.width = ((current / total) * this.container.scrollWidth) + 'px';
            this.lastupdate = now;
            return true;
        }
        return false;
    }
    GetElement() {
        return this.control;
    }
}
/// <reference path="control.ts" />
/// <reference path="combobox.ts" />
/// <reference path="progressbar.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../files/csvloader.ts" />
/// <reference path="../../files/plyloader.ts" />
/// <reference path="../../files/pclloader.ts" />
class FileOpener extends Button {
    constructor(label, filehandler, hintMessage) {
        super(new SimpleAction(label, () => this.UploadFile(), hintMessage));
        this.label = label;
        this.filehandler = filehandler;
        let self = this;
        this.input = document.createElement('input');
        this.input.type = 'File';
        this.input.className = 'FileOpener';
        this.input.multiple = false;
        this.input.onchange = function () {
            self.LoadFile(self.input.files[0]);
        };
    }
    UploadFile() {
        this.input.value = null;
        this.input.accept = '.ply,.csv,.pcld';
        this.input.click();
    }
    LoadFile(file) {
        if (file) {
            let self = this;
            let progress = new ProgressBar();
            let reader = new FileReader();
            reader.onloadend = function () {
                progress.Delete();
                self.LoadFromContent(file.name, this.result);
            };
            reader.onprogress = function (event) {
                progress.Update(event.loaded, event.total);
            };
            reader.onabort = function (event) {
                console.warn('File loading aborted');
            };
            reader.onloadstart = function (event) {
                console.log('Start loading file');
            };
            reader.onerror = function (event) {
                console.error('Error while loading file');
            };
            progress.Show();
            progress.SetMessage('Loading file : ' + file.name);
            reader.readAsArrayBuffer(file);
        }
    }
    LoadFromContent(fileName, fileContent) {
        if (fileContent) {
            let extension = fileName.split('.').pop().toLocaleLowerCase();
            let loader = null;
            switch (extension) {
                case 'ply':
                    loader = new PlyLoader(fileContent);
                    break;
                case 'csv':
                    loader = new CsvLoader(fileContent);
                    break;
                case 'pcld':
                    loader = new PCLLoader(fileContent);
                    break;
                default:
                    alert('The file extension \"' + extension + '\" is not handled.');
                    break;
            }
            if (loader) {
                let self = this;
                loader.Load((result) => { self.filehandler(result); }, (error) => { alert(error); });
            }
        }
    }
}
/// <reference path="control.ts" />
class SelectDrop {
    constructor(label, options, selected, hintMessage) {
        let self = this;
        for (let index = 0; index < options.length; index++) {
            options[index].AddListener(this);
        }
        this.button = new Button(new SimpleAction(label, () => Popup.CreatePopup(self.button, self.GetAvailableOptions(options)), hintMessage));
        this.SetCurrent(options[selected].GetLabel(false));
    }
    GetAvailableOptions(options) {
        let availableOptions = [];
        for (let index = 0; index < options.length; index++) {
            let option = options[index];
            if (option.GetLabel(false) !== this.button.GetLabel()) {
                availableOptions.push(option);
            }
        }
        return availableOptions;
    }
    GetElement() {
        return this.button.GetElement();
    }
    SetCurrent(current) {
        this.button.SetLabel(current);
    }
    OnTrigger(action) {
        this.SetCurrent(action.GetLabel(false));
    }
}
/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/toolbar.ts" />
/// <reference path="controls/fileopener.ts" />
/// <reference path="controls/button.ts" />
/// <reference path="controls/selectdrop.ts" />
/// <reference path="app.ts" />
/// <reference path="../controler/actions/cameracenter.ts" />
/// <reference path="../controler/actions/controlerchoice.ts" />
class Menu extends HideablePannel {
    constructor(application) {
        super('MenuToolbar', HandlePosition.Bottom);
        this.application = application;
        this.toolbar = new Toolbar();
        this.container.AddControl(this.toolbar);
        let dataHandler = application.dataHandler;
        // ================================
        // Open a file
        this.toolbar.AddControl(new FileOpener('[Icon:file-o]', function (createdObject) {
            if (createdObject != null) {
                if (createdObject instanceof Scene) {
                    dataHandler.ReplaceScene(createdObject);
                }
                else {
                    let owner = dataHandler.GetNewItemOwner();
                    owner.Add(createdObject);
                    createdObject.NotifyChange(createdObject, ChangeType.NewItem);
                }
            }
        }, 'Load data from a file'));
        // ================================
        // Save the current state
        this.toolbar.AddControl(new Button(new SimpleAction('[Icon:save]', () => {
            application.SaveCurrentScene();
        }, 'Save the scene data to your browser storage (data will be automatically retrieved on next launch)')));
        // ================================
        // Action for the current selection
        this.selectionActions = this.toolbar.AddControl(new ComboBox('[Icon:bars]', this, () => {
            return application.dataHandler.selection && application.dataHandler.selection.Size() > 0;
        }, 'Contextual menu : list of actions available for the current selection.'));
        // ================================
        // Focus on the current selection
        this.focusSelection = this.toolbar.AddControl(new Button(new ActivableAction('[Icon:crosshairs]', () => {
            application.FocusOnCurrentSelection();
        }, () => {
            return application.CanFocus();
        }, 'Focus current viewpoint on the selected item')));
        // ================================
        // Change the current mode
        this.toolbar.AddControl(new SelectDrop('[Icon:desktop] Mode', [
            application.RegisterShortCut(new CameraModeAction(application)),
            application.RegisterShortCut(new TransformModeAction(application)),
            application.RegisterShortCut(new LightModeAction(application))
        ], 0, 'Change the current working mode (how the mouse/keyboard are considered to interact with the scene)'));
        // ================================
        // Eye dome lighting
        this.toolbar.AddControl(new Button(new SimpleAction('[Icon:flash]', function () {
            application.ToggleRendering(RenderingMode.EDL);
        }, 'Toggle the Eye Dome Lighting filter.')));
        // ================================
        // Help menu
        this.toolbar.AddControl(new Button(new SimpleAction('[Icon:question-circle]', function () {
            window.open('help.html', '_blank');
        })));
    }
    Clear() {
        this.toolbar.Clear();
    }
    GetActions() {
        return this.application.dataHandler.selection.GetActions(this.application);
    }
    OnSelectionChange(selection) {
        this.focusSelection.UpdateEnabledState();
        this.selectionActions.UpdateEnabledState();
    }
}
/// <reference path="control.ts" />
/// <reference path="../coordinatessystem.ts" />
/// <reference path="../../maths/vector.ts" />
class AxisLabel {
    constructor(label, axis, system) {
        this.label = label;
        this.axis = axis;
        this.system = system;
        let color = axis.Normalized().Times(160).Flatten();
        this.container = document.createElement('div');
        this.container.className = 'AxisLabel';
        this.container.style.color = 'rgb(' + color.join(',') + ')';
        this.container.appendChild(document.createTextNode(label));
        this.container.onclick = (event) => {
            system.ChangeViewAxis(axis);
        };
    }
    GetElement() {
        return this.container;
    }
    Refresh() {
        let camera = this.system.renderer.camera;
        let projection = camera.ComputeProjection(this.axis, true);
        let ownerRect = this.system.GetElement().getBoundingClientRect();
        this.container.style.left = (ownerRect.left + projection.Get(0)) + 'px';
        this.container.style.top = (ownerRect.bottom - projection.Get(1)) + 'px';
        this.depth = projection.Get(2);
    }
    UpdateDepth(axes) {
        let order = 0;
        for (var index = 0; index < axes.length; index++) {
            if (this.depth < axes[index].depth) {
                order++;
            }
        }
        this.container.style.zIndex = '' + (2 + order);
    }
}
/// <reference path="controls/control.ts" />
/// <reference path="controls/axislabel.ts" />
/// <reference path="app.ts" />
/// <reference path="opengl/renderer.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="objects/light.ts" />
/// <reference path="objects/pclcylinder.ts" />
/// <reference path="../model/shapes/cylinder.ts" />
/// <reference path="../maths/vector.ts" />
class CoordinatesSystem {
    constructor(view) {
        this.view = view;
        let self = this;
        //Create the coordinates axes to be rendered
        let axes = [
            new PCLCylinder(new Cylinder(new Vector([.5, .0, .0]), new Vector([1.0, .0, .0]), .1, 1.0)),
            new PCLCylinder(new Cylinder(new Vector([.0, .5, .0]), new Vector([.0, 1.0, .0]), .1, 1.0)),
            new PCLCylinder(new Cylinder(new Vector([.0, .0, .5]), new Vector([.0, .0, 1.0]), .1, 1.0))
        ];
        this.coordssystem = new Scene();
        for (let index = 0; index < axes.length; index++) {
            axes[index].SetBaseColor(axes[index].cylinder.axis.Flatten());
            this.coordssystem.Contents.Add(axes[index]);
            axes[index].AddChangeListener(this);
        }
        //Refine lighting
        let light = this.coordssystem.Lights.children[0];
        this.coordssystem.Lights.Add(new Light(light.position.Times(-1.0)));
        //Create labels
        this.axesLabels = [
            new AxisLabel('X', new Vector([1.0, .0, .0]), this),
            new AxisLabel('Y', new Vector([.0, 1.0, .0]), this),
            new AxisLabel('Z', new Vector([.0, .0, 1.0]), this)
        ];
        for (var index = 0; index < this.axesLabels.length; index++) {
            document.body.appendChild(this.axesLabels[index].GetElement());
        }
        //Create the coordinates rendering component
        this.renderer = new Renderer('CoordsRendering');
        this.renderer.camera.CenterOnBox(this.coordssystem.Contents.GetBoundingBox());
        this.renderer.camera.to = new Vector([.0, .0, .0]);
        this.showAxesLabels = true;
    }
    Refresh() {
        let mainCamera = this.MainRenderer.camera;
        this.renderer.camera.SetDirection(mainCamera.GetDirection(), mainCamera.up);
        this.renderer.RefreshSize();
        this.renderer.Draw(this.coordssystem);
        for (var index = 0; index < this.axesLabels.length; index++) {
            this.axesLabels[index].Refresh();
        }
        for (var index = 0; index < this.axesLabels.length; index++) {
            this.axesLabels[index].UpdateDepth(this.axesLabels);
        }
    }
    GetElement() {
        return this.renderer.GetElement();
    }
    ChangeViewAxis(axis) {
        this.MainRenderer.camera.SetDirection(axis, axis.GetOrthogonnal());
        this.view.RefreshRendering();
    }
    get MainRenderer() {
        return this.view.sceneRenderer;
    }
    NotifyChange(node) {
        this.renderer.Draw(this.coordssystem);
        this.view.RefreshRendering();
    }
}
/// <reference path="opengl/renderer.ts" />
/// <reference path="datahandler.ts" />
/// <reference path="menu.ts" />
/// <reference path="coordinatessystem.ts" />
/// <reference path="controls/progressbar.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="objects/pclprimitive.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../controler/controler.ts" />
/// <reference path="../controler/actions/delegate.ts" />
/// <reference path="../controler/mousecontroler.ts" />
/// <reference path="../controler/cameracontroler.ts" />
/// <reference path="../files/pclserializer.ts" />
/// <reference path="../files/pclloader.ts" />
//===========================================
// Entry point for the point cloud application
// Invoke PCLApp.Run() to start the whole thing
//===========================================
class PCLApp {
    constructor() {
        this.shortcuts = {};
        let scenebuffer = null;
        try {
            scenebuffer = window.localStorage.getItem(PCLApp.sceneStorageKey);
        }
        catch (e) {
            scenebuffer = null;
            console.warn('Could not load data from local storage');
        }
        if (scenebuffer) {
            console.info('Loading locally stored data');
            let loader = new PCLLoader(scenebuffer);
            let self = this;
            loader.Load((scene) => self.Initialize(scene), (error) => {
                console.error('Failed to initialize scene from storage : ' + error);
                console.warn('Start from an empty scene, instead');
                self.Initialize(new Scene());
            });
        }
        else {
            console.info('Initializing a brand new scene');
            this.Initialize(new Scene());
        }
    }
    static Run() {
        if (!PCLApp.instance) {
            PCLApp.instance = new PCLApp();
        }
    }
    Initialize(scene) {
        let self = this;
        this.InitializeLongProcess();
        this.InitializeDataHandler(scene);
        this.InitializeRenderers(scene);
        this.InitializeMenu();
        this.Resize();
        window.onresize = function () {
            self.Resize();
        };
        this.RefreshRendering();
        scene.SetFolding(false);
        scene.Contents.SetFolding(false);
        scene.Lights.SetFolding(true);
    }
    InitializeLongProcess() {
        LongProcess.progresFactory = () => new ProgressBar();
    }
    InitializeDataHandler(scene) {
        let self = this;
        this.dataHandler = new DataHandler(scene, this);
        document.body.appendChild(self.dataHandler.GetElement());
    }
    InitializeMenu() {
        let self = this;
        this.menu = new Menu(this);
        document.body.appendChild(self.menu.GetElement());
    }
    InitializeRenderers(scene) {
        //Create the scene rendering component
        this.sceneRenderer = new Renderer('SceneRendering');
        document.body.appendChild(this.sceneRenderer.GetElement());
        //Create the coordinates axes to be rendered
        this.coordinatesSystem = new CoordinatesSystem(this);
        document.body.appendChild(this.coordinatesSystem.GetElement());
        //Create the default controler (camera controler)
        this.SetCurrentControler(new CameraControler(this), false);
        this.sceneRenderer.Draw(scene);
        this.coordinatesSystem.Refresh();
    }
    Resize() {
        if (this.sceneRenderer) {
            this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
        }
        if (this.dataHandler) {
            this.dataHandler.Resize(window.innerWidth, window.innerHeight);
        }
        if (this.menu) {
            this.menu.RefreshSize();
        }
        this.RefreshRendering();
    }
    RenderScene() {
        if (this.sceneRenderer) {
            this.sceneRenderer.Draw(this.dataHandler.scene);
        }
    }
    RefreshRendering() {
        this.RenderScene();
        if (this.coordinatesSystem) {
            this.coordinatesSystem.Refresh();
        }
    }
    SaveCurrentScene() {
        //Dry run (to get the buffer size)
        let serializer = new PCLSerializer(null);
        this.dataHandler.scene.Serialize(serializer);
        let bufferSize = serializer.GetBufferSize();
        //Actual serialization
        serializer = new PCLSerializer(bufferSize);
        this.dataHandler.scene.Serialize(serializer);
        try {
            window.localStorage.setItem(PCLApp.sceneStorageKey, serializer.GetBufferAsString());
            let data = window.localStorage.getItem(PCLApp.sceneStorageKey);
            if (data.length != serializer.GetBufferSize()) {
                console.info('Integrity check failure. Cannot save data to the local storage.');
                window.localStorage.setItem(PCLApp.sceneStorageKey, '');
            }
            console.info('Scene data have been sucessfully saved to local storage.');
        }
        catch (e) {
            let message = 'The data cannot be saved to your browser local storage :\n';
            message += '"' + e + '"\n';
            message += 'Do you want to save the scene data to a local file, instead ?\n';
            message += '(You can load the generated file using the leftmost menu entry)';
            if (confirm(message)) {
                this.dataHandler.scene.SaveToFile();
            }
        }
    }
    //=========================================
    // Implement Controlable interface
    //=========================================
    GetViewPoint() {
        return this.sceneRenderer.camera;
    }
    GetLightPosition(takeFocus) {
        let scene = this.dataHandler.scene;
        let light;
        if (scene.Lights.children.length == 1) {
            light = scene.Lights.children[0];
            if (takeFocus) {
                this.dataHandler.selection.SingleSelect(light);
            }
        }
        else {
            let item = this.dataHandler.selection.GetSingleSelection();
            if (item && item instanceof Light) {
                light = item;
            }
        }
        return light;
    }
    GetCurrentTransformable() {
        let item = this.dataHandler.selection.GetSingleSelection();
        if (item && item instanceof PCLPrimitive)
            return item;
        return null;
    }
    NotifyControlStart() {
        this.dataHandler.TemporaryHide();
        this.menu.TemporaryHide();
    }
    NotifyControlEnd() {
        this.dataHandler.RestoreVisibility();
        this.menu.RestoreVisibility();
    }
    NotifyPendingControl() {
    }
    NotifyViewPointChange(c) {
        if (this.coordinatesSystem) {
            if (c === ViewPointChange.Rotation || c === ViewPointChange.Position) {
                this.coordinatesSystem.Refresh();
            }
        }
        this.RenderScene();
    }
    NotifyTransform() {
        this.RenderScene();
    }
    GetRengeringArea() {
        return this.sceneRenderer.GetElement();
    }
    SetCurrentControler(controler, refresh = true) {
        this.currentControler = controler;
        this.sceneRenderer.drawingcontext.bboxcolor = controler.GetSelectionColor();
        if (refresh) {
            this.RefreshRendering();
        }
    }
    GetCurrentControler() {
        return this.currentControler;
    }
    PickItem(x, y, exclusive) {
        let scene = this.dataHandler.scene;
        let selected = this.sceneRenderer.PickObject(x, y, scene);
        if (exclusive) {
            this.dataHandler.selection.SingleSelect(selected);
        }
        else if (selected && (selected instanceof PCLNode)) {
            selected.Select(true);
        }
    }
    FocusOnCurrentSelection() {
        let selection = this.dataHandler.selection;
        let selectionbb = selection.GetBoundingBox();
        if (selectionbb && this.sceneRenderer.camera.CenterOnBox(selectionbb)) {
            this.sceneRenderer.Draw(this.dataHandler.scene);
        }
    }
    HasSelection() {
        return this.dataHandler.selection.Size() > 0;
    }
    CanFocus() {
        let selectionbb = this.dataHandler.selection.GetBoundingBox();
        return (selectionbb && selectionbb.IsValid());
    }
    ToggleRendering(mode) {
        let rendering = this.sceneRenderer.drawingcontext.rendering;
        let message = null;
        function getState(state) {
            return state ? '<b style="color:green;">ON</b>' : '<b style="color:red;">OFF</b>';
        }
        switch (mode) {
            case RenderingMode.Point:
                let point = rendering.Point(!rendering.Point());
                message = "Point representation : " + getState(point);
                break;
            case RenderingMode.Wire:
                let wire = rendering.Wire(!rendering.Wire());
                message = "Wire representation : " + getState(wire);
                break;
            case RenderingMode.Surface:
                let surface = rendering.Surface(!rendering.Surface());
                message = "Surface representation : " + getState(surface);
                break;
            case RenderingMode.EDL:
                let edl = rendering.EDL(!rendering.EDL());
                message = "Eye Dome Lighting : " + getState(edl);
                break;
        }
        if (message)
            new TemporaryHint(message);
        this.RenderScene();
    }
    RegisterShortCut(action) {
        let shortcut = action.GetShortCut();
        if (shortcut) {
            let key = shortcut.toLowerCase();
            if (!(key in this.shortcuts)) {
                this.shortcuts[key] = action;
            }
            else {
                console.error('Shortcut "' + shortcut + '" is being registered multiples times.');
            }
        }
        return action;
    }
    HandleShortcut(key) {
        let action = this.shortcuts[key.toLowerCase()];
        if (action && action.Enabled()) {
            action.Run();
            return true;
        }
        return false;
    }
    //===================================
    // Implement ActionsDelegate interface
    // ==================================
    ScanFromCurrentViewPoint(group, hsampling, vsampling, noise) {
        this.sceneRenderer.ScanFromCurrentViewPoint(group, hsampling, vsampling, noise);
    }
    GetShapesSampling() {
        return this.sceneRenderer.drawingcontext.sampling;
    }
    //===================================
    // Implement Notifiable interface
    // ==================================
    NotifyChange(source) {
        this.RenderScene();
    }
    //===================================
    // Implement SelectionChangeHandler interface
    // ==================================
    OnSelectionChange(selectionList) {
        this.dataHandler.OnSelectionChange(selectionList);
        this.menu.OnSelectionChange(selectionList);
    }
}
PCLApp.sceneStorageKey = 'PointCloudLab-Scene';
class IterativeRootFinder {
    constructor(derivatives) {
        this.derivatives = derivatives;
        this.Run = function (initialGuess, step) {
            let current = initialGuess;
            for (var index = 0; index < this.maxIterations; index++) {
                let values = [];
                for (var order = 0; order < this.derivatives.length; order++) {
                    values.push(this.derivatives[order](current));
                }
                if (Math.abs(values[0]) <= this.resultTolerance)
                    return current;
                let delta = step(current, values);
                if (delta == null || Math.abs(delta) <= this.minStepMagnitude)
                    return null;
                current += delta;
            }
            return null;
        };
        this.maxIterations = 100;
        this.resultTolerance = 1.0e-7;
        this.minStepMagnitude = 1.0e-8;
    }
    static NewtonRaphsonStep(x, derivativesValues) {
        if (Math.abs(derivativesValues[1]) < 1.0e-12) {
            return null;
        }
        return -derivativesValues[0] / derivativesValues[1];
    }
    static HalleyStep(x, derivativesValues) {
        var delta = (2.0 * derivativesValues[1] * derivativesValues[1]) - (derivativesValues[0] * derivativesValues[2]);
        if (Math.abs(delta) < 1.0e-12) {
            return null;
        }
        return -2.0 * derivativesValues[0] * derivativesValues[1] / delta;
    }
}
/// <reference path="rootsfinding.ts" />
class Polynomial {
    //Coefs are given from lowest degree to higher degree
    constructor(coefficients) {
        this.coefficients = coefficients;
    }
    Degree() {
        return this.coefficients.length - 1;
    }
    Evaluate(x) {
        var index = this.coefficients.length - 1;
        var result = index >= 0 ? this.coefficients[index] : 0.0;
        while (index > 0) {
            index--;
            result = result * x + this.coefficients[index];
        }
        return result;
    }
    Derivate() {
        let coefs = [];
        for (let index = 1; index < this.coefficients.length; index++) {
            coefs.push(index * this.coefficients[index]);
        }
        return new Polynomial(coefs);
    }
    //Devide current polynomial by (x - a)
    Deflate(a) {
        var index = this.coefficients.length - 1;
        var coef = [];
        var remainder = 0.0;
        if (index > 0) {
            coef = new Array(index);
            remainder = this.coefficients[index];
            do {
                index--;
                coef[index] = remainder;
                remainder = this.coefficients[index] + remainder * a;
            } while (index > 0);
        }
        return new Polynomial(coef);
    }
    FindRealRoots(initialGuess) {
        let result = [];
        let degree = this.Degree();
        let root = initialGuess;
        let polynomial = this;
        while (root != null && result.length < degree) {
            var firstOrderDerivative = polynomial.Derivate();
            var secondOrderDerivative = firstOrderDerivative.Derivate();
            var solver = new IterativeRootFinder([
                function (x) { return polynomial.Evaluate(x); },
                function (x) { return firstOrderDerivative.Evaluate(x); },
                function (x) { return secondOrderDerivative.Evaluate(x); }
            ]);
            root = solver.Run(root, IterativeRootFinder.HalleyStep);
            if (root !== null) {
                result.push(root);
                polynomial = polynomial.Deflate(root);
            }
        }
        return result;
    }
}
/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
/// <reference path="eigendecomposition.ts" />
//Sigular values decomposition
class SVD {
    constructor(matrix) {
        if (matrix.width != matrix.height) {
            throw 'Singular Values Decomposition has not been implemented for non squared matrices';
        }
        this.sigma = matrix.Clone();
        this.lhh = [];
        this.rhh = [];
        this.lgg = [];
        this.rgg = [];
        this.signs = Matrix.Identity(matrix.width);
        // Computes B = H[n-1] ... H[2]H[1].M.G*[1].G*[2] ... G*[n-2]
        // B being a bidiagonnal matrix
        // ()* denotes the transposed matrix
        // B is stored in this.sigma at the end the of this routine
        // H's are stored in this.lhh
        // G's are stored in this.rhh
        this.HouseholderDecomposition();
        // Computes Sigma = L[k] ... L[2]L[1].B.R*[1].R*[2] ... R*[k]
        // Sigma being a diagonnal matrix
        // L's are stored in this.lgg
        // R's are stored in this.rgg
        this.GivensDecomposition();
        //Singular values are supposed to be positive
        for (let index = 0; index < this.signs.width; index++) {
            if (this.sigma.GetValue(index, index) < 0) {
                this.signs.SetValue(index, index, -1);
            }
        }
    }
    HouseholderDecomposition() {
        this.lhh = [];
        this.rhh = [];
        let width = this.sigma.width;
        for (let index = 0; index < width - 1; index++) {
            this.lhh.push(this.GetHouseholderTransform(index, false));
            if (index < width - 2) {
                this.rhh.push(this.GetHouseholderTransform(index, true));
            }
        }
    }
    GivensDecomposition() {
        this.lgg = [];
        this.rgg = [];
        let width = this.sigma.width;
        for (let index = 0; index <= 200; index++) {
            if (this.sigma.IsDiagonnal())
                break;
            for (let index = 0; index < width - 1; index++) {
                this.rgg.push(this.GetGivensTransform(index, true));
                this.lgg.push(this.GetGivensTransform(index, false));
            }
        }
    }
    GetHouseholderTransform(index, right = false) {
        let v = right ?
            this.sigma.GetRowVector(index, index + 1) :
            this.sigma.GetColumnVector(index, index);
        //Compute v +- ||v||.e1    (with e1 = [1, 0, 0, ..., 0])
        let a = v.Get(0) > 0 ? -v.Norm() : v.Norm();
        v.Set(0, v.Get(0) - a);
        let householder = new HouseholderReflexion(v);
        householder.ApplyTo(this.sigma, right);
        return householder;
    }
    GetGivensTransform(index, right) {
        let f = this.sigma.GetValue(index, index);
        let g = this.sigma.GetValue(right ? index : index + 1, right ? index + 1 : index);
        let givens = new GivensRotation(index, f, g);
        givens.ApplyTo(this.sigma, right);
        return givens;
    }
    //=============================================
    // Matrices accessors
    //=============================================
    // From B = H[n-1] ... H[2]H[1]  .  M  .  G*[1].G*[2] ... G*[n-2]
    // => we get M = (H[n-1] ... H[2]H[1])*  .  B  .  (G*[1].G*[2] ... G*[n-2])*
    //           M =        U1               .  B  .          V1*
    // Then, from Sigma = L[k] ... L[2]L[1]  .  B  .  R*[1].R*[2] ... R*[k]
    // => we get B = (L[k] ... L[2]L[1])*  .  Sigma  .  (R*[1].R*[2] ... R*[k])*
    //           B =        U2             .  Sigma  .          V2*
    // Hence M = (U1.U2) . Sigma . (V1.V2)* 
    // Furthermore, we introduce signs correction matrix (being its own inverse : Sign . Sign = Id)
    // in order to get positive singular values :
    // Finally : M = (U1.U2.Sign) . (Sign.Sigma) . (V1.V2)*
    GetU() {
        let u = this.signs.Clone();
        let ggsize = this.lgg.length;
        // U2 = L*[1].L*[2] ... L*[k]
        for (let index = ggsize - 1; index >= 0; index--) {
            this.lgg[index].Transposed().ApplyTo(u);
        }
        let hhsize = this.lhh.length;
        // U1 = H*[1].H*[2] ... H*[n-1]
        // H being symmetric => H* = H, thus U1 = H[1].H[2] ... H[n-1]
        for (let index = hhsize - 1; index >= 0; index--) {
            this.lhh[index].ApplyTo(u);
        }
        return u;
    }
    GetV() {
        let v = Matrix.Identity(this.sigma.width);
        let ggsize = this.rgg.length;
        // V2 = R*[1].R*[2] ... R*[k]
        for (let index = ggsize - 1; index >= 0; index--) {
            this.rgg[index].Transposed().ApplyTo(v);
        }
        let hhsize = this.rhh.length;
        // V1 = G*[1].G*[2] ... G*[n-2]
        // G being symmetric => G* = G, thus V1 = G[1].G[2] ... G[n-1]
        for (let index = hhsize - 1; index >= 0; index--) {
            this.rhh[index].ApplyTo(v);
        }
        return v;
    }
    GetVTransposed() {
        //V* = (V1.V2)* = V2* . V1* . Identity
        let v = Matrix.Identity(this.sigma.width);
        let hhsize = this.rhh.length;
        // V1* = G[n-2] ... G[2].G[1]
        for (let index = 0; index < hhsize; index++) {
            this.rhh[index].ApplyTo(v);
        }
        let ggsize = this.rgg.length;
        // V2* = R[k] ... R[2].R[1]
        for (let index = 0; index < ggsize; index++) {
            this.rgg[index].ApplyTo(v);
        }
        return v;
    }
    GetSigma() {
        return this.signs.Multiply(this.sigma.Clone());
    }
}
// Householder maps any vector to its symmetric with respect to the plane orthognal to a given vector v
class HouseholderReflexion {
    constructor(v) {
        this.v = v;
    }
    Reflect(a) {
        let v = this.v.Clone();
        while (v.Dimension() < a.Dimension()) {
            v.coordinates = [0].concat(v.coordinates);
        }
        let s = 2.0 * a.Dot(v) / v.SqrNorm();
        return a.Minus(v.Times(s));
    }
    ApplyTo(m, right = false) {
        for (let index = 0; index < m.width; index++) {
            if (right) {
                m.SetRowVector(index, this.Reflect(m.GetRowVector(index)));
            }
            else {
                m.SetColumnVector(index, this.Reflect(m.GetColumnVector(index)));
            }
        }
    }
    GetMatrix() {
        let d = this.v.Dimension();
        let v = new Matrix(1, d, new Float32Array(this.v.Flatten()));
        return Matrix.Identity(d).Plus(v.Multiply(v.Transposed()).Times(-2 / this.v.SqrNorm()));
    }
}
// Givens rotation can by used to vanish the value in a matrix at a specific position
// It is based on the following transform (f, g being given) :
// | c   s | . | f | = | r |
// | -s  c |   | g |   | 0 |
class GivensRotation {
    constructor(index, f, g) {
        this.index = index;
        if (f == 0) {
            this.c = 0;
            this.s = 1;
        }
        else if (Math.abs(f) > Math.abs(g)) {
            let t = g / f;
            let tt = Math.sqrt(1 + t ** 2);
            this.c = 1 / tt;
            this.s = t / tt;
        }
        else {
            let t = f / g;
            let tt = Math.sqrt(1 + t ** 2);
            this.s = 1.0 / tt;
            this.c = t * this.s;
        }
    }
    Transposed() {
        let t = new GivensRotation(this.index, 0, 0);
        t.c = this.c;
        t.s = -this.s;
        return t;
    }
    Rotate(a) {
        let v = a.Clone();
        v.Set(this.index, (this.c * a.Get(this.index)) + (this.s * a.Get(this.index + 1)));
        v.Set(this.index + 1, (this.c * a.Get(this.index + 1)) - (this.s * a.Get(this.index)));
        return v;
    }
    ApplyTo(matrix, right = false) {
        for (let index = 0; index < matrix.width; index++) {
            if (right) {
                matrix.SetRowVector(index, this.Rotate(matrix.GetRowVector(index)));
            }
            else {
                matrix.SetColumnVector(index, this.Rotate(matrix.GetColumnVector(index)));
            }
        }
    }
}
/// <reference path="kdtree.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="neighbourhood.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/matrix.ts" />
/// <reference path="../maths/geometry.ts" />
/// <reference path="../maths/svd.ts" />
/// <reference path="../tools/transform.ts" />
class ICPPairing {
    constructor(cloudIndex, refIndex, sqrdist) {
        this.cloudIndex = cloudIndex;
        this.refIndex = refIndex;
        this.sqrdist = sqrdist;
    }
    static Compare(a, b) {
        return a.sqrdist - b.sqrdist;
    }
}
//Trimed Iterative Closest Point implementation
class ICPRegistration extends IterativeLongProcess {
    constructor(reference, cloud, overlap = 1, maxiterations = 100, stabilityfactor = 0.01) {
        super(maxiterations, 'Iterative closest point registration');
        this.reference = reference;
        this.cloud = cloud;
        this.overlap = overlap;
        this.maxiterations = maxiterations;
        this.stabilityfactor = stabilityfactor;
    }
    Initialize() {
        if (!this.reference.tree) {
            this.reference.tree = new KDTree(this.reference);
        }
        this.trmse = null;
        this.done = false;
    }
    get Done() {
        return this.done || this.currentstep >= this.maxiterations;
    }
    get Trim() {
        return Math.round(this.cloud.Size() * this.overlap);
    }
    Iterate() {
        //Pair each cloud point with its clostest neighbour in reference
        let pairing;
        let size = this.cloud.Size();
        pairing = new Array(size);
        for (let index = 0; index < size; index++) {
            let nn = this.reference.KNearestNeighbours(this.cloud.GetPoint(index), 1).Neighbours()[0];
            pairing[index] = new ICPPairing(index, nn.index, nn.sqrdistance);
        }
        //Trim pairing
        let trim = this.Trim;
        pairing.sort(ICPPairing.Compare);
        pairing = pairing.slice(0, trim);
        //Evaluate the Trimmed Mean Square Error (and then compare with the last one)
        let mse = 0;
        for (let index = 0; index < trim; index++) {
            mse += pairing[index].sqrdist;
        }
        mse /= trim;
        //Stop when stability is reached
        if (this.trmse !== null && ((this.trmse - mse) < this.trmse * this.stabilityfactor)) {
            this.done = true;
            return;
        }
        this.trmse = mse;
        //Build the corresponding point clouds
        let refIndices = new Array(trim);
        let cloudIndices = new Array(trim);
        for (let index = 0; index < trim; index++) {
            refIndices[index] = pairing[index].refIndex;
            cloudIndices[index] = pairing[index].cloudIndex;
        }
        let refSub = new PointSubCloud(this.reference, refIndices);
        let cloudSub = new PointSubCloud(this.cloud, cloudIndices);
        //Get the transform
        let refCentroid = Geometry.Centroid(refSub);
        let cloudCentroid = Geometry.Centroid(cloudSub);
        let covariance = Matrix.Null(3, 3);
        for (let index = 0; index < trim; index++) {
            let x = cloudSub.GetPoint(index).Minus(cloudCentroid);
            let y = refSub.GetPoint(index).Minus(refCentroid);
            for (let ii = 0; ii < 3; ii++) {
                for (let jj = 0; jj < 3; jj++) {
                    covariance.AddValue(ii, jj, x.Get(ii) * y.Get(jj));
                }
            }
        }
        //Rigid motion computation
        let svd = new SVD(covariance);
        let rigidMotion = new Transform();
        rigidMotion.SetRotation(svd.GetV().Multiply(svd.GetU().Transposed()));
        rigidMotion.SetTranslation(refCentroid.Minus(rigidMotion.TransformPoint(cloudCentroid)));
        //Apply the computed transform
        this.cloud.ApplyTransform(rigidMotion);
    }
}
//# sourceMappingURL=PointCloudLab.js.map