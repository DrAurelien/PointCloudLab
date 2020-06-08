var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MouseTracker = /** @class */ (function () {
    function MouseTracker(event) {
        this.x = event.clientX;
        this.y = event.clientY;
        this.button = event.which;
        this.date = new Date();
        this.ctrlKey = event.ctrlKey;
    }
    MouseTracker.prototype.IsQuickEvent = function () {
        var now = new Date();
        return (now.getTime() - this.date.getTime() < MouseTracker.quickeventdelay);
    };
    MouseTracker.prototype.UpdatePosition = function (event) {
        var delta = new MouseDisplacement(event.clientX - this.x, event.clientY - this.y, this.button);
        this.x = event.clientX;
        this.y = event.clientY;
        return delta;
    };
    MouseTracker.quickeventdelay = 200;
    return MouseTracker;
}());
var MouseDisplacement = /** @class */ (function () {
    function MouseDisplacement(dx, dy, button) {
        this.dx = dx;
        this.dy = dy;
        this.button = button;
    }
    MouseDisplacement.prototype.IsNull = function () {
        return (this.dx == 0 && this.dy == 0);
    };
    return MouseDisplacement;
}());
var Vector = /** @class */ (function () {
    function Vector(coords) {
        this.Log = function () {
            var message = '| ';
            for (var index = 0; index < this.coordinates.length; index++) {
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
    Vector.prototype.Flatten = function () {
        return this.coordinates;
    };
    Vector.prototype.Clone = function () {
        return new Vector(this.coordinates.slice());
    };
    Vector.prototype.Dimension = function () {
        return this.coordinates.length;
    };
    Vector.prototype.Get = function (index) {
        return this.coordinates[index];
    };
    Vector.prototype.isNaN = function () {
        for (var index = 0; index < this.coordinates.length; index++) {
            if (isNaN(this.coordinates[index])) {
                return true;
            }
        }
        return false;
    };
    Vector.prototype.Set = function (index, value) {
        this.coordinates[index] = value;
    };
    //Sum of two vectors
    Vector.prototype.Plus = function (v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot add vectors with different dimensions';
        }
        var result = new Array(this.coordinates.length);
        for (var index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] + v.coordinates[index];
        }
        return new Vector(result);
    };
    //Sum in place
    Vector.prototype.Add = function (v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot add vectors with different dimensions';
        }
        for (var index = 0; index < this.coordinates.length; index++) {
            this.coordinates[index] += v.coordinates[index];
        }
    };
    //Product of two vectors
    Vector.prototype.Multiply = function (v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot multiply vectors with different dimensions';
        }
        var result = new Array(this.coordinates.length);
        for (var index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] * v.coordinates[index];
        }
        return new Vector(result);
    };
    //Difference between two vectors
    Vector.prototype.Minus = function (v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot compute difference between vectors with different dimensions';
        }
        var result = new Array(this.coordinates.length);
        for (var index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] - v.coordinates[index];
        }
        return new Vector(result);
    };
    //Multiply a vector by a scalar
    Vector.prototype.Times = function (s) {
        var result = new Array(this.coordinates.length);
        for (var index = 0; index < this.coordinates.length; index++) {
            result[index] = this.coordinates[index] * s;
        }
        return new Vector(result);
    };
    //Dot product
    Vector.prototype.Dot = function (v) {
        if (this.coordinates.length != v.coordinates.length) {
            throw 'Cannot compute difference between vectors with different dimensions';
        }
        var result = 0;
        for (var index = 0; index < this.coordinates.length; index++) {
            result += this.coordinates[index] * v.coordinates[index];
        }
        return result;
    };
    //Cross product (only for 3D vectors)
    Vector.prototype.Cross = function (v) {
        if (this.coordinates.length != 3) {
            throw 'Cross product only hold for 3D vectors';
        }
        return new Vector([
            this.coordinates[1] * v.coordinates[2] - this.coordinates[2] * v.coordinates[1],
            this.coordinates[2] * v.coordinates[0] - this.coordinates[0] * v.coordinates[2],
            this.coordinates[0] * v.coordinates[1] - this.coordinates[1] * v.coordinates[0]
        ]);
    };
    //Returns a vector orthogonnal to this one
    Vector.prototype.GetOrthogonnal = function () {
        var mindir = 0;
        var coords = [];
        for (var index = 0; index < this.coordinates.length; index++) {
            if (Math.abs(this.coordinates[index]) < Math.abs(this.coordinates[mindir])) {
                mindir = index;
            }
            coords.push(0.0);
        }
        var tmp = new Vector(coords);
        tmp.Set(mindir, 1.0);
        return this.Cross(tmp).Normalized();
    };
    //Comptute squared norm
    Vector.prototype.SqrNorm = function () {
        return this.Dot(this);
    };
    //Compute norm
    Vector.prototype.Norm = function () {
        return Math.sqrt(this.SqrNorm());
    };
    //Normalize current vector
    Vector.prototype.Normalized = function () {
        return this.Times(1 / this.Norm());
    };
    Vector.prototype.Normalize = function () {
        var norm = this.Norm();
        for (var index = 0; index < this.coordinates.length; index++) {
            this.coordinates[index] /= norm;
        }
    };
    return Vector;
}());
/// <reference path="matrix.ts" />
var LUDecomposition = /** @class */ (function () {
    function LUDecomposition(matrix) {
        if (matrix.width != matrix.height) {
            throw 'Cannot compute LU decomposition for non square matrix';
        }
        this.matrix = Matrix.Null(matrix.width, matrix.height);
        var factor = 1.0;
        this.swaps = new Array(matrix.width);
        for (var ii = 0; ii < matrix.height; ii++) {
            for (var jj = 0; jj < matrix.width; jj++) {
                this.matrix.SetValue(ii, jj, matrix.GetValue(ii, jj));
            }
        }
        //Search for the greatest element of each line
        var scale = new Array(this.matrix.width);
        for (var ii = 0; ii < this.matrix.height; ii++) {
            var maxval = 0;
            for (var jj = 0; jj < this.matrix.width; jj++) {
                var val = Math.abs(this.matrix.GetValue(ii, jj));
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
        for (var kk = 0; kk < this.matrix.width; kk++) {
            //Search for the largest pivot
            var maxval_1 = 0.0;
            var maxindex = kk;
            for (var ii = kk; ii < this.matrix.height; ii++) {
                var val = scale[ii] * Math.abs(this.matrix.GetValue(ii, kk));
                if (val > maxval_1) {
                    maxindex = ii;
                    maxval_1 = val;
                }
            }
            //Swap row so that current row has the best pivot
            if (kk != maxindex) {
                for (var jj = 0; jj < matrix.width; jj++) {
                    var tmp_1 = this.matrix.GetValue(maxindex, jj);
                    this.matrix.SetValue(maxindex, jj, this.matrix.GetValue(kk, jj));
                    this.matrix.SetValue(kk, jj, tmp_1);
                }
                var tmp = scale[maxindex];
                scale[maxindex] = scale[kk];
                scale[kk] = tmp;
                //Swap changes parity of the scale factore
                factor = -factor;
            }
            this.swaps[kk] = maxindex;
            for (var ii = kk + 1; ii < matrix.height; ii++) {
                var val = this.matrix.GetValue(ii, kk) / this.matrix.GetValue(kk, kk);
                this.matrix.SetValue(ii, kk, val);
                for (var jj = kk + 1; jj < matrix.width; jj++) {
                    this.matrix.SetValue(ii, jj, this.matrix.GetValue(ii, jj) - val * this.matrix.GetValue(kk, jj));
                }
            }
        }
    }
    LUDecomposition.prototype.GetValue = function (row, col) {
        return this.matrix.GetValue(row, col);
    };
    LUDecomposition.prototype.GetL = function () {
        var result = Matrix.Null(this.matrix.width, this.matrix.height);
        for (var ii = 0; ii < this.matrix.height; ii++) {
            result.SetValue(ii, ii, 1.0);
            for (var jj = 0; jj < ii; jj++) {
                result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
            }
        }
        return result;
    };
    LUDecomposition.prototype.GetU = function () {
        var result = Matrix.Null(this.matrix.width, this.matrix.height);
        for (var ii = 0; ii < this.matrix.height; ii++) {
            for (var jj = ii; jj <= this.matrix.width; jj++) {
                result.SetValue(ii, jj, this.matrix.GetValue(ii, jj));
            }
        }
        return result;
    };
    return LUDecomposition;
}());
/// <reference path="vector.ts" />
/// <reference path="ludecomposition.ts" />
var Matrix = /** @class */ (function () {
    function Matrix(width, height, values) {
        this.width = width;
        this.height = height;
        this.values = values;
    }
    //Common matrix Builders
    Matrix.Null = function (width, height) {
        var values = new Float32Array(width * height);
        for (var index = 0; index < values.length; index++) {
            values[index] = 0.0;
        }
        return new Matrix(width, height, values);
    };
    Matrix.Identity = function (dimension) {
        var result = Matrix.Null(dimension, dimension);
        for (var index = 0; index < dimension; index++) {
            result.SetValue(index, index, 1.0);
        }
        return result;
    };
    Matrix.Translation = function (v) {
        var result = Matrix.Identity(4);
        for (var index = 0; index < 3; index++) {
            result.SetValue(index, 3, v.Get(index));
        }
        return result;
    };
    Matrix.Rotation = function (axis, angle) {
        var result = Matrix.Identity(4);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var x = axis.Get(0);
        var y = axis.Get(1);
        var z = axis.Get(2);
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
    };
    Matrix.prototype.FlatIndex = function (row, col) {
        //Column-Major flat storage
        return row + col * this.width;
    };
    Matrix.prototype.SetValue = function (row, col, value) {
        this.values[this.FlatIndex(row, col)] = value;
    };
    Matrix.prototype.AddValue = function (row, col, value) {
        this.values[this.FlatIndex(row, col)] += value;
    };
    Matrix.prototype.GetValue = function (row, col) {
        return this.values[this.FlatIndex(row, col)];
    };
    Matrix.prototype.Clone = function () {
        return new Matrix(this.width, this.height, this.values.slice());
    };
    Matrix.prototype.Times = function (s) {
        var result = new Float32Array(this.width * this.height);
        for (var index = 0; index < this.values.length; index++) {
            result[index] = this.values[index] * s;
        }
        return new Matrix(this.width, this.height, result);
    };
    Matrix.prototype.Multiply = function (m) {
        if (this.width != m.height) {
            throw 'Cannot multiply matrices whose dimension do not match';
        }
        var result = Matrix.Null(m.width, this.height);
        for (var ii = 0; ii < this.height; ii++) {
            for (var jj = 0; jj < m.width; jj++) {
                var value = 0;
                for (var kk = 0; kk < this.width; kk++) {
                    value += this.GetValue(ii, kk) * m.GetValue(kk, jj);
                }
                result.SetValue(ii, jj, value);
            }
        }
        return result;
    };
    Matrix.prototype.Transposed = function () {
        var transposed = Matrix.Null(this.height, this.width);
        for (var ii = 0; ii < this.height; ii++) {
            for (var jj = 0; jj < this.width; jj++) {
                transposed.SetValue(jj, ii, this.GetValue(ii, jj));
            }
        }
        return transposed;
    };
    Matrix.prototype.GetColumnVector = function (col) {
        var values = new Array(this.height);
        for (var index = 0; index < this.height; index++) {
            values[index] = this.GetValue(index, col);
        }
        return new Vector(values);
    };
    Matrix.prototype.GetRowVector = function (row) {
        var values = new Array(this.width);
        for (var index = 0; index < this.width; index++) {
            values[index] = this.GetValue(row, index);
        }
        return new Vector(values);
    };
    Matrix.prototype.IsDiagonnal = function (error) {
        for (var ii = 0; ii < this.height; ii++) {
            for (var jj = 0; jj < this.width; jj++) {
                if (ii != jj && Math.abs(this.GetValue(ii, jj)) > error) {
                    return false;
                }
            }
        }
        return true;
    };
    //Solve THIS * X = rightHand (rightHand being a matrix)
    Matrix.prototype.LUSolve = function (rightHand) {
        if (rightHand.width != 1 || rightHand.height != this.width) {
            throw 'Cannot solve equations system, due to inconsistent dimensions';
        }
        var solution = Matrix.Null(rightHand.width, rightHand.height);
        for (var ii = 0; ii < rightHand.height; ii++) {
            solution.SetValue(ii, 0, rightHand.GetValue(ii, 0));
        }
        var LU = new LUDecomposition(this);
        //Solve L * Y = rightHand
        var kk = 0;
        for (var ii = 0; ii < rightHand.height; ii++) {
            var sum = solution.GetValue(LU.swaps[ii], 0);
            solution.SetValue(LU.swaps[ii], 0, solution.GetValue(ii, 0));
            if (kk != 0) {
                for (var jj = kk - 1; jj < ii; jj++) {
                    sum -= LU.matrix.GetValue(ii, jj) * solution.GetValue(jj, 0);
                }
            }
            else if (sum != 0) {
                kk = ii + 1;
            }
            solution.SetValue(ii, 0, sum);
        }
        //Solve U * X = Y
        for (var ii = rightHand.height - 1; ii >= 0; ii--) {
            var sum = solution.GetValue(ii, 0);
            for (var jj = ii + 1; jj < rightHand.height; jj++) {
                sum -= LU.matrix.GetValue(ii, jj) * solution.GetValue(jj, 0);
            }
            solution.SetValue(ii, 0, sum / LU.matrix.GetValue(ii, ii));
        }
        return solution;
    };
    Matrix.prototype.Log = function () {
        console.log('Matrix ' + this.height + ' x ' + this.width + ' : ');
        for (var ii = 0; ii < this.height; ii++) {
            var line = '| ';
            for (var jj = 0; jj < this.width; jj++) {
                line += this.GetValue(ii, jj) + ((jj + 1 < this.width) ? '; ' : '');
            }
            line += ' |';
            console.log(line);
        }
    };
    return Matrix;
}());
//Extends N-D vector space with a (N+1)th "homegeneous" coordinate, for matrix multiplications
var Homogeneous = /** @class */ (function (_super) {
    __extends(Homogeneous, _super);
    function Homogeneous(v, uniformcoord) {
        return _super.call(this, 1, v.Dimension() + 1, new Float32Array(v.Flatten().concat(uniformcoord))) || this;
    }
    Homogeneous.ToVector = function (m) {
        if (m.width != 1) {
            throw 'Matrix (' + m.width + 'x' + m.height + ') cannot be interpreted as a unifrom vector';
        }
        var s = m.height - 1;
        var c = new Array(s);
        var f = m.GetValue(s, 0) || 1;
        for (var index = 0; index < s; index++) {
            c[index] = m.GetValue(index, 0) / f;
        }
        return new Vector(c);
    };
    return Homogeneous;
}(Matrix));
var HomogeneousVector = /** @class */ (function (_super) {
    __extends(HomogeneousVector, _super);
    function HomogeneousVector(v) {
        return _super.call(this, v, 0.0) || this;
    }
    return HomogeneousVector;
}(Homogeneous));
var HomogeneousPoint = /** @class */ (function (_super) {
    __extends(HomogeneousPoint, _super);
    function HomogeneousPoint(v) {
        return _super.call(this, v, 1.0) || this;
    }
    return HomogeneousPoint;
}(Homogeneous));
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
})(RenderingMode || (RenderingMode = {}));
var Cursor = /** @class */ (function () {
    function Cursor(iconCode) {
        this.original = null;
        this.currentIcon = '';
        this.Icon = iconCode;
    }
    Cursor.prototype.Apply = function (element) {
        if (this.original === null) {
            this.original = element.style.cursor;
        }
        element.style.cursor = this.currentURL;
    };
    Cursor.prototype.Restore = function (element) {
        if (this.original !== null) {
            element.style.cursor = this.original || 'auto';
            this.original = null;
        }
    };
    Object.defineProperty(Cursor.prototype, "Icon", {
        set: function (code) {
            if (this.currentIcon != code) {
                this.currentIcon = code;
                if (code) {
                    var codes = code.split(Cursor.Separator);
                    var canvas = document.createElement('canvas');
                    canvas.width = Cursor.FontSize * codes.length;
                    canvas.height = Cursor.FontSize;
                    var context = canvas.getContext('2d');
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
        },
        enumerable: true,
        configurable: true
    });
    Cursor.Combine = function (iconCodes) {
        return iconCodes.join(Cursor.Separator);
    };
    Cursor.FontSize = 16;
    Cursor.Separator = '|';
    Cursor.Rotate = '\uf01e'; //fa-rotate-right
    Cursor.Translate = '\uf047'; //fa-arrows
    Cursor.Scale = '\uf002'; //fa-search
    Cursor.Edit = '\uf040'; //fa-pencil
    Cursor.Light = '\uf0eb'; //fa-lightbulb-o
    return Cursor;
}());
/// <reference path="mousetracker.ts" />
/// <reference path="controler.ts" />
/// <reference path="cursor.ts" />
var MouseControler = /** @class */ (function () {
    function MouseControler(target) {
        this.target = target;
        this.targetElement = target.GetRengeringArea();
        this.cursor = new Cursor();
        var self = this;
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
                var delta = self.mousetracker.UpdatePosition(event);
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
            var key = event.key ? event.key.charCodeAt(0) : event.keyCode;
            self.HandleKey(key);
        };
    }
    MouseControler.prototype.Start = function (event) {
        this.mousetracker = new MouseTracker(event);
        this.target.NotifyControlStart();
        this.StartMouseEvent();
    };
    MouseControler.prototype.End = function () {
        if (this.mousetracker != null && this.mousetracker.IsQuickEvent()) {
            this.HandleClick(this.mousetracker);
        }
        this.mousetracker = null;
        this.target.NotifyControlEnd();
        this.cursor.Restore(this.targetElement);
        this.EndMouseEvent();
    };
    MouseControler.prototype.HandleKey = function (key) {
        var strkey = String.fromCharCode(key);
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
            default:
                this.target.HandleShortcut(strkey);
                break;
        }
        return true;
    };
    MouseControler.prototype.StartMouseEvent = function () {
    };
    MouseControler.prototype.EndMouseEvent = function () {
    };
    Object.defineProperty(MouseControler.prototype, "Cursor", {
        set: function (iconCode) {
            this.cursor.Icon = iconCode;
            this.cursor.Apply(this.targetElement);
        },
        enumerable: true,
        configurable: true
    });
    MouseControler.prototype.GetSelectionColor = function () {
        return [1, 1, 0];
    };
    return MouseControler;
}());
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="cursor.ts" />
/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
var CameraControler = /** @class */ (function (_super) {
    __extends(CameraControler, _super);
    function CameraControler(target) {
        return _super.call(this, target) || this;
    }
    CameraControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var camera = this.target.GetViewPoint();
        switch (displacement.button) {
            case 1: //Left mouse
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
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
    };
    CameraControler.prototype.HandleClick = function (tracker) {
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
    };
    CameraControler.prototype.HandleWheel = function (delta) {
        var camera = this.target.GetViewPoint();
        camera.Zoom(-delta / 100);
        this.target.NotifyViewPointChange(ViewPointChange.Zoom);
        return true;
    };
    return CameraControler;
}(MouseControler));
/// <reference path="controler.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="cursor.ts" />
/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
var LightControler = /** @class */ (function (_super) {
    __extends(LightControler, _super);
    function LightControler(target) {
        var _this = _super.call(this, target) || this;
        _this.light = _this.target.GetLightPosition(true);
        target.GetViewPoint().SetPosition(_this.light.GetPosition());
        target.NotifyViewPointChange(ViewPointChange.Position);
        return _this;
    }
    LightControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var camera = this.target.GetViewPoint();
        switch (displacement.button) {
            case 1: //Left mouse
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
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
    };
    LightControler.prototype.HandleClick = function (tracker) {
        return true;
    };
    LightControler.prototype.HandleWheel = function (delta) {
        return true;
    };
    return LightControler;
}(MouseControler));
/// <reference path="controler.ts" />
/// <reference path="mousecontroler.ts" />
/// <reference path="mousetracker.ts" />
/// <reference path="cursor.ts" />
/**
 * The Transform Contorler handles mouse inputs in order to apply transformations the the currently selected element
 */
var TransformControler = /** @class */ (function (_super) {
    __extends(TransformControler, _super);
    function TransformControler(target) {
        return _super.call(this, target) || this;
    }
    TransformControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        if (!this.currentItem) {
            return false;
        }
        var camera = this.target.GetViewPoint();
        switch (displacement.button) {
            case 1: //Left mouse
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
                var rotation = camera.GetRotationMatrix(this.mousetracker.x, this.mousetracker.y, x, y);
                this.currentItem.Rotate(rotation);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Rotate]);
                break;
            case 2: //Middle mouse
                var scale = 1.0 - (displacement.dy / camera.GetScreenHeight());
                this.currentItem.Scale(scale);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Scale]);
                break;
            case 3: //Right mouse
                var translation = camera.GetTranslationVector(-displacement.dx, -displacement.dy);
                this.currentItem.Translate(translation);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Translate]);
                break;
            default:
                return true;
        }
        this.target.NotifyTransform();
        return true;
    };
    TransformControler.prototype.StartMouseEvent = function () {
        this.currentItem = this.target.GetCurrentTransformable();
        if (this.currentItem) {
            this.currentItem.InititalizeTransform();
        }
    };
    TransformControler.prototype.EndMouseEvent = function () {
        if (this.currentItem) {
            this.currentItem.ApplyTransform();
            this.currentItem = null;
        }
    };
    TransformControler.prototype.HandleClick = function (tracker) {
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
    };
    TransformControler.prototype.HandleWheel = function (delta) {
        var item = this.target.GetCurrentTransformable();
        item.Scale(1.0 - (delta / 1000.0));
        this.target.NotifyTransform();
        return true;
    };
    TransformControler.prototype.GetSelectionColor = function () {
        return [1, 0, 0];
    };
    return TransformControler;
}(MouseControler));
var Action = /** @class */ (function () {
    function Action(label, hintMessage) {
        this.label = label;
        this.hintMessage = hintMessage;
        this.listeners = [];
    }
    Action.prototype.Run = function () {
        this.Trigger();
        for (var index = 0; index < this.listeners.length; index++) {
            this.listeners[index].OnTrigger(this);
        }
    };
    Action.IsActionProvider = function (x) {
        return x && x.GetActions && x.GetActions instanceof Function;
    };
    Action.prototype.GetShortCut = function () {
        return null;
    };
    Action.prototype.GetLabel = function (withShortcut) {
        if (withShortcut === void 0) { withShortcut = true; }
        if (withShortcut) {
            var shortcut = this.GetShortCut();
            return (shortcut ? ('[' + shortcut + '] ') : '') + this.label;
        }
        return this.label;
    };
    Action.prototype.AddListener = function (listener) {
        this.listeners.push(listener);
    };
    return Action;
}());
var SimpleAction = /** @class */ (function (_super) {
    __extends(SimpleAction, _super);
    function SimpleAction(label, callback, hintMessage) {
        if (callback === void 0) { callback = null; }
        var _this = _super.call(this, label, hintMessage) || this;
        _this.callback = callback;
        _this.hintMessage = hintMessage;
        return _this;
    }
    SimpleAction.prototype.Enabled = function () {
        return this.callback !== null;
    };
    SimpleAction.prototype.Trigger = function () {
        return this.callback();
    };
    return SimpleAction;
}(Action));
/// <reference path="action.ts" />
/// <reference path="../controler.ts" />
var CenterCameraAction = /** @class */ (function (_super) {
    __extends(CenterCameraAction, _super);
    function CenterCameraAction(target) {
        var _this = _super.call(this, 'Center camera on selection', 'Change the camera viewing direction so that it points to the selected object(s)') || this;
        _this.target = target;
        return _this;
    }
    CenterCameraAction.prototype.Trigger = function () {
        this.target.FocusOnCurrentSelection();
    };
    CenterCameraAction.prototype.Enabled = function () {
        return this.target.CanFocus();
    };
    return CenterCameraAction;
}(Action));
/// <reference path="action.ts" />
/// <reference path="../cameracontroler.ts" />
/// <reference path="../transformcontroler.ts" />
/// <reference path="../lightcontroler.ts" />
var CameraModeAction = /** @class */ (function (_super) {
    __extends(CameraModeAction, _super);
    function CameraModeAction(target) {
        var _this = _super.call(this, 'Camera mode', 'The mouse can be used to control the position of the camera') || this;
        _this.target = target;
        return _this;
    }
    CameraModeAction.prototype.Trigger = function () {
        this.target.SetCurrentControler(new CameraControler(this.target));
    };
    CameraModeAction.prototype.Enabled = function () {
        return !(this.target.GetCurrentControler() instanceof CameraControler);
    };
    CameraModeAction.prototype.GetShortCut = function () {
        return 'C';
    };
    return CameraModeAction;
}(Action));
var TransformModeAction = /** @class */ (function (_super) {
    __extends(TransformModeAction, _super);
    function TransformModeAction(target) {
        var _this = _super.call(this, 'Transformation mode', 'The mouse can be used to control the geometry of the selected item') || this;
        _this.target = target;
        return _this;
    }
    TransformModeAction.prototype.Trigger = function () {
        this.target.SetCurrentControler(new TransformControler(this.target));
    };
    TransformModeAction.prototype.Enabled = function () {
        if (!this.target.GetCurrentTransformable())
            return false;
        return !(this.target.GetCurrentControler() instanceof TransformControler);
    };
    TransformModeAction.prototype.GetShortCut = function () {
        return 'T';
    };
    return TransformModeAction;
}(Action));
var LightModeAction = /** @class */ (function (_super) {
    __extends(LightModeAction, _super);
    function LightModeAction(target) {
        var _this = _super.call(this, 'Light mode', 'The mouse can be used to control the position of the selected light') || this;
        _this.target = target;
        return _this;
    }
    LightModeAction.prototype.Trigger = function () {
        this.target.SetCurrentControler(new LightControler(this.target));
    };
    LightModeAction.prototype.Enabled = function () {
        if (!this.target.GetLightPosition(false))
            return false;
        return !(this.target.GetCurrentControler() instanceof LightControler);
    };
    LightModeAction.prototype.GetShortCut = function () {
        return 'L';
    };
    return LightModeAction;
}(Action));
/// <reference path="../maths/vector.ts" />
var Picking = /** @class */ (function () {
    function Picking(object) {
        this.object = object;
        this.distance = null;
    }
    Picking.prototype.HasIntersection = function () {
        return this.distance !== null;
    };
    Picking.prototype.Add = function (distance) {
        if (this.distance === null || this.distance > distance) {
            this.distance = distance;
        }
    };
    Picking.prototype.Compare = function (picking) {
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
    };
    return Picking;
}());
var Ray = /** @class */ (function () {
    function Ray(from, dir) {
        this.from = from;
        this.dir = dir;
    }
    Ray.prototype.GetPoint = function (distance) {
        return this.from.Plus(this.dir.Times(distance));
    };
    return Ray;
}());
/// <reference path="../maths/vector.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../maths/vector.ts" />
var BoundingBox = /** @class */ (function () {
    function BoundingBox(min, max) {
        if (min === void 0) { min = null; }
        if (max === void 0) { max = null; }
        this.min = min;
        this.max = max;
    }
    BoundingBox.prototype.Set = function (center, size) {
        var halfSize = size.Times(0.5);
        this.min = center.Minus(halfSize);
        this.max = center.Plus(halfSize);
    };
    BoundingBox.prototype.GetCenter = function () {
        return this.min.Plus(this.max).Times(0.5);
    };
    BoundingBox.prototype.GetSize = function () {
        return this.max.Minus(this.min);
    };
    BoundingBox.prototype.Add = function (p) {
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
    };
    BoundingBox.prototype.AddBoundingBox = function (bb) {
        if (bb && bb.IsValid()) {
            this.Add(bb.min);
            this.Add(bb.max);
        }
    };
    BoundingBox.prototype.IsValid = function () {
        return (this.min != null && this.max != null);
    };
    BoundingBox.prototype.Intersect = function (box) {
        var dim = this.min.Dimension();
        for (var index = 0; index < dim; index++) {
            if ((box.max.Get(index) < this.min.Get(index)) || (box.min.Get(index) > this.max.Get(index))) {
                return false;
            }
        }
        return true;
    };
    BoundingBox.prototype.TestAxisSeparation = function (point, axis) {
        var dim = this.min.Dimension();
        var v = 0.0;
        for (var index = 0; index < dim; index++) {
            v += Math.abs(axis.Get(index) * (this.max.Get(index) - this.min.Get(index)));
        }
        var proj = this.GetCenter().Minus(point).Dot(axis);
        var minproj = proj - v;
        var maxproj = proj + v;
        return (minproj * maxproj) > 0;
    };
    BoundingBox.prototype.RayIntersection = function (ray) {
        var result = new Picking(null);
        var dim = this.min.Dimension();
        var self = this;
        function Accept(dist, ignore) {
            var inside = true;
            var p = ray.GetPoint(dist);
            for (var index = 0; inside && index < dim; index++) {
                if (index != ignore) {
                    inside = (p.Get(index) >= self.min.Get(index)) && (p.Get(index) <= self.max.Get(index));
                }
            }
            if (inside) {
                result.Add(dist);
            }
        }
        for (var index = 0; index < dim; index++) {
            var dd = ray.dir.Get(index);
            if (Math.abs(dd) > 1.0e-12) {
                Accept((this.min.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
                Accept((this.max.Get(index) - ray.from.Get(index)) / ray.dir.Get(index), index);
            }
        }
        return result;
    };
    BoundingBox.prototype.SqrDistance = function (p) {
        if (!this.IsValid()) {
            return null;
        }
        var delta = new Vector([0.0, 0.0, 0.0]);
        for (var index = 0; index < 3; index++) {
            if (p.Get(index) < this.min.Get(index)) {
                delta.Set(index, this.min.Get(index) - p.Get(index));
            }
            else if (p.Get(index) > this.max.Get(index)) {
                delta.Set(index, p.Get(index) - this.max.Get(index));
            }
        }
        return delta.SqrNorm();
    };
    return BoundingBox;
}());
var RenderingType = /** @class */ (function () {
    function RenderingType() {
        this.value = 0;
        this.Surface(true);
    }
    RenderingType.prototype.Point = function (activate) {
        return this.Set(activate, 1);
    };
    RenderingType.prototype.Wire = function (activate) {
        return this.Set(activate, 2);
    };
    RenderingType.prototype.Surface = function (activate) {
        return this.Set(activate, 4);
    };
    RenderingType.prototype.Set = function (activate, base) {
        if (activate === true) {
            this.value = this.value | base;
        }
        else if (activate === false) {
            this.value = this.value ^ base;
        }
        return ((this.value & base) != 0);
    };
    return RenderingType;
}());
/// <reference path="renderingtype.ts" />
var DrawingContext = /** @class */ (function () {
    function DrawingContext(renderingArea) {
        this.renderingArea = renderingArea;
        this.sampling = 30;
        this.rendering = new RenderingType();
        this.gl = (this.renderingArea.getContext("webgl", { preserveDrawingBuffer: true }) ||
            this.renderingArea.getContext("experimental-webgl", { preserveDrawingBuffer: true }));
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.useuint = this.gl.getExtension('OES_element_index_uint') ||
            this.gl.getExtension('MOZ_OES_element_index_uint') ||
            this.gl.getExtension('WEBKIT_OES_element_index_uint');
        var fragmentShader = this.GetShader("FragmentShader");
        var vertexShader = this.GetShader("VertexShader");
        this.shaders = this.gl.createProgram();
        this.gl.attachShader(this.shaders, vertexShader);
        this.gl.attachShader(this.shaders, fragmentShader);
        this.gl.linkProgram(this.shaders);
        if (!this.gl.getProgramParameter(this.shaders, this.gl.LINK_STATUS)) {
            throw 'Unable to initialize the shader program';
        }
        this.gl.useProgram(this.shaders);
        this.vertices = this.gl.getAttribLocation(this.shaders, "VertexPosition");
        this.gl.enableVertexAttribArray(this.vertices);
        this.normals = this.gl.getAttribLocation(this.shaders, "NormalVector");
        this.EnableNormals(true);
        this.scalarvalue = this.gl.getAttribLocation(this.shaders, "ScalarValue");
        this.usescalars = this.gl.getUniformLocation(this.shaders, "UseScalars");
        this.minscalarvalue = this.gl.getUniformLocation(this.shaders, "MinScalarValue");
        this.maxscalarvalue = this.gl.getUniformLocation(this.shaders, "MaxScalarValue");
        this.minscalarcolor = this.gl.getUniformLocation(this.shaders, "MinScalarColor");
        this.maxscalarcolor = this.gl.getUniformLocation(this.shaders, "MaxScalarColor");
        this.projection = this.gl.getUniformLocation(this.shaders, "Projection");
        this.modelview = this.gl.getUniformLocation(this.shaders, "ModelView");
        this.shapetransform = this.gl.getUniformLocation(this.shaders, "ShapeTransform");
        this.color = this.gl.getUniformLocation(this.shaders, "Color");
        this.eyeposition = this.gl.getUniformLocation(this.shaders, "EyePosition");
        this.lightpositions = [];
        this.lightcolors = [];
        this.nblights = this.gl.getUniformLocation(this.shaders, "NbLights");
        for (var index = 0; index < DrawingContext.NbMaxLights; index++) {
            this.lightpositions.push(this.gl.getUniformLocation(this.shaders, "LightPositions[" + index + "]"));
            this.lightcolors.push(this.gl.getUniformLocation(this.shaders, "LightColors[" + index + "]"));
        }
        this.diffuse = this.gl.getUniformLocation(this.shaders, "DiffuseCoef");
        this.ambiant = this.gl.getUniformLocation(this.shaders, "AmbiantCoef");
        this.specular = this.gl.getUniformLocation(this.shaders, "SpecularCoef");
        this.glossy = this.gl.getUniformLocation(this.shaders, "GlossyPow");
        this.usenormals = this.gl.getUniformLocation(this.shaders, "UseNormals");
        this.bboxcolor = [1, 1, 1];
    }
    DrawingContext.prototype.EnableNormals = function (b) {
        if (b) {
            this.gl.uniform1i(this.usenormals, 1);
            this.gl.enableVertexAttribArray(this.normals);
        }
        else {
            this.gl.uniform1i(this.usenormals, 0);
            this.gl.disableVertexAttribArray(this.normals);
        }
    };
    DrawingContext.prototype.EnableScalars = function (b) {
        if (b) {
            this.gl.uniform1i(this.usescalars, 1);
            this.gl.enableVertexAttribArray(this.scalarvalue);
        }
        else {
            this.gl.uniform1i(this.usescalars, 0);
            this.gl.disableVertexAttribArray(this.scalarvalue);
        }
    };
    DrawingContext.prototype.GetIntType = function (forceshort) {
        if (forceshort === void 0) { forceshort = false; }
        if (this.useuint && !forceshort) {
            return this.gl.UNSIGNED_INT;
        }
        return this.gl.UNSIGNED_SHORT;
    };
    DrawingContext.prototype.GetIntArray = function (content, forceshort) {
        if (forceshort === void 0) { forceshort = false; }
        if (this.useuint && !forceshort) {
            return new Uint32Array(content);
        }
        return new Uint16Array(content);
    };
    DrawingContext.prototype.GetSize = function (type) {
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
    };
    DrawingContext.prototype.GetShader = function (identifier) {
        var shaderScript;
        var shaderSource;
        var shader;
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
    };
    DrawingContext.NbMaxLights = 8;
    return DrawingContext;
}());
/// <reference path="drawingcontext.ts" />
var GLBuffer = /** @class */ (function () {
    function GLBuffer(data, ctx, type) {
        this.ctx = ctx;
        this.type = type;
        this.glBuffer = ctx.gl.createBuffer();
        ctx.gl.bindBuffer(type, this.glBuffer);
        ctx.gl.bufferData(type, data, ctx.gl.STATIC_DRAW);
    }
    GLBuffer.prototype.Bind = function () {
        this.ctx.gl.bindBuffer(this.type, this.glBuffer);
    };
    GLBuffer.prototype.Clear = function () {
        this.ctx.gl.deleteBuffer(this.glBuffer);
    };
    return GLBuffer;
}());
var FloatArrayBuffer = /** @class */ (function (_super) {
    __extends(FloatArrayBuffer, _super);
    function FloatArrayBuffer(data, ctx, dataSize) {
        var _this = _super.call(this, data, ctx, ctx.gl.ARRAY_BUFFER) || this;
        _this.dataSize = dataSize;
        return _this;
    }
    FloatArrayBuffer.prototype.BindAttribute = function (attribute) {
        this.Bind();
        this.ctx.gl.vertexAttribPointer(attribute, this.dataSize, this.ctx.gl.FLOAT, false, 0, 0);
    };
    return FloatArrayBuffer;
}(GLBuffer));
var ElementArrayBuffer = /** @class */ (function (_super) {
    __extends(ElementArrayBuffer, _super);
    function ElementArrayBuffer(data, ctx, short) {
        if (short === void 0) { short = false; }
        var _this = _super.call(this, ctx.GetIntArray(data, short), ctx, ctx.gl.ELEMENT_ARRAY_BUFFER) || this;
        _this.inttype = ctx.GetIntType(short);
        return _this;
    }
    return ElementArrayBuffer;
}(GLBuffer));
/// <reference path="../control.ts" />
var Property = /** @class */ (function () {
    function Property(name, changeHandler) {
        this.name = name;
        this.changeHandler = changeHandler;
    }
    Property.prototype.NotifyChange = function () {
        var value = this.GetValue();
        if (value !== null) {
            if (this.changeHandler) {
                this.changeHandler(value);
            }
            if (this.owner) {
                this.owner.NotifyChange(this);
            }
        }
    };
    return Property;
}());
/// <reference path="property.ts" />
/// <reference path="properties.ts" />
var PropertyGroup = /** @class */ (function (_super) {
    __extends(PropertyGroup, _super);
    function PropertyGroup(name, properties, handler) {
        if (handler === void 0) { handler = null; }
        var _this = _super.call(this, name, handler) || this;
        //Forward change notifications
        _this.properties = properties || new Properties();
        _this.properties.onChange = function () { return _this.NotifyChange(); };
        return _this;
    }
    PropertyGroup.prototype.Add = function (property) {
        this.properties.Push(property);
    };
    PropertyGroup.prototype.Refresh = function () {
        this.properties.Refresh();
    };
    PropertyGroup.prototype.GetElement = function () {
        return this.properties.GetElement();
    };
    PropertyGroup.prototype.GetValue = function () {
        var result = {};
        var nbProperties = this.properties.GetSize();
        for (var index = 0; index < nbProperties; index++) {
            var property = this.properties.GetProperty(index);
            result[property.name] = property.GetValue();
        }
        return result;
    };
    return PropertyGroup;
}(Property));
/// <reference path="../control.ts" />
/// <reference path="property.ts" />
/// <reference path="propertygroup.ts" />
//==========================================
// Provides a way to get a list of propeties as a displayable table
//==========================================
var Properties = /** @class */ (function () {
    function Properties(properties) {
        if (properties === void 0) { properties = []; }
        this.properties = properties;
    }
    Properties.prototype.Push = function (property) {
        this.properties.push(property);
        property.owner = this;
        if (this.element) {
            this.AddPropertyElement(property);
        }
        this.NotifyChange(property);
    };
    Properties.prototype.Refresh = function () {
        for (var index = 0; index < this.properties.length; index++) {
            this.properties[index].Refresh();
        }
    };
    Properties.prototype.GetSize = function () {
        return this.properties.length;
    };
    Properties.prototype.GetProperty = function (index) {
        return this.properties[index];
    };
    Properties.prototype.GetPropertyByName = function (propertyName) {
        for (var index = 0; index < this.properties.length; index++) {
            var property = this.properties[index];
            if (property.name == propertyName) {
                return property;
            }
        }
        return null;
    };
    Properties.prototype.GetValue = function (propertyName) {
        var property = this.GetPropertyByName(propertyName);
        if (property) {
            return property.GetValue();
        }
        return null;
    };
    Properties.prototype.NotifyChange = function (property) {
        if (this.onChange) {
            this.onChange();
        }
    };
    Properties.prototype.GetElement = function () {
        this.element = document.createElement('table');
        this.element.className = 'Properties';
        for (var index = 0; index < this.properties.length; index++) {
            this.AddPropertyElement(this.properties[index]);
        }
        return this.element;
    };
    Properties.prototype.AddPropertyElement = function (property) {
        var row = document.createElement('tr');
        row.className = 'Property';
        this.element.appendChild(row);
        var leftCol = document.createElement('td');
        leftCol.className = 'PropertyName';
        var leftColContent = document.createTextNode(property.name);
        leftCol.appendChild(leftColContent);
        row.appendChild(leftCol);
        if (property instanceof PropertyGroup) {
            leftCol.colSpan = 2;
            var row_1 = document.createElement('tr');
            row_1.className = 'Property';
            this.element.appendChild(row_1);
            var col = document.createElement('td');
            col.colSpan = 2;
            col.className = 'PropertyCompound';
            col.appendChild(property.GetElement());
            row_1.appendChild(col);
        }
        else {
            var rightCol = document.createElement('td');
            rightCol.className = 'PropertyValue';
            rightCol.appendChild(property.GetElement());
            row.appendChild(rightCol);
        }
    };
    return Properties;
}());
/// <reference path="property.ts" />
var PropertyWithValue = /** @class */ (function (_super) {
    __extends(PropertyWithValue, _super);
    // value() might be called anytime, to refresh the control displayed value so that its refelect that actual value
    function PropertyWithValue(name, inputType, value, changeHandler) {
        var _this = _super.call(this, name, changeHandler) || this;
        _this.value = value;
        var self = _this;
        _this.container = document.createElement('div');
        _this.input = document.createElement('input');
        _this.input.type = inputType;
        _this.input.width = 20;
        _this.input.className = 'PropertyValue';
        _this.input.value = value().toString();
        _this.input.onchange = function (ev) { return self.NotifyChange(); };
        _this.container.appendChild(_this.input);
        if (!changeHandler) {
            _this.SetReadonly();
        }
        return _this;
    }
    PropertyWithValue.prototype.Refresh = function () {
        this.input.value = this.value().toString();
    };
    PropertyWithValue.prototype.GetElement = function () {
        return this.container;
    };
    PropertyWithValue.prototype.SetReadonly = function (value) {
        if (value === void 0) { value = true; }
        this.input.readOnly = value;
        this.input.className = 'PropertyValue' + (value ? 'Readonly' : '');
    };
    return PropertyWithValue;
}(Property));
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
var StringProperty = /** @class */ (function (_super) {
    __extends(StringProperty, _super);
    function StringProperty(name, value, handler) {
        return _super.call(this, name, 'text', value, handler) || this;
    }
    StringProperty.prototype.GetValue = function () {
        return this.input.value;
    };
    return StringProperty;
}(PropertyWithValue));
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
var BooleanProperty = /** @class */ (function (_super) {
    __extends(BooleanProperty, _super);
    function BooleanProperty(name, value, handler) {
        var _this = _super.call(this, name, 'checkbox', value, handler) || this;
        _this.input.checked = value();
        return _this;
    }
    BooleanProperty.prototype.Refresh = function () {
        this.input.checked = this.value();
    };
    BooleanProperty.prototype.GetValue = function () {
        return this.input.checked;
    };
    return BooleanProperty;
}(PropertyWithValue));
var Endianness;
(function (Endianness) {
    Endianness[Endianness["BigEndian"] = 0] = "BigEndian";
    Endianness[Endianness["LittleEndian"] = 1] = "LittleEndian";
})(Endianness || (Endianness = {}));
var BinaryStream = /** @class */ (function () {
    function BinaryStream(buffer) {
        this.buffer = buffer;
        this.cursor = 0;
        this.stream = buffer ? new DataView(buffer) : null;
        var tmp = new ArrayBuffer(2);
        new DataView(tmp).setInt16(0, 256, true);
        this.endianness = (new Int16Array(tmp)[0] === 256 ? Endianness.LittleEndian : Endianness.BigEndian);
    }
    BinaryStream.prototype.Reset = function () {
        this.cursor = 0;
    };
    BinaryStream.prototype.Eof = function () {
        return (this.cursor >= this.stream.byteLength) || (this.stream[this.cursor] == 3);
    };
    return BinaryStream;
}());
/// <reference path="binarystream.ts" />
var BinaryReader = /** @class */ (function (_super) {
    __extends(BinaryReader, _super);
    function BinaryReader(buffer) {
        return _super.call(this, buffer) || this;
    }
    BinaryReader.prototype.CountAsciiOccurences = function (asciichar) {
        var count = 0;
        this.Reset();
        while (!this.Eof()) {
            if (this.GetNextAsciiStr(asciichar.length, false) == asciichar)
                count++;
            this.cursor++;
        }
        return count;
    };
    BinaryReader.prototype.GetAsciiLine = function () {
        return this.GetAsciiUntil(['\r\n', '\n']);
    };
    BinaryReader.prototype.GetAsciiWord = function (onSameLine) {
        var stops = [' '];
        if (onSameLine === false) {
            stops.push('\n');
            stops.push('\r\n');
        }
        return this.GetAsciiUntil(stops);
    };
    BinaryReader.prototype.GetAsciiUntil = function (stops) {
        var result = '';
        while (!this.Eof() && this.Ignore(stops) == 0) {
            result += this.GetNextAsciiChar();
        }
        return result;
    };
    BinaryReader.prototype.Ignore = function (words) {
        var count = 0;
        var match = null;
        do {
            match = this.GetNextMatchingAsciiStr(words, true);
            if (match)
                count++;
        } while (match);
        return count;
    };
    BinaryReader.prototype.GetNextAsciiStr = function (length, move) {
        if (length === void 0) { length = 1; }
        if (move === void 0) { move = true; }
        var result = '';
        var cursor = this.cursor;
        for (var index = 0; result.length < length && !this.Eof(); index++) {
            result += this.GetNextAsciiChar(true);
        }
        if (!move)
            this.cursor = cursor;
        return result;
    };
    BinaryReader.prototype.GetNextMatchingAsciiStr = function (words, move) {
        if (move === void 0) { move = true; }
        for (var index = 0; index < words.length; index++) {
            var word = words[index];
            var next = this.GetNextAsciiStr(word.length, false);
            if (next.toLowerCase() == word.toLowerCase()) {
                if (move)
                    this.cursor += next.length;
                return next;
            }
        }
        return null;
    };
    BinaryReader.prototype.GetNextAsciiChar = function (move) {
        if (move === void 0) { move = true; }
        var result = String.fromCharCode(this.stream.getUint8(this.cursor));
        if (move)
            this.cursor++;
        return result;
    };
    BinaryReader.prototype.GetNextString = function (length, move) {
        if (move === void 0) { move = true; }
        var cursor = this.cursor;
        var result = '';
        for (var index = 0; index < length && !this.Eof(); index++) {
            result += this.GetNextAsciiChar(true);
        }
        if (!move) {
            this.cursor = cursor;
        }
        return result;
    };
    BinaryReader.prototype.GetNextUInt8 = function (move) {
        if (move === void 0) { move = true; }
        var result = this.stream.getInt8(this.cursor);
        if (move)
            this.cursor++;
        return result;
    };
    BinaryReader.prototype.GetNextInt32 = function (move) {
        if (move === void 0) { move = true; }
        var result = this.stream.getInt32(this.cursor, this.endianness == Endianness.LittleEndian);
        if (move)
            this.cursor += 4;
        return result;
    };
    BinaryReader.prototype.GetNextFloat32 = function (move) {
        if (move === void 0) { move = true; }
        var result = this.stream.getFloat32(this.cursor, this.endianness == Endianness.LittleEndian);
        if (move)
            this.cursor += 4;
        return result;
    };
    BinaryReader.prototype.GetNextUILenghedString = function (move) {
        if (move === void 0) { move = true; }
        var cursor = this.cursor;
        var length = this.GetNextUInt8(true);
        var result = this.GetNextString(length, true);
        if (!move) {
            this.cursor = cursor;
        }
        return result;
    };
    return BinaryReader;
}(BinaryStream));
/// <reference path="../maths/vector.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="binaryreader.ts" />
var PCLSerializer = /** @class */ (function () {
    function PCLSerializer(buffersize) {
        this.writer = new BinaryWriter(buffersize);
        this.PushSection('HEADER');
        this.PushParameter(this.writer.endianness == Endianness.BigEndian ?
            PCLSerializer.BigEndian : PCLSerializer.LittleEndian);
        this.PushParameter('version', function (s) { return s.PushUInt8(1); });
        this.PushSection('CONTENTS');
    }
    PCLSerializer.prototype.PushSection = function (name) {
        this.writer.PushString(PCLSerializer.SectionPrefix + name + '\n');
    };
    PCLSerializer.prototype.PushParameter = function (name, handler) {
        if (handler === void 0) { handler = null; }
        this.writer.PushString(PCLSerializer.ParameterPefix + name + '\n');
        if (handler) {
            handler(this.writer);
            if (this.writer.lastvalue !== '\n') {
                this.writer.PushString('\n');
            }
        }
    };
    PCLSerializer.prototype.Start = function (s) {
        this.writer.PushString(PCLSerializer.StartObjectPrefix + s.GetSerializationID() + '\n');
    };
    PCLSerializer.prototype.End = function (s) {
        this.writer.PushString(PCLSerializer.EndObjectPrefix + s.GetSerializationID() + '\n');
    };
    PCLSerializer.prototype.GetBuffer = function () {
        return this.writer.buffer;
    };
    PCLSerializer.prototype.GetBufferAsString = function () {
        var stream = this.writer.stream;
        var result = '';
        for (var index = 0; index < stream.byteLength; index++) {
            result += String.fromCharCode(stream.getUint8(index));
        }
        return result;
    };
    PCLSerializer.prototype.GetBufferSize = function () {
        return this.writer.cursor;
    };
    PCLSerializer.SectionPrefix = '>>> ';
    PCLSerializer.StartObjectPrefix = 'New ';
    PCLSerializer.EndObjectPrefix = 'End ';
    PCLSerializer.ParameterPefix = '- ';
    PCLSerializer.HeaderSection = 'HEADER';
    PCLSerializer.ContentsSection = 'CONTENTS';
    PCLSerializer.VersionParam = 'version';
    PCLSerializer.BigEndian = 'bigendian';
    PCLSerializer.LittleEndian = 'littleendian';
    return PCLSerializer;
}());
var PCLTokenType;
(function (PCLTokenType) {
    PCLTokenType[PCLTokenType["SectionEntry"] = 0] = "SectionEntry";
    PCLTokenType[PCLTokenType["StartObject"] = 1] = "StartObject";
    PCLTokenType[PCLTokenType["EndObject"] = 2] = "EndObject";
    PCLTokenType[PCLTokenType["Parameter"] = 3] = "Parameter";
})(PCLTokenType || (PCLTokenType = {}));
var PCLToken = /** @class */ (function () {
    function PCLToken(type, value) {
        this.type = type;
        this.value = value;
    }
    return PCLToken;
}());
var PCLParser = /** @class */ (function () {
    function PCLParser(buffer, factory) {
        this.factory = factory;
        if (buffer instanceof ArrayBuffer) {
            this.reader = new BinaryReader(buffer);
        }
        else {
            var strbuffer = buffer;
            var arraybuffer = new ArrayBuffer(strbuffer.length);
            var stream = new DataView(arraybuffer);
            for (var index = 0; index < strbuffer.length; index++) {
                stream.setUint8(index, strbuffer.charCodeAt(index));
            }
            this.reader = new BinaryReader(arraybuffer);
        }
        this.line = '';
    }
    PCLParser.prototype.TryGetTokenValue = function (line, prefix) {
        if (line.substr(0, prefix.length) === prefix) {
            return line.substr(prefix.length);
        }
        return null;
    };
    PCLParser.prototype.GetStringValue = function () {
        return this.reader.GetAsciiUntil(['\n']);
    };
    PCLParser.GetTokenMap = function () {
        if (!PCLParser.tokenmap) {
            PCLParser.tokenmap = {};
            PCLParser.tokenmap[PCLSerializer.SectionPrefix] = PCLTokenType.SectionEntry;
            PCLParser.tokenmap[PCLSerializer.StartObjectPrefix] = PCLTokenType.StartObject;
            PCLParser.tokenmap[PCLSerializer.EndObjectPrefix] = PCLTokenType.EndObject;
            PCLParser.tokenmap[PCLSerializer.ParameterPefix] = PCLTokenType.Parameter;
        }
        return PCLParser.tokenmap;
    };
    PCLParser.prototype.GetNextToken = function () {
        if (this.reader.Eof()) {
            this.Error('unexpected end of file');
        }
        this.reader.Ignore(['\n']);
        this.line = this.reader.GetAsciiUntil(['\n']);
        var tokenmap = PCLParser.GetTokenMap();
        var value;
        for (var tokenprfix in tokenmap) {
            if (value = this.TryGetTokenValue(this.line, tokenprfix)) {
                return new PCLToken(tokenmap[tokenprfix], value);
            }
        }
        this.Error('unable to parse token');
        return null;
    };
    PCLParser.prototype.Done = function () {
        this.reader.Ignore(['\n']);
        return this.reader.Eof();
    };
    PCLParser.prototype.ProcessHeader = function () {
        var token = this.GetNextToken();
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
    };
    ;
    PCLParser.prototype.ProcessNextObject = function () {
        var token;
        token = this.GetNextToken();
        if (token.type !== PCLTokenType.StartObject) {
            this.Error('object declaration was expected');
        }
        var objecttype = token.value;
        var handler = this.factory.GetHandler(objecttype);
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
    };
    PCLParser.prototype.Error = function (message) {
        throw 'PCL Parsing error : ' + message + '\n"' + this.line + '"';
    };
    PCLParser.tokenmap = null;
    return PCLParser;
}());
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
var PCLNode = /** @class */ (function () {
    function PCLNode(name) {
        this.name = name;
        this.visible = true;
        this.selected = false;
        this.deletable = true;
        this.owner = null;
        this.changeListeners = [];
        this.pendingChanges = null;
    }
    PCLNode.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            this.DrawNode(drawingContext);
            if (this.selected) {
                BoundingBoxDrawing.Draw(this.GetBoundingBox(), drawingContext);
            }
        }
    };
    PCLNode.prototype.GetProperties = function () {
        var self = this;
        if (!this.properties) {
            this.properties = new Properties();
            this.properties.Push(new StringProperty('Name', function () { return self.name; }, function (newName) { return self.name = newName.replace(/\//g, ' '); }));
            this.properties.Push(new BooleanProperty('Visible', function () { return self.visible; }, function (newVilibility) { return self.visible = newVilibility; }));
            this.FillProperties();
            this.properties.onChange = function () { return self.NotifyChange(self, ChangeType.Properties | ChangeType.Display); };
        }
        return this.properties;
    };
    PCLNode.prototype.Select = function (b) {
        var change = (b !== this.selected);
        this.selected = b;
        if (change) {
            this.NotifyChange(this, ChangeType.Selection);
        }
    };
    PCLNode.prototype.ToggleSelection = function () {
        this.Select(!this.selected);
    };
    PCLNode.prototype.SetVisibility = function (b) {
        var notify = b !== this.visible;
        this.visible = b;
        if (notify) {
            this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
        }
    };
    PCLNode.prototype.ToggleVisibility = function () {
        this.SetVisibility(!this.visible);
    };
    PCLNode.prototype.GetActions = function (delegate) {
        var self = this;
        var result = [];
        if (this.deletable) {
            result.push(new SimpleAction('Remove', function () {
                if (confirm('Are you sure you want to delete "' + self.name + '" ?')) {
                    self.owner.Remove(self);
                }
            }));
        }
        if (this.visible) {
            result.push(new SimpleAction('Hide', function () { self.visible = false; self.NotifyChange(self, ChangeType.Display | ChangeType.Properties); }));
        }
        else {
            result.push(new SimpleAction('Show', function () { self.visible = true; self.NotifyChange(self, ChangeType.Display | ChangeType.Properties); }));
        }
        result.push(null);
        result.push(new SimpleAction('Save to file', function () { return self.SaveToFile(); }));
        return result;
    };
    PCLNode.prototype.SaveToFile = function () {
        //Dry run (to get the buffer size)
        var serializer = new PCLSerializer(null);
        this.Serialize(serializer);
        //Actual serialization
        serializer = new PCLSerializer(serializer.GetBufferSize());
        this.Serialize(serializer);
        FileExporter.ExportFile(this.name + '.pcld', serializer.GetBuffer(), 'model');
    };
    PCLNode.prototype.GetChildren = function () {
        return [];
    };
    PCLNode.prototype.Apply = function (proc) {
        return proc(this);
    };
    PCLNode.prototype.NotifyChange = function (source, type) {
        source.pendingChanges = source.pendingChanges ? (source.pendingChanges | type) : type;
        for (var index = 0; index < this.changeListeners.length; index++) {
            this.changeListeners[index].NotifyChange(source, type);
        }
    };
    PCLNode.prototype.AddChangeListener = function (listener) {
        if (this.changeListeners.indexOf(listener) < 0) {
            this.changeListeners.push(listener);
            if (this.pendingChanges != null) {
                listener.NotifyChange(this, this.pendingChanges);
            }
        }
    };
    PCLNode.prototype.ClearProperties = function () {
        if (this.properties) {
            delete this.properties;
        }
    };
    PCLNode.prototype.Serialize = function (serializer) {
        var self = this;
        serializer.Start(this);
        serializer.PushParameter('name', function (s) { return s.PushString(self.name); });
        if (!this.deletable) {
            serializer.PushParameter('nodelete');
        }
        this.SerializeNode(serializer);
        serializer.End(this);
    };
    PCLNode.IsPCLContainer = function (x) {
        return x &&
            x.Add && x.Add instanceof Function &&
            x.Remove && x.Remove instanceof Function &&
            x.NotifyChange && x.NotifyChange instanceof Function;
    };
    return PCLNode;
}());
var BoundingBoxDrawing = /** @class */ (function () {
    function BoundingBoxDrawing() {
    }
    BoundingBoxDrawing.Initialize = function (ctx) {
        if (!BoundingBoxDrawing.glIndexBuffer) {
            var points = new Float32Array([
                -0.5, -0.5, -0.5,
                -0.5, 0.5, -0.5,
                0.5, 0.5, -0.5,
                0.5, -0.5, -0.5,
                -0.5, -0.5, 0.5,
                -0.5, 0.5, 0.5,
                0.5, 0.5, 0.5,
                0.5, -0.5, 0.5
            ]);
            var indices = [
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
    };
    BoundingBoxDrawing.Draw = function (box, ctx) {
        if (box && box.IsValid()) {
            ctx.EnableNormals(false);
            BoundingBoxDrawing.Initialize(ctx);
            ctx.gl.uniform3fv(ctx.color, ctx.bboxcolor);
            var size = box.GetSize();
            var center = box.GetCenter();
            var shapetransform = Matrix.Identity(4);
            for (var index_1 = 0; index_1 < 3; index_1++) {
                shapetransform.SetValue(index_1, index_1, size.Get(index_1));
                shapetransform.SetValue(index_1, 3, center.Get(index_1));
            }
            ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, new Float32Array(shapetransform.values));
            BoundingBoxDrawing.glPointsBuffer.BindAttribute(ctx.vertices);
            BoundingBoxDrawing.glIndexBuffer.Bind();
            for (var index = 0; index < BoundingBoxDrawing.drawnElements.length; index++) {
                var element = BoundingBoxDrawing.drawnElements[index];
                var type = BoundingBoxDrawing.glIndexBuffer.inttype;
                ctx.gl.drawElements(element.type, element.count, type, ctx.GetSize(type) * element.from);
            }
        }
    };
    return BoundingBoxDrawing;
}());
var GLBufferElement = /** @class */ (function () {
    function GLBufferElement(from, count, type) {
        this.from = from;
        this.count = count;
        this.type = type;
    }
    return GLBufferElement;
}());
var PCLNodeParsingHandler = /** @class */ (function () {
    function PCLNodeParsingHandler() {
    }
    PCLNodeParsingHandler.prototype.ProcessParam = function (paramname, parser) {
        switch (paramname) {
            case 'name':
                this.name = parser.GetStringValue();
                return true;
            case 'nodelete':
                this.nodelete = true;
                return true;
        }
        return this.ProcessNodeParam(paramname, parser);
    };
    PCLNodeParsingHandler.prototype.Finalize = function () {
        var node = this.FinalizeNode();
        if (node) {
            node.name = this.name;
            if (this.nodelete)
                node.deletable = false;
            return node;
        }
    };
    return PCLNodeParsingHandler;
}());
var StringUtils = /** @class */ (function () {
    function StringUtils() {
    }
    StringUtils.LeftPad = function (str, paddingChar, decimals) {
        var result = str;
        while (result.length < decimals) {
            result = paddingChar + result;
        }
        return result;
    };
    StringUtils.RGBiToStr = function (rgb) {
        var result = '#' +
            StringUtils.LeftPad((rgb[0]).toString(16), '0', 2) +
            StringUtils.LeftPad((rgb[1]).toString(16), '0', 2) +
            StringUtils.LeftPad((rgb[2]).toString(16), '0', 2);
        return result;
    };
    StringUtils.RGBfToStr = function (rgb) {
        return StringUtils.RGBiToStr([
            Math.round(255 * rgb[0]),
            Math.round(255 * rgb[1]),
            Math.round(255 * rgb[2])
        ]);
    };
    StringUtils.StrToRGBf = function (str) {
        var red = str.substr(1, 2);
        var green = str.substr(3, 2);
        var blue = str.substr(5, 2);
        var result = [
            parseInt(red, 16) / 255,
            parseInt(green, 16) / 255,
            parseInt(blue, 16) / 255
        ];
        return result;
    };
    return StringUtils;
}());
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
/// <reference path="../../../tools/stringutils.ts" />
var ColorProperty = /** @class */ (function (_super) {
    __extends(ColorProperty, _super);
    function ColorProperty(name, colorvalue, handler) {
        return _super.call(this, name, 'color', function () { return StringUtils.RGBfToStr(colorvalue()); }, handler) || this;
    }
    ColorProperty.prototype.GetValue = function () {
        return StringUtils.StrToRGBf(this.input.value);
    };
    return ColorProperty;
}(PropertyWithValue));
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
var NumberInRangeProperty = /** @class */ (function (_super) {
    __extends(NumberInRangeProperty, _super);
    function NumberInRangeProperty(name, value, min, max, step, handler) {
        var _this = _super.call(this, name, 'range', value, handler) || this;
        _this.input.min = min.toString();
        _this.input.max = max.toString();
        _this.input.step = step.toString();
        return _this;
    }
    NumberInRangeProperty.prototype.GetValue = function () {
        try {
            return parseFloat(this.input.value);
        }
        catch (ex) {
            return null;
        }
    };
    return NumberInRangeProperty;
}(PropertyWithValue));
/// <reference path="drawingcontext.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/colorproperty.ts" />
/// <reference path="../controls/properties/numberinrangeproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
var Material = /** @class */ (function () {
    function Material(baseColor, diffuse, ambiant, specular, glossy) {
        if (diffuse === void 0) { diffuse = 0.7; }
        if (ambiant === void 0) { ambiant = 0.05; }
        if (specular === void 0) { specular = 0.4; }
        if (glossy === void 0) { glossy = 10.0; }
        this.baseColor = baseColor;
        this.diffuse = diffuse;
        this.ambiant = ambiant;
        this.specular = specular;
        this.glossy = glossy;
    }
    Material.prototype.InitializeLightingModel = function (drawingContext) {
        drawingContext.gl.uniform3fv(drawingContext.color, new Float32Array(this.baseColor));
        drawingContext.gl.uniform1f(drawingContext.diffuse, this.diffuse);
        drawingContext.gl.uniform1f(drawingContext.ambiant, this.ambiant);
        drawingContext.gl.uniform1f(drawingContext.specular, this.specular);
        drawingContext.gl.uniform1f(drawingContext.glossy, this.glossy);
    };
    Material.prototype.GetProperties = function () {
        var self = this;
        var properties = new Properties;
        properties.Push(new ColorProperty('Color', function () { return self.baseColor; }, function (value) { return self.baseColor = value; }));
        properties.Push(new NumberInRangeProperty('Ambiant', function () { return self.ambiant * 100.0; }, 0, 100, 1, function (value) { return self.ambiant = value / 100.0; }));
        properties.Push(new NumberInRangeProperty('Diffuse', function () { return self.diffuse * 100.0; }, 0, 100, 1, function (value) { return self.diffuse = value / 100.0; }));
        properties.Push(new NumberInRangeProperty('Specular', function () { return self.specular * 100.0; }, 0, 100, 1, function (value) { return self.specular = value / 100.0; }));
        properties.Push(new NumberInRangeProperty('Glossy', function () { return self.glossy; }, 0, 100, 1, function (value) { return self.glossy = value; }));
        return properties;
    };
    Material.prototype.GetSerializationID = function () {
        return Material.SerializationID;
    };
    Material.prototype.Serialize = function (serializer) {
        //public baseColor: number[], public diffuse: number = 0.7, public ambiant: number = 0.05, public specular: number = 0.4, public glossy: number = 10.0
        var self = this;
        serializer.Start(this);
        serializer.PushParameter('color', function (s) {
            s.PushFloat32(self.baseColor[0]);
            s.PushFloat32(self.baseColor[1]);
            s.PushFloat32(self.baseColor[2]);
        });
        serializer.PushParameter('ambiant', function (s) { return s.PushFloat32(self.ambiant); });
        serializer.PushParameter('diffuse', function (s) { return s.PushFloat32(self.diffuse); });
        serializer.PushParameter('specular', function (s) { return s.PushFloat32(self.specular); });
        serializer.PushParameter('glossy', function (s) { return s.PushFloat32(self.glossy); });
        serializer.End(this);
    };
    Material.prototype.GetParsingHandler = function () {
        return new MaterialParsingHandler();
    };
    Material.SerializationID = 'MATERIAL';
    return Material;
}());
var MaterialParsingHandler = /** @class */ (function () {
    function MaterialParsingHandler() {
    }
    MaterialParsingHandler.prototype.ProcessParam = function (paramname, parser) {
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
    };
    MaterialParsingHandler.prototype.Finalize = function () {
        return new Material(this.color, this.diffuse, this.ambiant, this.specular, this.glossy);
    };
    return MaterialParsingHandler;
}());
/// <reference path="../maths/matrix.ts" />
/// <reference path="../maths/vector.ts" />
var Transform = /** @class */ (function () {
    function Transform(rotationCenter) {
        this.rotationCenter = rotationCenter;
        this.rotation = Matrix.Identity(4);
        this.translation = new Vector([0.0, 0.0, 0.0]);
        this.scalefactor = 1.0;
    }
    Transform.prototype.Rotate = function (rotation) {
        this.rotation = this.rotation.Multiply(rotation);
        delete this.matrix;
    };
    Transform.prototype.Scale = function (scale) {
        this.scalefactor *= scale;
        delete this.matrix;
    };
    Transform.prototype.Translate = function (translation) {
        this.translation = this.translation.Plus(translation);
        delete this.matrix;
    };
    Transform.prototype.GetMatrix = function () {
        if (!this.matrix) {
            var shift = this.rotationCenter ? Matrix.Translation(this.rotationCenter) : null;
            this.matrix = this.rotation.Clone();
            for (var row = 0; row < 3; row++) {
                this.matrix.SetValue(row, 3, this.translation.Get(row));
            }
            this.matrix.SetValue(3, 3, 1.0 / this.scalefactor);
            if (this.rotationCenter) {
                var shift_1 = Matrix.Translation(this.rotationCenter.Times(-1));
                var unshift = Matrix.Translation(this.rotationCenter);
                this.matrix = unshift.Multiply(this.matrix.Multiply(shift_1));
            }
        }
        return this.matrix;
    };
    Transform.prototype.TransformPoint = function (p) {
        return Homogeneous.ToVector(this.GetMatrix().Multiply(new HomogeneousPoint(p)));
    };
    Transform.prototype.TransformVector = function (v) {
        return Homogeneous.ToVector(this.GetMatrix().Multiply(new HomogeneousVector(v)));
    };
    return Transform;
}());
/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../opengl/materials.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/propertygroup.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../files/pclserializer.ts" />
var PCLPrimitive = /** @class */ (function (_super) {
    __extends(PCLPrimitive, _super);
    function PCLPrimitive(name) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        _this.material = new Material([0.0, 1.0, 0.0]);
        _this.lighting = true;
        _this.transform = null;
        return _this;
    }
    PCLPrimitive.prototype.SetBaseColor = function (color) {
        this.material.baseColor = color;
    };
    PCLPrimitive.prototype.FillProperties = function () {
        if (this.properties) {
            var self_1 = this;
            this.properties.Push(new BooleanProperty('Lighting', function () { return self_1.lighting; }, function (l) { self_1.lighting = l; }));
            this.properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
        }
    };
    PCLPrimitive.prototype.DrawNode = function (ctx) {
        this.material.InitializeLightingModel(ctx);
        if (this.transform) {
            ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, this.transform.GetMatrix().values);
        }
        else {
            ctx.gl.uniformMatrix4fv(ctx.shapetransform, false, PCLPrimitive.defaultShapeTransform);
        }
        this.DrawPrimitive(ctx);
    };
    PCLPrimitive.prototype.InititalizeTransform = function () {
        if (this.transform) {
            this.ApplyTransform();
        }
        this.transform = new Transform(this.GetBoundingBox().GetCenter());
    };
    PCLPrimitive.prototype.Rotate = function (rotation) {
        this.transform.Rotate(rotation);
    };
    PCLPrimitive.prototype.Scale = function (scale) {
        this.transform.Scale(scale);
    };
    PCLPrimitive.prototype.Translate = function (translation) {
        this.transform.Translate(translation);
    };
    PCLPrimitive.prototype.ApplyTransform = function () {
        if (this.transform) {
            this.TransformPrivitive(this.transform);
            this.transform = null;
            this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
        }
    };
    PCLPrimitive.prototype.GetBoundingBox = function () {
        if (this.transform) {
            return null;
        }
        return this.GetPrimitiveBoundingBox();
    };
    PCLPrimitive.prototype.GetTransform = function () {
        if (!this.transform) {
        }
        return this.transform;
    };
    PCLPrimitive.prototype.GetDisplayIcon = function () {
        return 'fa-cube';
    };
    PCLPrimitive.prototype.SerializeNode = function (serializer) {
        var self = this;
        this.ApplyTransform();
        serializer.PushParameter('material', function () { return self.material.Serialize(serializer); });
        this.SerializePrimitive(serializer);
    };
    PCLPrimitive.defaultShapeTransform = Matrix.Identity(4).values;
    return PCLPrimitive;
}(PCLNode));
var PCLPrimitiveParsingHandler = /** @class */ (function (_super) {
    __extends(PCLPrimitiveParsingHandler, _super);
    function PCLPrimitiveParsingHandler() {
        return _super.call(this) || this;
    }
    PCLPrimitiveParsingHandler.prototype.ProcessNodeParam = function (paramname, parser) {
        switch (paramname) {
            case 'material':
                this.material = parser.ProcessNextObject();
                return true;
        }
        return this.ProcessPrimitiveParam(paramname, parser);
    };
    PCLPrimitiveParsingHandler.prototype.FinalizeNode = function () {
        var primitve = this.FinalizePrimitive();
        if (primitve) {
            primitve.material = this.material;
        }
        return primitve;
    };
    return PCLPrimitiveParsingHandler;
}(PCLNodeParsingHandler));
var Process = /** @class */ (function () {
    function Process() {
    }
    Process.prototype.Start = function (caller) {
        if (caller === void 0) { caller = null; }
        var self = this;
        this.Initialize(caller);
        this.Run(function () {
            self.Finalize();
            self.InvokeNext();
        });
    };
    Process.prototype.SetNext = function (next) {
        this.next = next;
        if (next instanceof Process)
            return next;
        return this;
    };
    Process.prototype.InvokeNext = function () {
        if (this.next) {
            if (this.next instanceof Process) {
                this.next.Start(this);
            }
            else {
                this.next(this);
            }
        }
    };
    Process.prototype.Initialize = function (caller) { };
    Process.prototype.Finalize = function () { };
    return Process;
}());
var LongProcess = /** @class */ (function (_super) {
    __extends(LongProcess, _super);
    function LongProcess(message, onstoped) {
        if (onstoped === void 0) { onstoped = null; }
        var _this = _super.call(this) || this;
        _this.message = message;
        _this.onstoped = onstoped;
        return _this;
    }
    ;
    Object.defineProperty(LongProcess.prototype, "Done", {
        get: function () {
            return this.Target <= this.Current;
        },
        enumerable: true,
        configurable: true
    });
    LongProcess.prototype.Run = function (ondone) {
        this.stoped = false;
        var progress = null;
        if (this.message && LongProcess.progresFactory) {
            progress = LongProcess.progresFactory();
            progress.Initialize(this.message, this);
        }
        var self = this;
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
    };
    LongProcess.prototype.Stopable = function () {
        return !!this.onstoped;
    };
    LongProcess.prototype.Stop = function () {
        this.stoped = true;
    };
    LongProcess.progresFactory = null;
    return LongProcess;
}(Process));
//================================================
// Long process, where the total number of steps is defined right from the start
//================================================
var IterativeLongProcess = /** @class */ (function (_super) {
    __extends(IterativeLongProcess, _super);
    function IterativeLongProcess(nbsteps, message) {
        var _this = _super.call(this, message) || this;
        _this.nbsteps = nbsteps;
        _this.currentstep = 0;
        return _this;
    }
    IterativeLongProcess.prototype.Step = function () {
        this.Iterate(this.currentstep);
        this.currentstep++;
    };
    Object.defineProperty(IterativeLongProcess.prototype, "Current", {
        get: function () {
            return this.currentstep;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IterativeLongProcess.prototype, "Target", {
        get: function () {
            return this.nbsteps;
        },
        enumerable: true,
        configurable: true
    });
    return IterativeLongProcess;
}(LongProcess));
/// <reference path="../maths/vector.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../tools/picking.ts" />
var MeshFace = /** @class */ (function () {
    function MeshFace(indices, points) {
        this.indices = indices;
        this.points = points;
    }
    MeshFace.prototype.LineFaceIntersection = function (line) {
        //Compute line / face intersection
        //solve line.from + t * line.dir
        var dd = this.Normal.Dot(this.points[0]);
        var nn = line.dir.Dot(this.Normal);
        if (Math.abs(nn) < 1e-6) {
            return null;
        }
        var tt = (dd - line.from.Dot(this.Normal)) / nn;
        var point = line.from.Plus(line.dir.Times(tt));
        if (!this.Inside(point)) {
            return null;
        }
        return tt;
    };
    MeshFace.prototype.Inside = function (point) {
        for (var ii = 0; ii < 3; ii++) {
            var test = point.Minus(this.points[ii]).Cross(this.points[(ii + 1) % 3].Minus(this.points[ii]));
            if (test.Dot(this.Normal) > 0) {
                return false;
                ;
            }
        }
        return true;
    };
    Object.defineProperty(MeshFace.prototype, "Normal", {
        get: function () {
            if (!this.normal) {
                this.normal = this.points[1].Minus(this.points[0]).Cross(this.points[2].Minus(this.points[0])).Normalized();
            }
            return this.normal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MeshFace.prototype, "BoundingBox", {
        get: function () {
            if (!this.boundingbox) {
                this.boundingbox = new BoundingBox();
                for (var index = 0; index < this.points.length; index++) {
                    this.boundingbox.Add(this.points[index]);
                }
            }
            return this.boundingbox;
        },
        enumerable: true,
        configurable: true
    });
    MeshFace.prototype.IntersectBox = function (box) {
        //Separated axis theorem : search for a separation axis
        if (!this.BoundingBox.Intersect(box)) {
            return false;
        }
        //Todo : Normal cross edges ?
        return !box.TestAxisSeparation(this.points[0], this.Normal);
    };
    MeshFace.prototype.Distance = function (point) {
        if (this.Inside(point)) {
            return Math.abs(this.Normal.Dot(point.Minus(this.points[0])));
        }
        var dist = null;
        for (var ii = 0; ii < 3; ii++) {
            var dd = Geometry.DistanceToSegment(point, this.points[ii], this.points[(ii + 1) % 3]);
            if (dist == null || dd < dist) {
                dist = dd;
            }
        }
        return dist;
    };
    return MeshFace;
}());
/// <reference path="../maths/vector.ts" />
/// <reference path="mesh.ts" />
/// <reference path="meshface.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/picking.ts" />
var Octree = /** @class */ (function () {
    function Octree(mesh, maxdepth, facespercell) {
        if (maxdepth === void 0) { maxdepth = 10; }
        if (facespercell === void 0) { facespercell = 30; }
        this.mesh = mesh;
        this.maxdepth = maxdepth;
        this.facespercell = facespercell;
        var size = mesh.Size();
        this.facescache = new Array(size);
        for (var index = 0; index < size; index++) {
            this.facescache[index] = mesh.GetFace(index);
        }
        this.root = new OctreeCell(this, null, mesh.GetBoundingBox());
        this.root.Split();
    }
    Octree.prototype.RayIntersection = function (ray, wrapper) {
        var result = new Picking(wrapper);
        if (this.root) {
            this.root.RayIntersection(ray, result);
        }
        return result;
    };
    Octree.prototype.Distance = function (p) {
        if (this.root) {
            return this.root.Distance(p);
        }
        return null;
    };
    Octree.prototype.GetFace = function (index) {
        return this.facescache[index];
    };
    Object.defineProperty(Octree.prototype, "NbFaces", {
        get: function () {
            return this.facescache.length;
        },
        enumerable: true,
        configurable: true
    });
    return Octree;
}());
var OctreeCell = /** @class */ (function () {
    function OctreeCell(octree, parent, boundingbox) {
        this.octree = octree;
        this.parent = parent;
        this.boundingbox = boundingbox;
        var candidates;
        if (parent) {
            this.depth = parent.depth + 1;
            candidates = parent.faces;
        }
        else {
            this.depth = 0;
            var size = octree.NbFaces;
            candidates = new Array(size);
            for (var index_2 = 0; index_2 < size; index_2++) {
                candidates[index_2] = index_2;
            }
        }
        this.faces = new Array(candidates.length);
        var nbfaces = 0;
        for (var index = 0; index < candidates.length; index++) {
            var face = octree.GetFace(candidates[index]);
            if (face.IntersectBox(this.boundingbox)) {
                this.faces[nbfaces] = candidates[index];
                nbfaces++;
            }
        }
        this.faces.splice(nbfaces);
        this.sons = [];
    }
    OctreeCell.prototype.Split = function () {
        if (this.depth >= this.octree.maxdepth || this.faces.length <= this.octree.facespercell) {
            return false;
        }
        var center = this.boundingbox.GetCenter();
        var min = this.boundingbox.min;
        var max = this.boundingbox.max;
        var boxes = [];
        boxes.push(new BoundingBox(new Vector([min.Get(0), min.Get(1), min.Get(2)]), new Vector([center.Get(0), center.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), min.Get(1), min.Get(2)]), new Vector([max.Get(0), center.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), center.Get(1), min.Get(2)]), new Vector([center.Get(0), max.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), min.Get(1), center.Get(2)]), new Vector([center.Get(0), center.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), center.Get(1), min.Get(2)]), new Vector([max.Get(0), max.Get(1), center.Get(2)])));
        boxes.push(new BoundingBox(new Vector([min.Get(0), center.Get(1), center.Get(2)]), new Vector([center.Get(0), max.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), min.Get(1), center.Get(2)]), new Vector([max.Get(0), center.Get(1), max.Get(2)])));
        boxes.push(new BoundingBox(new Vector([center.Get(0), center.Get(1), center.Get(2)]), new Vector([max.Get(0), max.Get(1), max.Get(2)])));
        for (var index = 0; index < boxes.length; index++) {
            var son = new OctreeCell(this.octree, this, boxes[index]);
            son.Split();
            this.sons.push(son);
        }
        return true;
    };
    OctreeCell.prototype.RayIntersection = function (ray, result) {
        var boxintersection = this.boundingbox.RayIntersection(ray);
        if (boxintersection.HasIntersection() && boxintersection.Compare(result) < 0) {
            var nbsons = this.sons.length;
            if (nbsons > 0) {
                for (var index_3 = 0; index_3 < nbsons; index_3++) {
                    this.sons[index_3].RayIntersection(ray, result);
                }
            }
            else {
                for (var index = 0; index < this.faces.length; index++) {
                    var face = this.octree.GetFace(this.faces[index]);
                    var tt = face.LineFaceIntersection(ray);
                    if (tt != null) {
                        result.Add(tt);
                    }
                }
            }
        }
    };
    OctreeCell.prototype.Distance = function (p) {
        var nbsons = this.sons.length;
        if (nbsons > 0) {
            var celldistances = [];
            for (var index = 0; index < nbsons; index++) {
                celldistances.push(new OctreeCellWithDistance(this.sons[index], p));
            }
            celldistances = celldistances.sort(function (a, b) { return a.CompareWith(b); });
            var dist = null;
            for (var index = 0; index < celldistances.length; index++) {
                var bd = celldistances[index].sqrDistToBox;
                if (dist !== null && (dist * dist) < bd) {
                    return dist;
                }
                var dd = celldistances[index].ActualDistance();
                if (dist == null || dd < dist) {
                    dist = dd;
                }
            }
            return dist;
        }
        else {
            var dist = null;
            for (var index = 0; index < this.faces.length; index++) {
                var face = this.octree.GetFace(this.faces[index]);
                var dd = face.Distance(p);
                if (dist == null || dd < dist) {
                    dist = dd;
                }
            }
            return dist;
        }
    };
    return OctreeCell;
}());
var OctreeCellWithDistance = /** @class */ (function () {
    function OctreeCellWithDistance(cell, p) {
        this.cell = cell;
        this.p = p;
        this.sqrDistToBox = cell.boundingbox.SqrDistance(p);
    }
    OctreeCellWithDistance.prototype.CompareWith = function (cell) {
        return this.sqrDistToBox - cell.sqrDistToBox;
    };
    OctreeCellWithDistance.prototype.ActualDistance = function () {
        return this.cell.Distance(this.p);
    };
    return OctreeCellWithDistance;
}());
/// <reference path="../maths/vector.ts" />
/// <reference path="pointcloud.ts" />
var Neighbourhood = /** @class */ (function () {
    function Neighbourhood() {
    }
    Neighbourhood.prototype.Initialize = function (cloud, queryPoint) {
        this.cloud = cloud;
        this.queryPoint = queryPoint;
        this.neighbours = [];
    };
    Neighbourhood.prototype.GetPointData = function (pointIndex) {
        var sqrdist = this.queryPoint.Minus(this.cloud.GetPoint(pointIndex)).SqrNorm();
        return new Neighbour(sqrdist, pointIndex);
    };
    Neighbourhood.prototype.GetData = function (pointIndex) {
        return this.cloud.GetPoint(this.neighbours[pointIndex].index);
    };
    Neighbourhood.prototype.Size = function () {
        return this.neighbours.length;
    };
    Neighbourhood.prototype.Accept = function (distance) {
        var sqrdist = distance * distance;
        var maxdist = this.GetSqrDistance();
        if (maxdist === null || sqrdist <= maxdist) {
            return true;
        }
        return false;
    };
    Neighbourhood.prototype.Neighbours = function () {
        return this.neighbours;
    };
    return Neighbourhood;
}());
//==================================
// Neighbor
//==================================
var Neighbour = /** @class */ (function () {
    function Neighbour(sqrdistance, index) {
        this.sqrdistance = sqrdistance;
        this.index = index;
    }
    return Neighbour;
}());
//==================================
// K-Nearest Neighbours
//==================================
var KNearestNeighbours = /** @class */ (function (_super) {
    __extends(KNearestNeighbours, _super);
    function KNearestNeighbours(k) {
        var _this = _super.call(this) || this;
        _this.k = k;
        k = k;
        return _this;
    }
    KNearestNeighbours.prototype.Push = function (index) {
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
    };
    KNearestNeighbours.prototype.GetSqrDistance = function () {
        if (this.neighbours.length < this.k) {
            return null;
        }
        return this.neighbours[this.neighbours.length - 1].sqrdistance;
    };
    return KNearestNeighbours;
}(Neighbourhood));
/// <reference path="../maths/vector.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="neighbourhood.ts" />
var KDTree = /** @class */ (function () {
    function KDTree(cloud) {
        this.cloud = cloud;
        this.GetIndices = function (start, nbItems, direction) {
            var array = new Array(nbItems);
            for (var index = 0; index < nbItems; index++) {
                var cloudIndex = this.indices[start + index];
                array[index] = {
                    index: cloudIndex,
                    coord: this.cloud.GetPointCoordinate(cloudIndex, direction)
                };
            }
            return array;
        };
        this.SetIndices = function (start, array) {
            for (var index = 0; index < array.length; index++) {
                this.indices[start + index] = array[index].index;
            }
        };
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
    KDTree.prototype.Split = function (fromIndex, toIndex, direction) {
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
                }
            }
            return cellData;
        }
        return null;
    };
    KDTree.prototype.FindNearestNeighbours = function (queryPoint, nbh, cell) {
        if (cell === void 0) { cell = null; }
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
    };
    KDTree.prototype.Log = function (cellData) {
        if (!cellData) {
            cellData = this.root;
        }
        var xmlNode = '';
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
    };
    return KDTree;
}());
var KDTreeCell = /** @class */ (function () {
    function KDTreeCell(fromIndex, toIndex, direction) {
        this.fromIndex = fromIndex;
        this.toIndex = toIndex;
        this.direction = direction;
        this.right = null;
        this.left = null;
    }
    return KDTreeCell;
}());
var QueueCell = /** @class */ (function () {
    function QueueCell(data) {
        this.data = data;
    }
    return QueueCell;
}());
var Queue = /** @class */ (function () {
    function Queue() {
        this.head = null;
        this.tail = null;
    }
    Queue.prototype.Dequeue = function () {
        var result = this.head.data;
        this.head = this.head.next;
        if (!this.head)
            this.tail = null;
        return result;
    };
    Queue.prototype.Enqueue = function (data) {
        var cell = new QueueCell(data);
        if (this.tail)
            this.tail.next = cell;
        else
            this.head = cell;
        this.tail = cell;
    };
    Queue.prototype.Empty = function () {
        return !this.head;
    };
    Queue.prototype.Clear = function () {
        this.head = null;
        this.tail = null;
    };
    return Queue;
}());
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
var RegionGrowthIterator = /** @class */ (function () {
    function RegionGrowthIterator(cloud, k) {
        this.cloud = cloud;
        this.k = k;
        this.status = new Array(this.Size());
        this.queue = new Queue();
    }
    RegionGrowthIterator.prototype.Reset = function () {
        var size = this.Size();
        for (var index = 0; index < size; index++) {
            this.status[index] = RegionGrowthStatus.unprocessed;
        }
        this.lastUnprocessed = 0;
        this.currentIndex = null;
        this.currentRegion = null;
        this.currentNeighborhood = null;
        this.regionIndex = 0;
        this.Enqueue(this.lastUnprocessed);
    };
    RegionGrowthIterator.prototype.Size = function () {
        return this.cloud.Size();
    };
    RegionGrowthIterator.prototype.End = function () {
        return this.lastUnprocessed >= this.Size();
    };
    RegionGrowthIterator.prototype.LoadAndSpread = function () {
        this.currentRegion = this.regionIndex;
        this.currentIndex = this.queue.Dequeue();
        this.status[this.currentIndex] = RegionGrowthStatus.processed;
        //Enqueue current point neighbourhood
        this.currentNeighborhood = this.cloud.KNearestNeighbours(this.cloud.GetPoint(this.currentIndex), this.k).Neighbours();
        for (var ii = 0; ii < this.currentNeighborhood.length; ii++) {
            var nbhindex = this.currentNeighborhood[ii].index;
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
    };
    RegionGrowthIterator.prototype.Enqueue = function (index) {
        this.queue.Enqueue(index);
        this.status[index] = RegionGrowthStatus.enqueued;
    };
    return RegionGrowthIterator;
}());
var RegionGrowthProcess = /** @class */ (function (_super) {
    __extends(RegionGrowthProcess, _super);
    function RegionGrowthProcess(cloud, k, message) {
        var _this = _super.call(this, cloud.Size(), message) || this;
        _this.cloud = cloud;
        _this.iterator = new RegionGrowthIterator(cloud, k);
        return _this;
    }
    RegionGrowthProcess.prototype.Initialize = function () {
        this.iterator.Reset();
    };
    Object.defineProperty(RegionGrowthProcess.prototype, "Done", {
        get: function () {
            return this.iterator.End();
        },
        enumerable: true,
        configurable: true
    });
    RegionGrowthProcess.prototype.Iterate = function () {
        this.iterator.LoadAndSpread();
        this.ProcessPoint(this.cloud, this.iterator.currentIndex, this.iterator.currentNeighborhood, this.iterator.currentRegion);
    };
    RegionGrowthProcess.prototype.Status = function (index) {
        return this.iterator.status[index];
    };
    return RegionGrowthProcess;
}(IterativeLongProcess));
/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
var QRDecomposition = /** @class */ (function () {
    function QRDecomposition(matrix) {
        //Naive method :
        //https://en.wikipedia.org/wiki/QR_decomposition
        if (matrix.width != matrix.height) {
            throw 'Cannot compute QR decomposition for non square matrix';
        }
        this.Q = Matrix.Null(matrix.width, matrix.width);
        this.R = Matrix.Null(matrix.width, matrix.width);
        var vects = [];
        var normalized = [];
        for (var ii = 0; ii < matrix.width; ii++) {
            var vec = matrix.GetColumnVector(ii);
            var current = vec;
            if (ii > 0) {
                //Compute vec - sum[jj<ii](proj(vects[jj], vec))
                for (var jj_1 = 0; jj_1 < ii; jj_1++) {
                    var proj = vects[jj_1].Times(vects[jj_1].Dot(vec) / vects[jj_1].Dot(vects[jj_1]));
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
    return QRDecomposition;
}());
/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
/// <reference path="qrdecomposition.ts" />
var EigenElement = /** @class */ (function () {
    function EigenElement(eigenValue, eigenVector) {
        this.eigenValue = eigenValue;
        this.eigenVector = eigenVector;
    }
    return EigenElement;
}());
var EigenDecomposition = /** @class */ (function () {
    function EigenDecomposition(matrix) {
        if (matrix.width != matrix.height) {
            throw 'Cannot compute eigen decomposition for non square matrix';
        }
        var workMatrix = matrix.Clone();
        var eigenVectors = Matrix.Identity(matrix.width);
        for (var index = 0; index <= 200; index++) {
            var QR = new QRDecomposition(workMatrix);
            workMatrix = QR.R.Multiply(QR.Q);
            eigenVectors = eigenVectors.Multiply(QR.Q);
            if (workMatrix.IsDiagonnal(1.0e-8)) {
                break;
            }
        }
        //Return the best result we got, anyway (might not have converged in the main loop)
        var result = [];
        for (var ii = 0; ii < workMatrix.width; ii++) {
            result.push(new EigenElement(workMatrix.GetValue(ii, ii), eigenVectors.GetColumnVector(ii)));
        }
        function Compare(a, b) {
            return (a.eigenValue < b.eigenValue) ? -1 : ((a.eigenValue > b.eigenValue) ? 1 : 0);
        }
        result = result.sort(Compare);
        return result;
    }
    return EigenDecomposition;
}());
var PointSet = /** @class */ (function () {
    function PointSet() {
    }
    PointSet.prototype.GetData = function (index) {
        return this.GetPoint(index);
    };
    return PointSet;
}());
/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
/// <reference path="eigendecomposition.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../tools/dataprovider.ts" />
var PlaneFittingResult = /** @class */ (function () {
    function PlaneFittingResult(center, normal) {
        this.center = center;
        this.normal = normal;
    }
    PlaneFittingResult.prototype.ComputePatchRadius = function (data) {
        var maxradius = 0;
        var size = data.Size();
        for (var index = 0; index < size; index++) {
            var radius = data.GetData(index).Minus(this.center).Cross(this.normal).Norm();
            if (radius > maxradius) {
                maxradius = radius;
            }
        }
        return maxradius;
    };
    return PlaneFittingResult;
}());
var Geometry = /** @class */ (function () {
    function Geometry() {
    }
    Geometry.LinesIntersection = function (a, b) {
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
    };
    Geometry.PlanesIntersection = function (planes) {
        //Simply solve the (over constrained) linear problem
        //Having ni.x = ni.pi for all ni, pi being respectively the planes normals and centers
        //Thus N.x = Y (N being the normals matrix, Y being the matrix of dot products between normals and centers)
        //Use the Pseudo inverse method, we have to find x satifying N[t].N.x = N[t].Y ([t] = transposed)
        var left = Matrix.Null(3, 3);
        var right = Matrix.Null(1, 3);
        var size = planes.length;
        for (var index = 0; index < size; index++) {
            var n = planes[index].normal;
            var p = planes[index].center;
            var s = p.Dot(n);
            for (var ii = 0; ii < 3; ii++) {
                right.AddValue(ii, 0, n.Get(ii) * s);
                for (var jj = 0; jj < 3; jj++) {
                    left.AddValue(ii, jj, n.Get(ii) * n.Get(jj));
                }
            }
        }
        return left.LUSolve(right).GetColumnVector(0);
    };
    Geometry.DegreeToRadian = function (a) {
        return Math.PI * a / 180.0;
    };
    Geometry.RadianToDegree = function (a) {
        return a / Math.PI * 180;
    };
    Geometry.DistanceToSegment = function (point, a, b) {
        var ab = b.Minus(a);
        var ap = point.Minus(a);
        if (ap.Dot(ab) <= 0)
            return ap.Norm();
        var bp = point.Minus(b);
        if (bp.Dot(ab) >= 0)
            return bp.Norm();
        ab.Normalize();
        return ap.Cross(ab).Norm();
    };
    Geometry.Centroid = function (data, weights) {
        if (weights === void 0) { weights = null; }
        var center = new Vector([0, 0, 0]);
        var size = data.Size();
        for (var index = 0; index < size; index++) {
            var datum = data.GetData(index);
            if (weights) {
                datum = datum.Times(weights.GetData(index));
            }
            center.Add(datum);
        }
        center = center.Times(1 / size);
        return center;
    };
    Geometry.PlaneFitting = function (data) {
        //Compute the coletiance matrix
        var coletiance = Matrix.Null(3, 3);
        var center = Geometry.Centroid(data);
        var size = data.Size();
        for (var index = 0; index < size; index++) {
            var vec = data.GetData(index).Minus(center);
            for (var ii = 0; ii < 3; ii++) {
                for (var jj = 0; jj < 3; jj++) {
                    coletiance.SetValue(ii, jj, coletiance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj)));
                }
            }
        }
        //The normal is the eigenvector having the smallest eigenvalue in the coletiance matrix
        for (var ii = 0; ii < 3; ii++) {
            //Check no column is null in the coletiance matrix
            if (coletiance.GetColumnVector(ii).SqrNorm() <= 1.0e-12) {
                var result = new Vector([0, 0, 0]);
                result.Set(ii, 1);
                return new PlaneFittingResult(center, result);
            }
        }
        var eigen = new EigenDecomposition(coletiance);
        if (eigen) {
            return new PlaneFittingResult(center, eigen[0].eigenVector.Normalized());
        }
        return null;
    };
    //=======================================================
    // Spherical coordinates tools
    // Let theta, phi, fully describing an orthogonal base (theta, phi being the spherical coordinates of the Z axis)
    //=======================================================
    Geometry.GetTheta = function (zaxis) {
        return Math.acos(zaxis.Get(2));
    };
    Geometry.GetPhi = function (zaxis) {
        if (Math.abs(zaxis.Get(0)) > 1e-6) {
            return Math.atan2(zaxis.Get(1), zaxis.Get(0));
        }
        return 0;
    };
    Geometry.GetZAxis = function (theta, phi) {
        return new Vector([
            Math.cos(phi) * Math.sin(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(theta)
        ]);
    };
    Geometry.GetXAxis = function (theta, phi) {
        return new Vector([
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi) * Math.cos(theta),
            -Math.sin(theta)
        ]);
    };
    Geometry.GetYAxis = function (theta, phi) {
        return new Vector([
            -Math.sin(phi),
            Math.cos(phi),
            0
        ]);
    };
    //This one is the projection of both Zaxis and XAxis in the plane Z=0 (thus, it's orthogonal to YAxis as well)
    Geometry.GetWAxis = function (theta, phi) {
        return new Vector([
            Math.cos(phi),
            Math.sin(phi),
            0
        ]);
    };
    return Geometry;
}());
/// <reference path="kdtree.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="neighbourhood.ts" />
/// <reference path="regiongrowth.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/geometry.ts" />
/// <reference path="../tools/transform.ts" />
var PointCloud = /** @class */ (function (_super) {
    __extends(PointCloud, _super);
    function PointCloud(points, normals) {
        var _this = _super.call(this) || this;
        _this.tree = null;
        _this.points = points || new Float32Array([]);
        _this.pointssize = _this.points.length;
        _this.normals = normals || new Float32Array([]);
        _this.normalssize = _this.normals.length;
        _this.boundingbox = new BoundingBox();
        for (var index = 0; index < _this.Size(); index++) {
            _this.boundingbox.Add(_this.GetPoint(index));
        }
        return _this;
    }
    PointCloud.prototype.PushPoint = function (p) {
        if (this.pointssize + p.Dimension() > this.points.length) {
            //Not optimal (Reserve should be called before callin PushPoint)
            this.Reserve(this.points.length + p.Dimension());
        }
        for (var index = 0; index < p.Dimension(); index++) {
            this.points[this.pointssize++] = p.Get(index);
        }
        this.boundingbox.Add(p);
        this.tree = null;
    };
    PointCloud.prototype.Reserve = function (capacity) {
        var points = new Float32Array(3 * capacity);
        for (var index = 0; index < this.pointssize; index++) {
            points[index] = this.points[index];
        }
        this.points = points;
        var normals = new Float32Array(3 * capacity);
        for (var index = 0; index < this.normalssize; index++) {
            normals[index] = this.normals[index];
        }
        this.normals = normals;
    };
    PointCloud.prototype.GetPoint = function (i) {
        var index = 3 * i;
        return new Vector([
            this.points[index],
            this.points[index + 1],
            this.points[index + 2]
        ]);
    };
    PointCloud.prototype.GetData = function (i) {
        return this.GetPoint(i);
    };
    PointCloud.SetValues = function (i, p, target) {
        var index = 3 * i;
        for (var ii = 0; ii < 3; ii++) {
            target[index + ii] = p.Get(ii);
        }
    };
    PointCloud.prototype.GetPointCoordinate = function (i, j) {
        return this.points[3 * i + j];
    };
    PointCloud.prototype.Size = function () {
        return this.pointssize / 3;
    };
    PointCloud.prototype.PushNormal = function (n) {
        if (this.normals.length < this.points.length) {
            var normals = new Float32Array(this.points.length);
            for (var index = 0; index < this.normalssize; index++) {
                normals[index] = this.normals[index];
            }
            this.normals = normals;
        }
        for (var index = 0; index < n.Dimension(); index++) {
            this.normals[this.normalssize++] = n.Get(index);
        }
    };
    PointCloud.prototype.GetNormal = function (i) {
        var index = 3 * i;
        return new Vector([
            this.normals[index],
            this.normals[index + 1],
            this.normals[index + 2]
        ]);
    };
    PointCloud.prototype.InvertNormal = function (i) {
        for (var index = 0; index < 3; index++) {
            this.normals[3 * i + index] = -this.normals[3 * i + index];
        }
    };
    PointCloud.prototype.HasNormals = function () {
        return (this.normalssize == this.pointssize);
    };
    PointCloud.prototype.ClearNormals = function () {
        this.normalssize = 0;
    };
    PointCloud.prototype.Distance = function (p) {
        var nearest = this.KNearestNeighbours(p, 1).Neighbours();
        return Math.sqrt(nearest[0].sqrdistance);
    };
    PointCloud.prototype.KNearestNeighbours = function (queryPoint, k) {
        if (!this.tree) {
            this.tree = new KDTree(this);
        }
        var knn = new KNearestNeighbours(k);
        this.tree.FindNearestNeighbours(queryPoint, knn);
        return knn;
    };
    PointCloud.prototype.RayIntersection = function (ray) {
        return new Picking(this);
    };
    PointCloud.prototype.ComputeNormal = function (index, k) {
        //Get the K-nearest neighbours (including the query point)
        var point = this.GetPoint(index);
        var knn = this.KNearestNeighbours(point, k + 1);
        return Geometry.PlaneFitting(knn).normal;
    };
    PointCloud.prototype.ApplyTransform = function (transform) {
        this.boundingbox = new BoundingBox();
        for (var index = 0; index < this.Size(); index++) {
            var p = this.GetPoint(index);
            p = transform.TransformPoint(p);
            PointCloud.SetValues(index, p, this.points);
            this.boundingbox.Add(p);
            if (this.HasNormals()) {
                var n = this.GetNormal(index);
                n = transform.TransformVector(n).Normalized();
                PointCloud.SetValues(index, n, this.normals);
            }
        }
        if (this.tree) {
            delete this.tree;
        }
    };
    return PointCloud;
}(PointSet));
var GaussianSphere = /** @class */ (function (_super) {
    __extends(GaussianSphere, _super);
    function GaussianSphere(cloud) {
        var _this = _super.call(this) || this;
        _this.cloud = cloud;
        _this.normals = null;
        if (!cloud.HasNormals()) {
            var size = cloud.Size();
            _this.normals = new Array(size);
            for (var index = 0; index < size; index++) {
                _this.normals[index] = cloud.ComputeNormal(index, 30);
            }
        }
        return _this;
    }
    GaussianSphere.prototype.Size = function () {
        return this.cloud.Size();
    };
    GaussianSphere.prototype.GetPoint = function (index) {
        if (this.normals) {
            return this.normals[index];
        }
        else {
            return this.cloud.GetNormal(index);
        }
    };
    GaussianSphere.prototype.ToPointCloud = function () {
        var gsphere = new PointCloud();
        var size = this.Size();
        gsphere.Reserve(size);
        for (var index = 0; index < size; index++) {
            gsphere.PushPoint(this.GetPoint(index));
        }
        return gsphere;
    };
    return GaussianSphere;
}(PointSet));
var PointSubCloud = /** @class */ (function (_super) {
    __extends(PointSubCloud, _super);
    function PointSubCloud(cloud, indices) {
        var _this = _super.call(this) || this;
        _this.cloud = cloud;
        _this.indices = indices;
        return _this;
    }
    PointSubCloud.prototype.Size = function () {
        return this.indices.length;
    };
    PointSubCloud.prototype.GetPoint = function (index) {
        return this.cloud.GetPoint(this.indices[index]);
    };
    PointSubCloud.prototype.ToPointCloud = function () {
        var subcloud = new PointCloud();
        var size = this.Size();
        subcloud.Reserve(size);
        for (var index = 0; index < size; index++) {
            subcloud.PushPoint(this.GetPoint(index));
            if (this.cloud.HasNormals()) {
                subcloud.PushNormal(this.cloud.GetNormal(this.indices[index]));
            }
        }
        return subcloud;
    };
    return PointSubCloud;
}(PointSet));
/// <reference path="octree.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="meshface.ts" />
/// <reference path="boundingbox.ts" />
/// <reference path="../tools/picking.ts" />
/// <reference path="../tools/longprocess.ts" />
var Mesh = /** @class */ (function () {
    function Mesh(pointcloud, faces) {
        this.pointcloud = pointcloud;
        this.faces = faces || [];
        this.size = this.faces.length;
    }
    Mesh.prototype.PushFace = function (f) {
        if (f.length != 3) {
            throw 'Non triangular faces are not (yet) supported in meshes';
        }
        if (this.size + f.length > this.faces.length) {
            //Not optimal (Reserve should be called before callin PushFace)
            this.Reserve(this.faces.length + f.length);
        }
        for (var index = 0; index < f.length; index++) {
            this.faces[this.size++] = f[index];
        }
    };
    Mesh.prototype.Reserve = function (capacity) {
        var faces = new Array(3 * capacity);
        for (var index = 0; index < this.size; index++) {
            faces[index] = this.faces[index];
        }
        this.faces = faces;
    };
    Mesh.prototype.GetFace = function (i) {
        var index = 3 * i;
        var indices = [
            this.faces[index++],
            this.faces[index++],
            this.faces[index++]
        ];
        return new MeshFace(indices, [
            this.pointcloud.GetPoint(indices[0]),
            this.pointcloud.GetPoint(indices[1]),
            this.pointcloud.GetPoint(indices[2])
        ]);
    };
    Mesh.prototype.Size = function () {
        return this.size / 3;
    };
    Mesh.prototype.ComputeOctree = function (onDone) {
        if (onDone === void 0) { onDone = null; }
        if (!this.octree) {
            var self_2 = this;
            self_2.octree = new Octree(this);
        }
        if (onDone)
            onDone(this);
    };
    Mesh.prototype.ClearNormals = function () {
        this.pointcloud.ClearNormals();
    };
    Mesh.prototype.ComputeNormals = function (onDone) {
        var _this = this;
        if (onDone === void 0) { onDone = null; }
        if (!this.pointcloud.HasNormals()) {
            var ncomputer = new MeshNormalsComputer(this);
            ncomputer.SetNext(function () { if (onDone)
                onDone(_this); });
            ncomputer.Start();
        }
    };
    Mesh.prototype.GetBoundingBox = function () {
        return this.pointcloud.boundingbox;
    };
    Mesh.prototype.RayIntersection = function (ray, wrapper) {
        if (this.octree) {
            return this.octree.RayIntersection(ray, wrapper);
        }
        //We should never get here !!! but just in case ...
        var result = new Picking(wrapper);
        for (var ii = 0; ii < this.Size(); ii++) {
            var tt = this.GetFace(ii).LineFaceIntersection(ray);
            if (tt !== null) {
                result.Add(tt);
            }
        }
        return result;
    };
    Mesh.prototype.Distance = function (p) {
        if (this.octree) {
            return this.octree.Distance(p);
        }
        //We should never get here !!! but just in case ...
        var dist = null;
        for (var ii = 0; ii < this.Size(); ii++) {
            var dd = this.GetFace(ii).Distance(p);
            if (dist == null || dd < dist) {
                dist = dd;
            }
        }
        return dist;
    };
    Mesh.prototype.ApplyTransform = function (transform) {
        this.pointcloud.ApplyTransform(transform);
    };
    return Mesh;
}());
var MeshNormalsComputer = /** @class */ (function (_super) {
    __extends(MeshNormalsComputer, _super);
    function MeshNormalsComputer(mesh) {
        var _this = _super.call(this, mesh.Size(), 'Computing normals') || this;
        _this.mesh = mesh;
        return _this;
    }
    MeshNormalsComputer.prototype.Initialize = function () {
        this.normals = new Array(this.mesh.pointcloud.Size());
        for (var index = 0; index < this.normals.length; index++) {
            this.normals[index] = new Vector([0, 0, 0]);
        }
    };
    MeshNormalsComputer.prototype.Iterate = function (step) {
        var face = this.mesh.GetFace(step);
        for (var index = 0; index < face.indices.length; index++) {
            var nindex = face.indices[index];
            this.normals[nindex] = this.normals[nindex].Plus(face.Normal);
        }
    };
    MeshNormalsComputer.prototype.Finalize = function () {
        var cloud = this.mesh.pointcloud;
        cloud.ClearNormals();
        var nbPoints = cloud.Size();
        for (var index = 0; index < nbPoints; index++) {
            cloud.PushNormal(this.normals[index].Normalized());
        }
    };
    return MeshNormalsComputer;
}(IterativeLongProcess));
var NameProvider = /** @class */ (function () {
    function NameProvider() {
    }
    NameProvider.GetName = function (key) {
        if (!(key in this.indices)) {
            this.indices[key] = 0;
        }
        var name = key + ' ' + this.indices[key];
        this.indices[key]++;
        return name;
    };
    NameProvider.indices = {};
    return NameProvider;
}());
/// <reference path="property.ts" />
/// <reference path="propertywithvalue.ts" />
var NumberProperty = /** @class */ (function (_super) {
    __extends(NumberProperty, _super);
    function NumberProperty(name, value, handler) {
        return _super.call(this, name, 'text', value, handler) || this;
    }
    NumberProperty.prototype.GetValue = function () {
        try {
            return parseFloat(this.input.value);
        }
        catch (ex) {
            return null;
        }
    };
    return NumberProperty;
}(PropertyWithValue));
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
var PCLMesh = /** @class */ (function (_super) {
    __extends(PCLMesh, _super);
    function PCLMesh(mesh) {
        var _this = _super.call(this, NameProvider.GetName('Mesh')) || this;
        _this.mesh = mesh;
        _this.drawing = new MeshDrawing();
        return _this;
    }
    PCLMesh.prototype.GetPrimitiveBoundingBox = function () {
        return this.mesh.GetBoundingBox();
    };
    PCLMesh.prototype.DrawPrimitive = function (drawingContext) {
        this.drawing.FillBuffers(this.mesh, drawingContext);
        this.drawing.Draw(this.lighting, drawingContext);
    };
    PCLMesh.prototype.InvalidateDrawing = function () {
        this.drawing.Clear();
        this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
    };
    PCLMesh.prototype.RayIntersection = function (ray) {
        return this.mesh.RayIntersection(ray, this);
    };
    PCLMesh.prototype.GetDistance = function (p) {
        return this.mesh.Distance(p);
    };
    PCLMesh.prototype.TransformPrivitive = function (transform) {
        this.mesh.ApplyTransform(transform);
        this.InvalidateDrawing();
    };
    PCLMesh.prototype.FillProperties = function () {
        _super.prototype.FillProperties.call(this);
        if (this.properties) {
            var self_3 = this;
            var points = new NumberProperty('Points', function () { return self_3.mesh.pointcloud.Size(); }, null);
            points.SetReadonly();
            var faces = new NumberProperty('Faces', function () { return self_3.mesh.Size(); }, null);
            faces.SetReadonly();
            this.properties.Push(points);
            this.properties.Push(faces);
        }
    };
    PCLMesh.prototype.GetSerializationID = function () {
        return PCLMesh.SerializationID;
    };
    PCLMesh.prototype.SerializePrimitive = function (serializer) {
        var cloud = this.mesh.pointcloud;
        serializer.PushParameter('points', function (s) {
            s.PushInt32(cloud.pointssize);
            for (var index = 0; index < cloud.pointssize; index++) {
                s.PushFloat32(cloud.points[index]);
            }
        });
        var mesh = this.mesh;
        serializer.PushParameter('faces', function (s) {
            s.PushInt32(mesh.size);
            for (var index = 0; index < mesh.size; index++) {
                s.PushInt32(mesh.faces[index]);
            }
        });
    };
    PCLMesh.prototype.GetParsingHandler = function () {
        return new PCLMeshParsingHandler();
    };
    PCLMesh.SerializationID = 'MESH';
    return PCLMesh;
}(PCLPrimitive));
var PCLMeshParsingHandler = /** @class */ (function (_super) {
    __extends(PCLMeshParsingHandler, _super);
    function PCLMeshParsingHandler() {
        return _super.call(this) || this;
    }
    PCLMeshParsingHandler.prototype.ProcessPrimitiveParam = function (paramname, parser) {
        switch (paramname) {
            case 'points':
                var nbpoints = parser.reader.GetNextInt32();
                this.points = new Float32Array(nbpoints);
                for (var index = 0; index < nbpoints; index++) {
                    this.points[index] = parser.reader.GetNextFloat32();
                }
                return true;
            case 'faces':
                var nbfaces = parser.reader.GetNextInt32();
                this.faces = new Array(nbfaces);
                for (var index = 0; index < nbfaces; index++) {
                    this.faces[index] = parser.reader.GetNextInt32();
                }
                return true;
        }
        return false;
    };
    PCLMeshParsingHandler.prototype.FinalizePrimitive = function () {
        var cloud = new PointCloud(this.points);
        var mesh = new Mesh(cloud, this.faces);
        var result = new PCLMesh(mesh);
        mesh.ComputeNormals(function () { return result.NotifyChange(result, ChangeType.Display); });
        mesh.ComputeOctree();
        return result;
    };
    return PCLMeshParsingHandler;
}(PCLPrimitiveParsingHandler));
var MeshDrawing = /** @class */ (function () {
    function MeshDrawing() {
        this.pcdrawing = new PointCloudDrawing();
        this.glIndexBuffer = null;
    }
    MeshDrawing.prototype.FillBuffers = function (mesh, ctx) {
        this.context = ctx;
        this.buffersize = mesh.size;
        this.pcdrawing.FillBuffers(mesh.pointcloud, null, ctx);
        if (!this.glIndexBuffer) {
            this.glIndexBuffer = new ElementArrayBuffer(mesh.faces, ctx);
        }
    };
    MeshDrawing.prototype.Draw = function (lighting, ctx) {
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
    };
    MeshDrawing.prototype.Clear = function () {
        this.pcdrawing.Clear();
        if (this.glIndexBuffer) {
            this.glIndexBuffer.Clear();
            this.glIndexBuffer = null;
        }
    };
    return MeshDrawing;
}());
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
var Shape = /** @class */ (function () {
    function Shape() {
        this.boundingbox = null;
    }
    Shape.prototype.GetBoundingBox = function () {
        if (!this.boundingbox) {
            this.boundingbox = this.ComputeBoundingBox();
        }
        return this.boundingbox;
    };
    Shape.prototype.NotifyChange = function () {
        if (this.onChange) {
            this.onChange();
        }
    };
    return Shape;
}());
/// <reference path="container.ts" />
var Toolbar = /** @class */ (function () {
    function Toolbar(classname) {
        if (classname === void 0) { classname = "Toolbar"; }
        this.toolbar = document.createElement('div');
        this.toolbar.className = classname;
    }
    Toolbar.prototype.AddControl = function (control) {
        var container = document.createElement('span');
        container.appendChild(control.GetElement());
        this.toolbar.appendChild(container);
    };
    Toolbar.prototype.RemoveControl = function (control) {
        var element = control.GetElement();
        for (var index = 0; index < this.toolbar.children.length; index++) {
            var container = this.toolbar.children[index];
            var current = container.firstChild;
            if (current === element) {
                this.toolbar.removeChild(container);
                return;
            }
        }
    };
    Toolbar.prototype.Clear = function () {
        while (this.toolbar.lastChild) {
            this.toolbar.removeChild(this.toolbar.lastChild);
        }
    };
    Toolbar.prototype.GetElement = function () {
        return this.toolbar;
    };
    return Toolbar;
}());
/// <reference path="control.ts" />
var Hint = /** @class */ (function () {
    function Hint(owner, message) {
        this.owner = owner;
        this.container = document.createElement('div');
        this.container.className = 'Hint';
        this.container.innerHTML = message;
        if (owner) {
            var element = this.owner.GetElement();
            var self_4 = this;
            element.onmouseenter = function (ev) { self_4.Show(); };
            element.onmouseleave = function (ev) { self_4.Hide(); };
        }
    }
    Hint.prototype.Show = function () {
        if (Hint.current) {
            Hint.current.Hide();
        }
        if (!this.container.parentElement) {
            document.body.appendChild(this.container);
        }
        Hint.current = this;
    };
    Hint.prototype.Hide = function () {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        if (Hint.current == this) {
            Hint.current = null;
        }
    };
    Hint.prototype.GetElement = function () {
        return this.container;
    };
    Hint.current = null;
    return Hint;
}());
var TemporaryHint = /** @class */ (function (_super) {
    __extends(TemporaryHint, _super);
    function TemporaryHint(message, duration) {
        if (duration === void 0) { duration = TemporaryHint.DisplayDuration; }
        var _this = _super.call(this, null, message + (duration ? '' : '<br/><i>(Click this box to close)</i>')) || this;
        var self = _this;
        _this.Show();
        if (duration) {
            setTimeout(function () { return self.Hide(); }, duration);
        }
        else {
            _this.container.onclick = function () { return self.Hide(); };
        }
        return _this;
    }
    TemporaryHint.DisplayDuration = 4000;
    return TemporaryHint;
}(Hint));
/// <reference path="control.ts" />
/// <reference path="hint.ts" />
var Button = /** @class */ (function () {
    function Button(label, callback, hintMessage) {
        this.button = document.createElement('div');
        this.button.className = 'Button';
        var namePattern = /(?:\[Icon\:(.*)\]\s*)?(.*)/i;
        var name = namePattern.exec(label);
        this.buttonLabel = document.createTextNode(name[name.length - 1]);
        var nameContainer = this.buttonLabel;
        if (name[1]) {
            var icon = document.createElement('i');
            icon.className = 'ButtonIcon fa fa-' + name[1];
            nameContainer = document.createElement('span');
            nameContainer.appendChild(icon);
            nameContainer.appendChild(this.buttonLabel);
        }
        this.button.appendChild(nameContainer);
        if (hintMessage) {
            this.hint = new Hint(this, hintMessage);
        }
        if (callback) {
            this.button.onclick = function (event) { callback(); };
        }
    }
    Button.prototype.GetElement = function () {
        return this.button;
    };
    Button.prototype.SetLabel = function (value) {
        this.buttonLabel.data = value;
    };
    Button.prototype.GetLabel = function () {
        return this.buttonLabel.data;
    };
    return Button;
}());
/// <reference path="control.ts" />
/// <reference path="toolbar.ts" />
/// <reference path="button.ts" />
var Dialog = /** @class */ (function () {
    function Dialog(onAccept, onCancel) {
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
        var toolbar = new Toolbar();
        toolbar.AddControl(new Button('Ok', ApplyAndClose(onAccept)));
        toolbar.AddControl(new Button('Cancel', ApplyAndClose(onCancel)));
        cell.appendChild(toolbar.GetElement());
        document.body.appendChild(this.container);
    }
    Dialog.prototype.InsertItem = function (title, control) {
        if (control === void 0) { control = null; }
        var table = this.container.childNodes[0];
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
    };
    Dialog.prototype.InsertTitle = function (title) {
        var row = this.InsertItem(title);
        var cell = row.cells[0];
        cell.style.fontWeight = 'bold';
        cell.style.textDecoration = 'underline';
        return row;
    };
    Dialog.prototype.InsertValue = function (title, defaultValue) {
        var valueControl = document.createElement('input');
        valueControl.type = 'text';
        valueControl.width = 20;
        valueControl.value = defaultValue;
        return this.InsertItem(title, valueControl);
    };
    Dialog.prototype.InsertCheckBox = function (title, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var valueControl = document.createElement('input');
        valueControl.type = 'checkbox';
        valueControl.checked = defaultValue ? true : false;
        return this.InsertItem(title, valueControl);
    };
    Dialog.prototype.GetValue = function (title) {
        var table = this.container.childNodes[0];
        for (var index = 0; index < table.rows.length; index++) {
            var row = table.rows[index];
            var rowTitle = (row.cells[0]).innerText;
            if (rowTitle == title) {
                var valueInput = row.cells[1].childNodes[0];
                if (valueInput.type == 'text') {
                    return valueInput.value;
                }
                else if (valueInput.type == 'checkbox') {
                    return valueInput.checked;
                }
            }
        }
        return null;
    };
    Dialog.prototype.GetElement = function () {
        return this.container;
    };
    return Dialog;
}());
/// <reference path="action.ts" />
/// <reference path="delegate.ts" />
/// <reference path="../../gui/controls/dialog.ts" />
/// <reference path="../../gui/objects/pclmesh.ts" />
/// <reference path="../../gui/objects/pclshape.ts" />
/// <reference path="../../model/shapes/shape.ts" />
var CreateShapeMeshAction = /** @class */ (function (_super) {
    __extends(CreateShapeMeshAction, _super);
    function CreateShapeMeshAction(shape, sampling) {
        var _this = _super.call(this, 'Create shape mesh', 'Builds the mesh sampling this shape') || this;
        _this.shape = shape;
        _this.sampling = sampling;
        return _this;
    }
    CreateShapeMeshAction.prototype.Enabled = function () {
        return true;
    };
    CreateShapeMeshAction.prototype.Trigger = function () {
        var self = this;
        var dialog = new Dialog(
        //Ok has been clicked
        function (properties) {
            return self.CreateMesh(properties);
        }, 
        //Cancel has been clicked
        function () { return true; });
        dialog.InsertValue('Sampling', this.sampling);
    };
    CreateShapeMeshAction.prototype.CreateMesh = function (properties) {
        var sampling = parseInt(properties.GetValue('Sampling'));
        var result;
        var mesh = this.shape.GetShape().ComputeMesh(sampling, function () {
            if (result)
                result.InvalidateDrawing();
        });
        result = new PCLMesh(mesh);
        var self = this;
        mesh.ComputeOctree(function () {
            self.shape.NotifyChange(result, ChangeType.NewItem);
        });
        return true;
    };
    return CreateShapeMeshAction;
}(Action));
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
var PCLShape = /** @class */ (function (_super) {
    __extends(PCLShape, _super);
    function PCLShape(name, shape) {
        var _this = _super.call(this, name) || this;
        _this.drawing = new MeshDrawing();
        _this.meshsampling = 0;
        _this.pendingmesh = false;
        var self = _this;
        shape.onChange = function () {
            self.Invalidate();
            self.NotifyChange(self, ChangeType.Display | ChangeType.Properties);
        };
        return _this;
    }
    PCLShape.prototype.TransformPrivitive = function (transform) {
        this.GetShape().ApplyTransform(transform);
        this.Invalidate();
    };
    PCLShape.prototype.GetPrimitiveBoundingBox = function () {
        return this.GetShape().GetBoundingBox();
    };
    PCLShape.prototype.RayIntersection = function (ray) {
        return this.GetShape().RayIntersection(ray, this);
    };
    PCLShape.prototype.GetDistance = function (p) {
        return this.GetShape().Distance(p);
    };
    PCLShape.prototype.PrepareForDrawing = function (drawingContext) {
        //Avoid concurrent mesh computation requests
        if (this.pendingmesh) {
            return false;
        }
        if (this.meshsampling !== drawingContext.sampling) {
            this.pendingmesh = true;
            //Asynchroneous computation of the mesh to be rendered
            var self_5 = this;
            this.GetShape().ComputeMesh(drawingContext.sampling, function (mesh) {
                if (self_5.meshsampling = drawingContext.sampling) {
                    self_5.meshsampling = drawingContext.sampling;
                    self_5.drawing.FillBuffers(mesh, drawingContext);
                    self_5.pendingmesh = false;
                    self_5.NotifyChange(self_5, ChangeType.Display);
                }
            });
            //Not ready yet. Wait for NotifyChange to be handled 
            return false;
        }
        return true;
    };
    PCLShape.prototype.DrawPrimitive = function (drawingContext) {
        if (this.PrepareForDrawing(drawingContext)) {
            this.drawing.Draw(this.lighting, drawingContext);
        }
    };
    PCLShape.prototype.FillProperties = function () {
        _super.prototype.FillProperties.call(this);
        if (this.properties) {
            this.properties.Push(new PropertyGroup('Geometry', this.GetGeometry()));
        }
    };
    PCLShape.prototype.GetActions = function (delegate) {
        var result = _super.prototype.GetActions.call(this, delegate);
        result.push(null);
        result.push(new CreateShapeMeshAction(this, delegate.GetShapesSampling()));
        return result;
    };
    PCLShape.prototype.Invalidate = function () {
        this.meshsampling = 0;
        this.GetShape().boundingbox = null;
        this.drawing.Clear();
    };
    PCLShape.prototype.GeometryChangeHandler = function (update) {
        var self = this;
        return function (value) {
            if (update) {
                update(value);
            }
            self.Invalidate();
        };
    };
    return PCLShape;
}(PCLPrimitive));
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
var Plane = /** @class */ (function (_super) {
    __extends(Plane, _super);
    function Plane(center, normal, patchRadius) {
        var _this = _super.call(this) || this;
        _this.center = center;
        _this.normal = normal;
        _this.patchRadius = patchRadius;
        return _this;
    }
    Plane.prototype.ComputeMesh = function (sampling, onDone) {
        var points = new PointCloud();
        points.Reserve(sampling + 1);
        var xx = this.normal.GetOrthogonnal();
        var yy = this.normal.Cross(xx).Normalized();
        for (var ii = 0; ii < sampling; ii++) {
            var phi = 2.0 * ii * Math.PI / sampling;
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var radiusVect = xx.Times(c).Plus(yy.Times(s));
            points.PushPoint(this.center.Plus(radiusVect.Times(this.patchRadius)));
        }
        points.PushPoint(this.center);
        var mesh = new Mesh(points);
        mesh.Reserve(sampling);
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii, sampling, (ii + 1) % sampling]);
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    };
    Plane.prototype.Distance = function (point) {
        return Math.abs(point.Minus(this.center).Dot(this.normal));
    };
    Plane.prototype.ApplyTransform = function (transform) {
        this.normal = transform.TransformVector(this.normal).Normalized();
        this.center = transform.TransformPoint(this.center);
        this.patchRadius *= transform.scalefactor;
    };
    Plane.prototype.ComputeBoundingBox = function () {
        var size = new Vector([
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(0)))),
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(1)))),
            2 * Math.abs(this.patchRadius * Math.sin(Math.acos(this.normal.Get(2))))
        ]);
        var bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    };
    Plane.prototype.GetWorldToInnerBaseMatrix = function () {
        var translation = Matrix.Identity(4);
        var basechange = Matrix.Identity(4);
        var xx = this.normal.GetOrthogonnal();
        var yy = this.normal.Cross(xx).Normalized();
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.normal.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Plane.prototype.RayIntersection = function (ray, wrapper) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
        var innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));
        //solve [t] : p[t].z = 0
        var result = new Picking(wrapper);
        var tt = -innerFrom.GetValue(2, 0) / innerDir.GetValue(2, 0);
        var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(tt));
        if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (this.patchRadius * this.patchRadius)) {
            result.Add(tt);
        }
        return result;
    };
    Plane.prototype.ComputeBounds = function (points) {
        this.center = new Vector([0, 0, 0]);
        var size = points.Size();
        for (var ii = 0; ii < points.Size(); ii++) {
            this.center = this.center.Plus(points.GetPoint(ii));
        }
        this.center = this.center.Times(1.0 / size);
        this.patchRadius = 0;
        for (var ii = 0; ii < size; ii++) {
            var d = points.GetPoint(ii).Minus(this.center).SqrNorm();
            if (d > this.patchRadius) {
                this.patchRadius = d;
            }
        }
        this.patchRadius = Math.sqrt(this.patchRadius);
    };
    Plane.prototype.FitToPoints = function (points) {
        var result = Geometry.PlaneFitting(points);
        this.normal = result.normal;
        this.center = result.center;
        this.patchRadius = result.ComputePatchRadius(points);
        this.NotifyChange();
    };
    return Plane;
}(Shape));
/// <reference path="property.ts" />
/// <reference path="propertygroup.ts" />
/// <reference path="propertywithvalue.ts" />
/// <reference path="numberproperty.ts" />
/// <reference path="../../../maths/vector.ts" />
var VectorProperty = /** @class */ (function (_super) {
    __extends(VectorProperty, _super);
    function VectorProperty(name, vector, normalize, handler) {
        if (normalize === void 0) { normalize = false; }
        if (handler === void 0) { handler = null; }
        var _this = _super.call(this, name, null, null) || this;
        _this.vector = vector;
        _this.normalize = normalize;
        var self = _this;
        _this.Add(new NumberProperty('X', function () { return vector().Get(0); }, function (x) { return self.UpdateValue(0, x); }));
        _this.Add(new NumberProperty('Y', function () { return vector().Get(1); }, function (y) { return self.UpdateValue(1, y); }));
        _this.Add(new NumberProperty('Z', function () { return vector().Get(2); }, function (z) { return self.UpdateValue(2, z); }));
        //The change handler might be invoked curing the construction, above. Wait for the whole thing to be ready, before the change handler is set
        _this.changeHandler = handler;
        return _this;
    }
    VectorProperty.prototype.UpdateValue = function (index, value) {
        var vect = this.vector();
        vect.Set(index, value);
        if (this.normalize) {
            vect.Normalize();
            this.properties.Refresh();
        }
        this.NotifyChange();
    };
    VectorProperty.prototype.GetValue = function () {
        return new Vector([
            this.properties.GetValue('X'),
            this.properties.GetValue('Y'),
            this.properties.GetValue('Z')
        ]);
    };
    return VectorProperty;
}(PropertyGroup));
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/plane.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
var PCLPlane = /** @class */ (function (_super) {
    __extends(PCLPlane, _super);
    function PCLPlane(plane) {
        var _this = _super.call(this, NameProvider.GetName('Plane'), plane) || this;
        _this.plane = plane;
        return _this;
    }
    PCLPlane.prototype.GetShape = function () {
        return this.plane;
    };
    PCLPlane.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', function () { return self.plane.center; }, false, this.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Normal', function () { return self.plane.normal; }, true, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Patch Radius', function () { return self.plane.patchRadius; }, this.GeometryChangeHandler(function (value) { return self.plane.patchRadius = value; })));
        return geometry;
    };
    PCLPlane.prototype.GetSerializationID = function () {
        return PCLPlane.SerializationID;
    };
    PCLPlane.prototype.SerializePrimitive = function (serializer) {
        var plane = this.plane;
        serializer.PushParameter('center', function (s) {
            s.PushFloat32(plane.center.Get(0));
            s.PushFloat32(plane.center.Get(1));
            s.PushFloat32(plane.center.Get(2));
        });
        serializer.PushParameter('normal', function (s) {
            s.PushFloat32(plane.normal.Get(0));
            s.PushFloat32(plane.normal.Get(1));
            s.PushFloat32(plane.normal.Get(2));
        });
        serializer.PushParameter('radius', function (s) {
            s.PushFloat32(plane.patchRadius);
        });
    };
    PCLPlane.prototype.GetParsingHandler = function () {
        return new PCLPlaneParsingHandler();
    };
    PCLPlane.SerializationID = 'PLANE';
    return PCLPlane;
}(PCLShape));
var PCLPlaneParsingHandler = /** @class */ (function (_super) {
    __extends(PCLPlaneParsingHandler, _super);
    function PCLPlaneParsingHandler() {
        return _super.call(this) || this;
    }
    PCLPlaneParsingHandler.prototype.ProcessPrimitiveParam = function (paramname, parser) {
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
    };
    PCLPlaneParsingHandler.prototype.FinalizePrimitive = function () {
        var plane = new Plane(this.center, this.normal, this.radius);
        return new PCLPlane(plane);
    };
    return PCLPlaneParsingHandler;
}(PCLPrimitiveParsingHandler));
/// <reference path="matrix.ts" />
/// <reference path="../tools/dataprovider.ts" />
/*Solves parametric model least squares fitting using Levenberg Marquardt algorithm
The solver stops as soon as one of the following requirement is met :
 - the solution did not evelve after StabilityNbSteps steps
 - the solution improve ratio falls bellow StabilityFactor in ]0,1[*/
var LeastSquaresFitting = /** @class */ (function (_super) {
    __extends(LeastSquaresFitting, _super);
    function LeastSquaresFitting(solution, evaluable, data, message, lambda, lambdaFactor, stabilityNbSteps, stabilityFactor) {
        if (lambda === void 0) { lambda = 1.0; }
        if (lambdaFactor === void 0) { lambdaFactor = 10.0; }
        if (stabilityNbSteps === void 0) { stabilityNbSteps = 10; }
        if (stabilityFactor === void 0) { stabilityFactor = 1.0e-3; }
        var _this = _super.call(this, message) || this;
        _this.solution = solution;
        _this.evaluable = evaluable;
        _this.data = data;
        _this.lambda = lambda;
        _this.lambdaFactor = lambdaFactor;
        _this.stabilityNbSteps = stabilityNbSteps;
        _this.stabilityFactor = stabilityFactor;
        return _this;
    }
    LeastSquaresFitting.prototype.Initialize = function () {
        this.error = this.ComputeError(this.solution);
        this.iterations = 0;
        this.counter = 0;
        this.maxcounter = 0;
    };
    Object.defineProperty(LeastSquaresFitting.prototype, "Done", {
        get: function () {
            return (this.counter >= this.stabilityNbSteps) ||
                (this.delta < this.stabilityFactor * this.error);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LeastSquaresFitting.prototype, "Current", {
        get: function () {
            return this.maxcounter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LeastSquaresFitting.prototype, "Target", {
        get: function () {
            return this.stabilityNbSteps;
        },
        enumerable: true,
        configurable: true
    });
    LeastSquaresFitting.prototype.Step = function () {
        this.counter++;
        if (this.counter > this.maxcounter) {
            this.maxcounter = this.counter;
        }
        //Compute matrices
        if (this.jacobian == null || this.rightHand == null) {
            this.jacobian = Matrix.Null(this.solution.length, this.solution.length);
            this.rightHand = Matrix.Null(1, this.solution.length);
            var size = this.data.Size();
            for (var index = 0; index < size; index++) {
                var datum = this.data.GetData(index);
                var dist = -this.evaluable.Distance(this.solution, datum);
                var grad = this.evaluable.DistanceGradient(this.solution, datum);
                for (var ii = 0; ii < this.solution.length; ii++) {
                    this.rightHand.AddValue(ii, 0, grad[ii] * dist);
                    for (var jj = 0; jj < this.solution.length; jj++) {
                        this.jacobian.AddValue(ii, jj, grad[ii] * grad[jj]);
                    }
                }
            }
        }
        //Compute the modified jacobian
        var leftHand = this.jacobian.Clone();
        for (var index = 0; index < this.jacobian.width; index++) {
            leftHand.SetValue(index, index, this.jacobian.GetValue(index, index) * (1.0 + this.lambda));
        }
        // Solve leftHand . step = rightHand to get the next solution
        var step = leftHand.LUSolve(this.rightHand);
        var next = new Array(this.solution.length);
        for (var index = 0; index < this.solution.length; index++) {
            next[index] = step.GetValue(index, 0) + this.solution[index];
        }
        var nextError = this.ComputeError(next);
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
    };
    LeastSquaresFitting.prototype.ComputeError = function (parameters) {
        var error = 0.0;
        var size = this.data.Size();
        for (var index = 0; index < size; index++) {
            error += Math.pow(this.evaluable.Distance(parameters, this.data.GetData(index)), 2);
        }
        return error / size;
    };
    return LeastSquaresFitting;
}(LongProcess));
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/leatssquaresfitting.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
var Sphere = /** @class */ (function (_super) {
    __extends(Sphere, _super);
    function Sphere(center, radius) {
        var _this = _super.call(this) || this;
        _this.center = center;
        _this.radius = radius;
        return _this;
    }
    Sphere.prototype.ComputeBoundingBox = function () {
        var size = new Vector([1, 1, 1]).Times(2 * this.radius);
        var bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    };
    Sphere.prototype.GetWorldToInnerBaseMatrix = function () {
        var matrix = Matrix.Identity(4);
        for (var index = 0; index < 3; index++) {
            matrix.SetValue(index, 3, -this.center.Get(index));
        }
        return matrix;
    };
    Sphere.prototype.GetInnerBaseToWorldMatrix = function () {
        var matrix = Matrix.Identity(4);
        for (var index = 0; index < 3; index++) {
            matrix.SetValue(index, 3, this.center.Get(index));
        }
        return matrix;
    };
    Sphere.prototype.ComputeMesh = function (sampling, onDone) {
        var halfSampling = Math.ceil(sampling / 2);
        var points = new PointCloud();
        points.Reserve(sampling * halfSampling + 2);
        points.PushPoint(this.center.Plus(new Vector([0, 0, this.radius])));
        points.PushPoint(this.center.Plus(new Vector([0, 0, -this.radius])));
        //Spherical coordinates
        for (var jj = 0; jj < halfSampling; jj++) {
            for (var ii = 0; ii < sampling; ii++) {
                var phi = ((jj + 1) * Math.PI) / (halfSampling + 1);
                var theta = 2.0 * ii * Math.PI / sampling;
                var radial = new Vector([
                    Math.cos(theta) * Math.sin(phi),
                    Math.sin(theta) * Math.sin(phi),
                    Math.cos(phi)
                ]);
                points.PushPoint(this.center.Plus(radial.Times(this.radius)));
            }
        }
        var mesh = new Mesh(points);
        mesh.Reserve(2 * sampling + (halfSampling - 1) * sampling);
        //North pole
        var northShift = 2;
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([0, ii + northShift, ((ii + 1) % sampling) + northShift]);
        }
        //South pole
        var southShift = (halfSampling - 1) * sampling + northShift;
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii + southShift, 1, ((ii + 1) % sampling) + southShift]);
        }
        //Strips
        for (var jj = 0; (jj + 1) < halfSampling; jj++) {
            var ja = jj * sampling;
            var jb = (jj + 1) * sampling;
            for (var ii = 0; ii < sampling; ii++) {
                var ia = ii;
                var ib = (ii + 1) % sampling;
                //            [ia]        [ib]
                //   [ja] ---- aa -------- ba
                //             |           |
                //   [jb] ---- ab -------- bb
                var aa = ia + ja + northShift;
                var ab = ia + jb + northShift;
                var bb = ib + jb + northShift;
                var ba = ib + ja + northShift;
                mesh.PushFace([aa, ab, ba]);
                mesh.PushFace([ba, ab, bb]);
            }
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    };
    Sphere.prototype.RayIntersection = function (ray, wrapper) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
        var innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));
        //Solve [t] : sqrnorm(innerFrom[i]+t*innerDir[i])=radius
        var aa = 0;
        var bb = 0;
        var cc = 0;
        for (var index = 0; index < 3; index++) {
            aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
            bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
            cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
        }
        //Solve [t] : aa.t^2 + bb.t + cc = radius
        cc -= this.radius * this.radius;
        var dd = bb * bb - 4.0 * aa * cc;
        var result = new Picking(wrapper);
        if (Math.abs(dd) < 0.0000001) {
            result.Add(-bb / 2.0 * aa);
        }
        else if (dd > 0.) {
            result.Add((-bb + Math.sqrt(dd)) / (2.0 * aa));
            result.Add((-bb - Math.sqrt(dd)) / (2.0 * aa));
        }
        return result;
    };
    Sphere.prototype.Distance = function (point) {
        return Math.abs(point.Minus(this.center).Norm() - this.radius);
    };
    Sphere.prototype.ApplyTransform = function (transform) {
        this.center = transform.TransformPoint(this.center);
        this.radius *= transform.scalefactor;
    };
    Sphere.InitialGuessForFitting = function (cloud) {
        var center = new Vector([0, 0, 0]);
        var size = cloud.Size();
        //Rough estimate
        for (var index = 0; index < size; index++) {
            center.Add(cloud.GetPoint(index));
        }
        center = center.Times(1 / size);
        var radius = 0;
        for (var index = 0; index < cloud.Size(); index++) {
            radius += center.Minus(cloud.GetPoint(index)).Norm();
        }
        radius /= size;
        return new Sphere(center, radius);
    };
    Sphere.prototype.ComputeBounds = function (points) {
        //NA
    };
    Sphere.prototype.FitToPoints = function (points) {
        var lsFitting = new LeastSquaresFitting(SphereFitting.Parameters(this.center, this.radius), new SphereFitting(this), points, 'Computing best fitting sphere');
        var self = this;
        lsFitting.SetNext(function () { return self.NotifyChange(); });
        lsFitting.Start();
    };
    return Sphere;
}(Shape));
var SphereFitting = /** @class */ (function () {
    function SphereFitting(sphere) {
        this.sphere = sphere;
    }
    SphereFitting.Parameters = function (center, radius) {
        var params = center.coordinates.slice();
        params.push(radius);
        return params;
    };
    SphereFitting.GetCenter = function (params) {
        return new Vector(params.slice(0, 3));
    };
    SphereFitting.GetRadius = function (params) {
        return params[3];
    };
    SphereFitting.prototype.Distance = function (params, point) {
        return SphereFitting.GetCenter(params).Minus(point).Norm() - SphereFitting.GetRadius(params);
    };
    SphereFitting.prototype.DistanceGradient = function (params, point) {
        var delta = SphereFitting.GetCenter(params).Minus(point);
        delta.Normalize();
        var gradient = delta.Flatten();
        gradient.push(-1);
        return gradient;
    };
    SphereFitting.prototype.NotifyNewSolution = function (params) {
        this.sphere.center = SphereFitting.GetCenter(params);
        this.sphere.radius = SphereFitting.GetRadius(params);
    };
    return SphereFitting;
}());
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/sphere.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
var PCLSphere = /** @class */ (function (_super) {
    __extends(PCLSphere, _super);
    function PCLSphere(sphere) {
        var _this = _super.call(this, NameProvider.GetName('Sphere'), sphere) || this;
        _this.sphere = sphere;
        var self = _this;
        sphere.onChange = function () {
            self.Invalidate();
            self.NotifyChange(self, ChangeType.Properties | ChangeType.Display);
        };
        return _this;
    }
    PCLSphere.prototype.GetShape = function () {
        return this.sphere;
    };
    PCLSphere.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', function () { return self.sphere.center; }, false, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Radius', function () { return self.sphere.radius; }, this.GeometryChangeHandler(function (value) { return self.sphere.radius = value; })));
        return geometry;
    };
    ;
    PCLSphere.prototype.GetSerializationID = function () {
        return PCLSphere.SerializationID;
    };
    PCLSphere.prototype.SerializePrimitive = function (serializer) {
        var sphere = this.sphere;
        serializer.PushParameter('center', function (s) {
            s.PushFloat32(sphere.center.Get(0));
            s.PushFloat32(sphere.center.Get(1));
            s.PushFloat32(sphere.center.Get(2));
        });
        serializer.PushParameter('radius', function (s) {
            s.PushFloat32(sphere.radius);
        });
    };
    PCLSphere.prototype.GetParsingHandler = function () {
        return new PCLSphereParsingHandler();
    };
    PCLSphere.SerializationID = 'SPHERE';
    return PCLSphere;
}(PCLShape));
var PCLSphereParsingHandler = /** @class */ (function (_super) {
    __extends(PCLSphereParsingHandler, _super);
    function PCLSphereParsingHandler() {
        return _super.call(this) || this;
    }
    PCLSphereParsingHandler.prototype.ProcessPrimitiveParam = function (paramname, parser) {
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
    };
    PCLSphereParsingHandler.prototype.FinalizePrimitive = function () {
        var sphere = new Sphere(this.center, this.radius);
        return new PCLSphere(sphere);
    };
    return PCLSphereParsingHandler;
}(PCLPrimitiveParsingHandler));
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
var Cylinder = /** @class */ (function (_super) {
    __extends(Cylinder, _super);
    function Cylinder(center, axis, radius, height) {
        var _this = _super.call(this) || this;
        _this.center = center;
        _this.axis = axis;
        _this.radius = radius;
        _this.height = height;
        return _this;
    }
    Cylinder.prototype.ApplyTransform = function (transform) {
        this.axis = transform.TransformVector(this.axis).Normalized();
        this.center = transform.TransformPoint(this.center);
        this.radius *= transform.scalefactor;
        this.height *= transform.scalefactor;
    };
    Cylinder.prototype.ComputeBoundingBox = function () {
        var size = new Vector([
            2 * (Math.abs(0.5 * this.height * this.axis.Get(0)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(0))))),
            2 * (Math.abs(0.5 * this.height * this.axis.Get(1)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(1))))),
            2 * (Math.abs(0.5 * this.height * this.axis.Get(2)) + Math.abs(this.radius * Math.sin(Math.acos(this.axis.Get(2)))))
        ]);
        var bb = new BoundingBox();
        bb.Set(this.center, size);
        return bb;
    };
    Cylinder.prototype.GetWorldToInnerBaseMatrix = function () {
        var translation = Matrix.Identity(4);
        var basechange = Matrix.Identity(4);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.axis.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Cylinder.prototype.ComputeMesh = function (sampling, onDone) {
        var points = new PointCloud();
        points.Reserve(4 * sampling + 2);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        var radials = [];
        for (var ii = 0; ii < sampling; ii++) {
            var phi = 2.0 * ii * Math.PI / sampling;
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var radial = xx.Times(c).Plus(yy.Times(s));
            radials.push(radial.Times(this.radius));
        }
        var northCenter = this.center.Plus(this.axis.Times(this.height / 2));
        var southCenter = this.center.Minus(this.axis.Times(this.height / 2));
        points.PushPoint(northCenter);
        points.PushPoint(southCenter);
        //North face
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(northCenter.Plus(radials[ii]));
        }
        //South face
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(southCenter.Plus(radials[ii]));
        }
        //Double points to separate normals
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(northCenter.Plus(radials[ii]));
        }
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(southCenter.Plus(radials[ii]));
        }
        var mesh = new Mesh(points);
        mesh.Reserve(4 * sampling);
        //North pole
        var northShift = 2;
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([0, ii + northShift, ((ii + 1) % sampling) + northShift]);
        }
        //South pole
        var southShift = sampling + 2;
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii + southShift, 1, ((ii + 1) % sampling) + southShift]);
        }
        //Strips
        var shift = southShift + sampling;
        for (var ii = 0; ii < sampling; ii++) {
            var ia = ii;
            var ib = (ii + 1) % sampling;
            var ja = 0;
            var jb = sampling;
            var aa = ia + ja + shift;
            var ab = ia + jb + shift;
            var bb = ib + jb + shift;
            var ba = ib + ja + shift;
            mesh.PushFace([aa, ab, ba]);
            mesh.PushFace([ba, ab, bb]);
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    };
    Cylinder.prototype.RayIntersection = function (ray, wrapper) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = worldToBase.Multiply(new HomogeneousPoint(ray.from));
        var innerDir = worldToBase.Multiply(new HomogeneousVector(ray.dir));
        //haveing p[t] = (innerFrom[i]+t*innerDir[i])
        //Solve p[t].x^2+p[t].y^2=radius for each i<3
        var aa = 0;
        var bb = 0;
        var cc = 0;
        for (var index = 0; index < 2; index++) {
            aa += innerDir.GetValue(index, 0) * innerDir.GetValue(index, 0);
            bb += 2.0 * innerDir.GetValue(index, 0) * innerFrom.GetValue(index, 0);
            cc += innerFrom.GetValue(index, 0) * innerFrom.GetValue(index, 0);
        }
        //Solve [t] : aa.t^2 + bb.t + cc = radius
        var halfHeight = this.height / 2.0;
        var sqrRadius = this.radius * this.radius;
        cc -= sqrRadius;
        var dd = bb * bb - 4.0 * aa * cc;
        var result = new Picking(wrapper);
        var nbResults = 0;
        function acceptValue(value) {
            var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
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
            var values = [
                (halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0),
                (-halfHeight - innerFrom.GetValue(2, 0)) / innerDir.GetValue(2, 0)
            ];
            for (var ii = 0; ii < 2; ii++) {
                var value = values[ii];
                var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(value));
                if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= sqrRadius) {
                    result.Add(value);
                }
            }
        }
        return result;
    };
    Cylinder.prototype.Distance = function (point) {
        var delta = point.Minus(this.center);
        var hyp = delta.SqrNorm();
        var adj = this.axis.Dot(delta);
        var op = Math.sqrt(hyp - (adj * adj));
        return Math.abs(op - this.radius);
    };
    Cylinder.prototype.ComputeBounds = function (points) {
        var min = 0;
        var max = 0;
        for (var ii = 0; ii < points.Size(); ii++) {
            var d_1 = points.GetPoint(ii).Minus(this.center).Dot(this.axis);
            if (ii == 0 || d_1 < min) {
                min = d_1;
            }
            if (ii == 0 || d_1 > max) {
                max = d_1;
            }
        }
        var d = 0.5 * (min + max);
        this.center = this.center.Plus(this.axis.Times(d));
        this.height = max - min;
    };
    Cylinder.InitialGuessForFitting = function (cloud) {
        var gsphere = new GaussianSphere(cloud);
        var plane = Geometry.PlaneFitting(gsphere);
        var center = Geometry.Centroid(cloud);
        var radius = 0;
        var size = cloud.Size();
        for (var index = 0; index < size; index++) {
            radius += cloud.GetPoint(index).Minus(center).Cross(plane.normal).Norm();
        }
        radius /= size;
        return new Cylinder(center, plane.normal, radius, 0);
    };
    Cylinder.prototype.FitToPoints = function (points) {
        var self = this;
        var lsFitting = new LeastSquaresFitting(CylinderFitting.Parameters(this.center, this.axis, this.radius), new CylinderFitting(this), points, 'Computing best fitting cylinder');
        lsFitting.SetNext(function () { return self.FinalizeFitting(points); });
        lsFitting.Start();
    };
    Cylinder.prototype.FinalizeFitting = function (points) {
        //Compute actual cylinder center and bounds along the axis
        var zmin = null;
        var zmax = null;
        var size = points.Size();
        for (var index = 0; index < size; index++) {
            var z = points.GetPoint(index).Minus(this.center).Dot(this.axis);
            if (zmin === null || zmin > z) {
                zmin = z;
            }
            if (zmax === null || zmax < z) {
                zmax = z;
            }
        }
        this.center = this.center.Plus(this.axis.Times((zmax + zmin) / 2.0));
        this.height = zmax - zmin;
        this.NotifyChange();
    };
    return Cylinder;
}(Shape));
var CylinderFitting = /** @class */ (function () {
    function CylinderFitting(cylinder) {
        this.cylinder = cylinder;
    }
    CylinderFitting.Parameters = function (center, axis, radius) {
        var theta = Geometry.GetTheta(axis);
        var phi = Geometry.GetPhi(axis);
        var xaxis = Geometry.GetXAxis(theta, phi);
        var yaxis = Geometry.GetYAxis(theta, phi);
        var x = xaxis.Dot(center);
        var y = yaxis.Dot(center);
        return [x, y, theta, phi, radius];
    };
    CylinderFitting.GetCenter = function (params) {
        var theta = CylinderFitting.GetTheta(params);
        var phi = CylinderFitting.GetPhi(params);
        var x = CylinderFitting.GetX(params);
        var y = CylinderFitting.GetY(params);
        return Geometry.GetXAxis(theta, phi).Times(x).Plus(Geometry.GetYAxis(theta, phi).Times(y));
    };
    CylinderFitting.GetAxis = function (params) {
        return Geometry.GetZAxis(CylinderFitting.GetTheta(params), CylinderFitting.GetPhi(params));
    };
    CylinderFitting.GetX = function (params) {
        return params[0];
    };
    CylinderFitting.GetY = function (params) {
        return params[1];
    };
    CylinderFitting.GetTheta = function (params) {
        return params[2];
    };
    CylinderFitting.GetPhi = function (params) {
        return params[3];
    };
    CylinderFitting.GetRadius = function (params) {
        return params[4];
    };
    CylinderFitting.prototype.Distance = function (params, point) {
        var theta = CylinderFitting.GetTheta(params);
        var phi = CylinderFitting.GetPhi(params);
        var x = CylinderFitting.GetX(params);
        var y = CylinderFitting.GetY(params);
        var radius = CylinderFitting.GetRadius(params);
        var xaxis = Geometry.GetXAxis(theta, phi);
        var yaxis = Geometry.GetYAxis(theta, phi);
        var dx = point.Dot(xaxis) - x;
        var dy = point.Dot(yaxis) - y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) - radius;
    };
    CylinderFitting.prototype.DistanceGradient = function (params, point) {
        var theta = CylinderFitting.GetTheta(params);
        var phi = CylinderFitting.GetPhi(params);
        var x = CylinderFitting.GetX(params);
        var y = CylinderFitting.GetY(params);
        var xaxis = Geometry.GetXAxis(theta, phi);
        var yaxis = Geometry.GetYAxis(theta, phi);
        var zaxis = Geometry.GetZAxis(theta, phi);
        var waxis = Geometry.GetWAxis(theta, phi);
        var px = point.Dot(xaxis);
        var py = point.Dot(yaxis);
        var pz = point.Dot(zaxis);
        var pw = point.Dot(waxis);
        var dx = px - x;
        var dy = py - y;
        var dist = Math.sqrt((Math.pow(dx, 2)) + (Math.pow(dy, 2)));
        var ddx = -dx / dist;
        var ddy = -dy / dist;
        var ddtheta = -dx * pz / dist;
        var ddphi = ((Math.cos(theta) * dx * py) - (dy * pw)) / dist;
        var ddradius = -1;
        return [ddx, ddy, ddtheta, ddphi, ddradius];
    };
    CylinderFitting.prototype.NotifyNewSolution = function (params) {
        this.cylinder.center = CylinderFitting.GetCenter(params);
        this.cylinder.axis = CylinderFitting.GetAxis(params);
        this.cylinder.radius = CylinderFitting.GetRadius(params);
    };
    return CylinderFitting;
}());
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/cylinder.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
var PCLCylinder = /** @class */ (function (_super) {
    __extends(PCLCylinder, _super);
    function PCLCylinder(cylinder) {
        var _this = _super.call(this, NameProvider.GetName('Cylinder'), cylinder) || this;
        _this.cylinder = cylinder;
        return _this;
    }
    PCLCylinder.prototype.GetShape = function () {
        return this.cylinder;
    };
    PCLCylinder.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', function () { return self.cylinder.center; }, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', function () { return self.cylinder.axis; }, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Radius', function () { return self.cylinder.radius; }, self.GeometryChangeHandler(function (value) { return self.cylinder.radius = value; })));
        geometry.Push(new NumberProperty('Height', function () { return self.cylinder.height; }, self.GeometryChangeHandler(function (value) { return self.cylinder.height = value; })));
        return geometry;
    };
    PCLCylinder.prototype.GetSerializationID = function () {
        return PCLCylinder.SerializationID;
    };
    PCLCylinder.prototype.SerializePrimitive = function (serializer) {
        var cylinder = this.cylinder;
        serializer.PushParameter('center', function (s) {
            s.PushFloat32(cylinder.center.Get(0));
            s.PushFloat32(cylinder.center.Get(1));
            s.PushFloat32(cylinder.center.Get(2));
        });
        serializer.PushParameter('axis', function (s) {
            s.PushFloat32(cylinder.axis.Get(0));
            s.PushFloat32(cylinder.axis.Get(1));
            s.PushFloat32(cylinder.axis.Get(2));
        });
        serializer.PushParameter('radius', function (s) {
            s.PushFloat32(cylinder.radius);
        });
        serializer.PushParameter('height', function (s) {
            s.PushFloat32(cylinder.height);
        });
    };
    PCLCylinder.prototype.GetParsingHandler = function () {
        return new PCLCylinderParsingHandler();
    };
    PCLCylinder.SerializationID = 'CYLINDER';
    return PCLCylinder;
}(PCLShape));
var PCLCylinderParsingHandler = /** @class */ (function (_super) {
    __extends(PCLCylinderParsingHandler, _super);
    function PCLCylinderParsingHandler() {
        return _super.call(this) || this;
    }
    PCLCylinderParsingHandler.prototype.ProcessPrimitiveParam = function (paramname, parser) {
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
    };
    PCLCylinderParsingHandler.prototype.FinalizePrimitive = function () {
        var cylinder = new Cylinder(this.center, this.axis, this.radius, this.height);
        return new PCLCylinder(cylinder);
    };
    return PCLCylinderParsingHandler;
}(PCLPrimitiveParsingHandler));
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../maths/geometry.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
var Cone = /** @class */ (function (_super) {
    __extends(Cone, _super);
    function Cone(apex, axis, angle, height) {
        var _this = _super.call(this) || this;
        _this.apex = apex;
        _this.axis = axis;
        _this.angle = angle;
        _this.height = height;
        return _this;
    }
    Cone.prototype.ComputeBoundingBox = function () {
        var radius = Math.tan(this.angle) * this.height;
        var size = new Vector([
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(0)))),
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(1)))),
            2 * Math.abs(radius * Math.sin(Math.acos(this.axis.Get(2))))
        ]);
        var bb = new BoundingBox();
        bb.Set(this.apex.Plus(this.axis.Times(this.height)), size);
        bb.Add(this.apex);
        return bb;
    };
    Cone.prototype.ApplyTransform = function (transform) {
        var c = this.apex.Plus(this.axis.Times(this.height * 0.5));
        this.axis = transform.TransformVector(this.axis).Normalized();
        this.height *= transform.scalefactor;
        c = transform.TransformPoint(c);
        this.apex = c.Minus(this.axis.Times(this.height * 0.5));
    };
    Cone.prototype.GetWorldToInnerBaseMatrix = function () {
        var translation = Matrix.Identity(4);
        var basechange = Matrix.Identity(4);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.axis.Get(index));
            translation.SetValue(index, 3, -this.apex.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Cone.prototype.ComputeMesh = function (sampling, onDone) {
        var points = new PointCloud();
        points.Reserve(1 + 3 * sampling);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        var radius = this.height * Math.tan(this.angle);
        var radials = [];
        for (var ii = 0; ii < sampling; ii++) {
            var phi = 2.0 * ii * Math.PI / sampling;
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var radial = xx.Times(c).Plus(yy.Times(s));
            radials.push(radial.Times(radius));
        }
        var center = this.apex.Plus(this.axis.Times(this.height));
        points.PushPoint(center);
        //Face circle (double points for normals compuation)
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(center.Plus(radials[ii]));
        }
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(this.apex);
        }
        for (var ii = 0; ii < radials.length; ii++) {
            points.PushPoint(center.Plus(radials[ii]));
        }
        var mesh = new Mesh(points);
        mesh.Reserve(2 * sampling);
        var shift = 1;
        //Face
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([0, ii + shift, ((ii + 1) % sampling) + shift]);
        }
        //Strips
        shift += sampling;
        for (var ii = 0; ii < sampling; ii++) {
            mesh.PushFace([ii + shift + sampling, ii + shift, ((ii + 1) % sampling) + shift + sampling]);
            mesh.PushFace([ii + shift + sampling, ((ii + 1) % sampling) + shift, ((ii + 1) % sampling) + shift + sampling]);
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    };
    Cone.prototype.RayIntersection = function (ray, wrapper) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = Homogeneous.ToVector(worldToBase.Multiply(new HomogeneousPoint(ray.from)));
        var innerDir = Homogeneous.ToVector(worldToBase.Multiply(new HomogeneousVector(ray.dir)));
        //having p[t] = (innerFrom[i]+t*innerDir[i])
        //Solve p[t].x^2+p[t].y^2-(p[t].z * tan(a))^2=0 for each i<3
        var aa = .0;
        var bb = .0;
        var cc = .0;
        var tana = Math.tan(this.angle);
        for (var index = 0; index < 3; index++) {
            var coef = (index == 2) ? (-tana * tana) : 1.0;
            aa += coef * innerDir.Get(index) * innerDir.Get(index);
            bb += coef * 2.0 * innerDir.Get(index) * innerFrom.Get(index);
            cc += coef * innerFrom.Get(index) * innerFrom.Get(index);
        }
        //Solve [t] aa.t^2 + bb.t + cc.t = 0
        var dd = bb * bb - 4.0 * aa * cc;
        var result = new Picking(wrapper);
        var nbResults = 0;
        var height = this.height;
        function acceptValue(value) {
            var point = innerFrom.Plus(innerDir.Times(value));
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
            var radius = tana * height;
            //test bounding disks
            //solve [t] : p[t].z = this.height
            var value = (this.height - innerFrom.Get(2)) / innerDir.Get(2);
            var point = innerFrom.Plus(innerDir.Times(value));
            if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (radius * radius)) {
                result.Add(value);
            }
        }
        return result;
    };
    Cone.prototype.Distance = function (point) {
        var delta = point.Minus(this.apex);
        var dist = delta.Norm();
        var beyondApex = (delta.Dot(this.axis)) < (-Math.sin(this.angle) * dist);
        if (beyondApex) {
            return dist;
        }
        else {
            return (Math.cos(this.angle) * delta.Cross(this.axis).Norm()) - (Math.sin(this.angle) * delta.Dot(this.axis));
        }
    };
    Cone.prototype.ComputeBounds = function (points) {
        var max = 0;
        for (var ii = 0; ii < points.Size(); ii++) {
            var d = points.GetPoint(ii).Minus(this.apex).Dot(this.axis);
            if (ii == 0 || d > max) {
                max = d;
            }
        }
        this.height = max;
    };
    Cone.InitialGuessForFitting = function (cloud) {
        var gsphere = new GaussianSphere(cloud);
        var plane = Geometry.PlaneFitting(gsphere);
        var planeheight = plane.center.Norm();
        var angle = Math.asin(planeheight);
        var size = cloud.Size();
        var planes = new Array(size);
        for (var index = 0; index < size; index++) {
            planes[index] = new PlaneFittingResult(cloud.GetPoint(index), gsphere.GetPoint(index));
        }
        var apex = Geometry.PlanesIntersection(planes);
        //Handle axis orientation : make it point to he cloud centroid ... otherwise, we could face ill-conditionned matrices during the fitting step
        var delta = Geometry.Centroid(cloud).Minus(apex);
        if (plane.normal.Dot(delta) < 0) {
            plane.normal = plane.normal.Times(-1);
        }
        return new Cone(apex, plane.normal, angle, 0);
    };
    Cone.prototype.FitToPoints = function (points) {
        var self = this;
        var lsFitting = new LeastSquaresFitting(ConeFitting.Parameters(this.apex, this.axis, this.angle), new ConeFitting(this), points, 'Computing best fitting cone');
        lsFitting.SetNext(function () { return self.FinalizeFitting(points); });
        lsFitting.Start();
    };
    Cone.prototype.FinalizeFitting = function (points) {
        //Compute actual cone height and axis direction
        var zmax = null;
        var size = points.Size();
        for (var index = 0; index < size; index++) {
            var z = points.GetPoint(index).Minus(this.apex).Dot(this.axis);
            if (zmax === null || Math.abs(zmax) < Math.abs(z)) {
                zmax = z;
            }
        }
        if (zmax < 0) {
            this.axis = this.axis.Times(-1);
        }
        this.height = Math.abs(zmax);
        this.NotifyChange();
    };
    return Cone;
}(Shape));
var ConeFitting = /** @class */ (function () {
    function ConeFitting(cone) {
        this.cone = cone;
    }
    ConeFitting.Parameters = function (apex, axis, angle) {
        var theta = Geometry.GetTheta(axis);
        var phi = Geometry.GetPhi(axis);
        var result = apex.Clone().Flatten();
        result.push(theta);
        result.push(phi);
        result.push(angle);
        return result;
    };
    ConeFitting.GetApex = function (params) {
        return new Vector(params.slice(0, 3));
    };
    ConeFitting.GetAxis = function (params) {
        return Geometry.GetZAxis(ConeFitting.GetTheta(params), ConeFitting.GetPhi(params));
    };
    ConeFitting.GetTheta = function (params) {
        return params[3];
    };
    ConeFitting.GetPhi = function (params) {
        return params[4];
    };
    ConeFitting.GetAngle = function (params) {
        return params[5];
    };
    ConeFitting.IsBeyondApex = function (apexToPoint, axis, angle) {
        return (apexToPoint.Dot(axis)) < (-Math.sin(angle) * apexToPoint.Norm());
    };
    ConeFitting.prototype.Distance = function (params, point) {
        var apex = ConeFitting.GetApex(params);
        var axis = ConeFitting.GetAxis(params);
        var angle = ConeFitting.GetAngle(params);
        var delta = point.Minus(apex);
        if (ConeFitting.IsBeyondApex(delta, axis, angle)) {
            return delta.Norm();
        }
        else {
            return (Math.cos(angle) * delta.Cross(axis).Norm()) - (Math.sin(angle) * delta.Dot(axis));
        }
    };
    ConeFitting.prototype.DistanceGradient = function (params, point) {
        var apex = ConeFitting.GetApex(params);
        var theta = ConeFitting.GetTheta(params);
        var phi = ConeFitting.GetPhi(params);
        var zaxis = Geometry.GetZAxis(theta, phi);
        var angle = ConeFitting.GetAngle(params);
        var delta = point.Minus(apex);
        if (ConeFitting.IsBeyondApex(delta, zaxis, angle)) {
            delta.Normalized();
            var result = delta.Times(-1).Flatten();
            result.push(0);
            result.push(0);
            result.push(0);
            return result;
        }
        else {
            var xaxis = Geometry.GetXAxis(theta, phi);
            var yaxis = Geometry.GetYAxis(theta, phi);
            var ca = Math.cos(angle);
            var sa = Math.sin(angle);
            var ss = delta.Dot(zaxis);
            var cc = delta.Cross(zaxis).Norm();
            var ff = (ca * ss / cc) + sa;
            var ddtheta = -ff * delta.Dot(xaxis);
            var ddphi = -Math.sin(theta) * ff * delta.Dot(yaxis);
            var ddapex = delta.Times(-ca / cc).Plus(zaxis.Times(ff));
            var ddangle = (-sa * cc) - (ca * ss);
            var result = ddapex.Flatten();
            result.push(ddtheta);
            result.push(ddphi);
            result.push(ddangle);
            return result;
        }
    };
    ConeFitting.prototype.NotifyNewSolution = function (params) {
        this.cone.apex = ConeFitting.GetApex(params);
        this.cone.axis = ConeFitting.GetAxis(params);
        this.cone.angle = ConeFitting.GetAngle(params);
    };
    return ConeFitting;
}());
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/cone.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
var PCLCone = /** @class */ (function (_super) {
    __extends(PCLCone, _super);
    function PCLCone(cone) {
        var _this = _super.call(this, NameProvider.GetName('Cone'), cone) || this;
        _this.cone = cone;
        return _this;
    }
    PCLCone.prototype.GetShape = function () {
        return this.cone;
    };
    PCLCone.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Apex', function () { return self.cone.apex; }, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', function () { return self.cone.axis; }, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Angle', function () { return Geometry.RadianToDegree(self.cone.angle); }, self.GeometryChangeHandler(function (value) { return self.cone.angle = Geometry.DegreeToRadian(value); })));
        geometry.Push(new NumberProperty('Height', function () { return self.cone.height; }, self.GeometryChangeHandler(function (value) { return self.cone.height = value; })));
        return geometry;
    };
    PCLCone.prototype.GetSerializationID = function () {
        return PCLCone.SerializationID;
    };
    PCLCone.prototype.SerializePrimitive = function (serializer) {
        var cone = this.cone;
        serializer.PushParameter('apex', function (s) {
            s.PushFloat32(cone.apex.Get(0));
            s.PushFloat32(cone.apex.Get(1));
            s.PushFloat32(cone.apex.Get(2));
        });
        serializer.PushParameter('axis', function (s) {
            s.PushFloat32(cone.axis.Get(0));
            s.PushFloat32(cone.axis.Get(1));
            s.PushFloat32(cone.axis.Get(2));
        });
        serializer.PushParameter('angle', function (s) {
            s.PushFloat32(cone.angle);
        });
        serializer.PushParameter('height', function (s) {
            s.PushFloat32(cone.height);
        });
    };
    PCLCone.prototype.GetParsingHandler = function () {
        return new PCLConeParsingHandler();
    };
    PCLCone.SerializationID = 'CONE';
    return PCLCone;
}(PCLShape));
var PCLConeParsingHandler = /** @class */ (function (_super) {
    __extends(PCLConeParsingHandler, _super);
    function PCLConeParsingHandler() {
        return _super.call(this) || this;
    }
    PCLConeParsingHandler.prototype.ProcessPrimitiveParam = function (paramname, parser) {
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
    };
    PCLConeParsingHandler.prototype.FinalizePrimitive = function () {
        var cone = new Cone(this.apex, this.axis, this.angle, this.height);
        return new PCLCone(cone);
    };
    return PCLConeParsingHandler;
}(PCLPrimitiveParsingHandler));
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../tools/transform.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../boundingbox.ts" />
/// <reference path="../pointcloud.ts" />
/// <reference path="../mesh.ts" />
/// <reference path="shape.ts" />
var Torus = /** @class */ (function (_super) {
    __extends(Torus, _super);
    function Torus(center, axis, greatRadius, smallRadius) {
        var _this = _super.call(this) || this;
        _this.center = center;
        _this.axis = axis;
        _this.greatRadius = greatRadius;
        _this.smallRadius = smallRadius;
        return _this;
    }
    Torus.prototype.ComputeMesh = function (sampling, onDone) {
        var points = new PointCloud();
        points.Reserve(sampling * sampling);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        for (var ii = 0; ii < sampling; ii++) {
            var phi = 2.0 * ii * Math.PI / sampling;
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var radiusVect = xx.Times(c).Plus(yy.Times(s));
            var faceCenter = this.center.Plus(radiusVect.Times(this.greatRadius));
            for (var jj = 0; jj < sampling; jj++) {
                var theta = 2.0 * jj * Math.PI / sampling;
                var ct = Math.cos(theta);
                var st = Math.sin(theta);
                points.PushPoint(faceCenter.Plus(radiusVect.Times(this.smallRadius * ct)).Plus(this.axis.Times(this.smallRadius * st)));
            }
        }
        var mesh = new Mesh(points);
        mesh.Reserve(2 * sampling * sampling);
        for (var ii = 0; ii < sampling; ii++) {
            var ia = ii * sampling;
            var ib = ((ii + 1) % sampling) * sampling;
            for (var jj = 0; jj < sampling; jj++) {
                var ja = jj;
                var jb = ((jj + 1) % sampling);
                //            [ia]        [ib]
                //   [ja] ---- aa -------- ba
                //             |           |
                //   [jb] ---- ab -------- bb
                var aa = ia + ja;
                var ab = ia + jb;
                var bb = ib + jb;
                var ba = ib + ja;
                mesh.PushFace([ab, aa, ba]);
                mesh.PushFace([ab, ba, bb]);
            }
        }
        mesh.ComputeNormals(onDone);
        return mesh;
    };
    Torus.prototype.ComputeBoundingBox = function () {
        var proj = new Vector([this.axis.Get(0), this.axis.Get(1)]);
        var size = new Vector([
            Math.sqrt(1 - (this.axis.Get(0) * this.axis.Get(0))) * this.greatRadius + this.smallRadius,
            Math.sqrt(1 - (this.axis.Get(1) * this.axis.Get(1))) * this.greatRadius + this.smallRadius,
            proj.Norm() * this.greatRadius + this.smallRadius
        ]);
        var bb = new BoundingBox();
        bb.Set(this.center, size.Times(2.0));
        return bb;
    };
    Torus.prototype.GetWorldToInnerBaseMatrix = function () {
        var translation = Matrix.Identity(4);
        var basechange = Matrix.Identity(4);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, xx.Get(index));
            basechange.SetValue(1, index, yy.Get(index));
            basechange.SetValue(2, index, this.axis.Get(index));
            translation.SetValue(index, 3, -this.center.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Torus.prototype.RayIntersection = function (ray, wrapper) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFromMatrix = worldToBase.Multiply(new HomogeneousPoint(ray.from));
        var innerDirMatrix = worldToBase.Multiply(new HomogeneousVector(ray.dir));
        var innerDir = new Vector([innerDirMatrix.GetValue(0, 0), innerDirMatrix.GetValue(1, 0), innerDirMatrix.GetValue(2, 0)]);
        var innerFrom = new Vector([innerFromMatrix.GetValue(0, 0), innerFromMatrix.GetValue(1, 0), innerFromMatrix.GetValue(2, 0)]);
        var grr = this.greatRadius * this.greatRadius;
        var srr = this.smallRadius * this.smallRadius;
        var alpha = innerDir.Dot(innerDir);
        var beta = 2.0 * innerDir.Dot(innerFrom);
        var gamma = innerFrom.Dot(innerFrom) + grr - srr;
        innerDir.Set(2, 0);
        innerFrom.Set(2, 0);
        var eta = innerDir.Dot(innerDir);
        var mu = 2.0 * innerDir.Dot(innerFrom);
        var nu = innerFrom.Dot(innerFrom);
        //Quartic defining the equation of the torus
        var quartic = new Polynomial([
            (gamma * gamma) - (4.0 * grr * nu),
            (2.0 * beta * gamma) - (4.0 * grr * mu),
            (beta * beta) + (2.0 * alpha * gamma) - (4.0 * grr * eta),
            2.0 * alpha * beta,
            alpha * alpha
        ]);
        var roots = quartic.FindRealRoots(this.center.Minus(ray.from).Dot(ray.dir));
        var result = new Picking(wrapper);
        for (var index = 0; index < roots.length; index++) {
            result.Add(roots[index]);
        }
        return result;
    };
    Torus.prototype.Distance = function (point) {
        var d = point.Minus(this.center);
        var aa = this.greatRadius - this.axis.Cross(d).Norm();
        var bb = this.axis.Dot(d);
        return Math.abs(Math.sqrt(aa * aa + bb * bb) - this.smallRadius);
    };
    Torus.prototype.ApplyTransform = function (transform) {
        this.axis = transform.TransformVector(this.axis).Normalized();
        this.center = transform.TransformPoint(this.center);
        this.greatRadius *= transform.scalefactor;
        this.smallRadius *= transform.scalefactor;
    };
    Torus.prototype.ComputeBounds = function (points) {
        //NA
    };
    Torus.prototype.FitToPoints = function (points) {
        throw 'Not implemented yet';
    };
    return Torus;
}(Shape));
/// <reference path="pclshape.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../model/shapes/shape.ts" />
/// <reference path="../../model/shapes/torus.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/vectorproperty.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../files/pclserializer.ts" />
var PCLTorus = /** @class */ (function (_super) {
    __extends(PCLTorus, _super);
    function PCLTorus(torus) {
        var _this = _super.call(this, NameProvider.GetName('Torus'), torus) || this;
        _this.torus = torus;
        return _this;
    }
    PCLTorus.prototype.GetShape = function () {
        return this.torus;
    };
    PCLTorus.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', function () { return self.torus.center; }, false, this.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', function () { return self.torus.axis; }, true, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Great Radius', function () { return self.torus.greatRadius; }, this.GeometryChangeHandler(function (value) { return self.torus.greatRadius = value; })));
        geometry.Push(new NumberProperty('Small Radius', function () { return self.torus.smallRadius; }, this.GeometryChangeHandler(function (value) { return self.torus.smallRadius = value; })));
        return geometry;
    };
    PCLTorus.prototype.GetSerializationID = function () {
        return PCLTorus.SerializationID;
    };
    PCLTorus.prototype.SerializePrimitive = function (serializer) {
        var torus = this.torus;
        serializer.PushParameter('center', function (s) {
            s.PushFloat32(torus.center.Get(0));
            s.PushFloat32(torus.center.Get(1));
            s.PushFloat32(torus.center.Get(2));
        });
        serializer.PushParameter('axis', function (s) {
            s.PushFloat32(torus.axis.Get(0));
            s.PushFloat32(torus.axis.Get(1));
            s.PushFloat32(torus.axis.Get(2));
        });
        serializer.PushParameter('smallradius', function (s) {
            s.PushFloat32(torus.smallRadius);
        });
        serializer.PushParameter('greatradius', function (s) {
            s.PushFloat32(torus.greatRadius);
        });
    };
    PCLTorus.prototype.GetParsingHandler = function () {
        return new PCLTorusParsingHandler();
    };
    PCLTorus.SerializationID = 'TORUS';
    return PCLTorus;
}(PCLShape));
var PCLTorusParsingHandler = /** @class */ (function (_super) {
    __extends(PCLTorusParsingHandler, _super);
    function PCLTorusParsingHandler() {
        return _super.call(this) || this;
    }
    PCLTorusParsingHandler.prototype.ProcessPrimitiveParam = function (paramname, parser) {
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
    };
    PCLTorusParsingHandler.prototype.FinalizePrimitive = function () {
        var torus = new Torus(this.center, this.axis, this.greatradius, this.smallradius);
        return new PCLTorus(torus);
    };
    return PCLTorusParsingHandler;
}(PCLPrimitiveParsingHandler));
/// <reference path="delegate.ts" />
/// <reference path="../../gui/objects/pclnode.ts" />
/// <reference path="../../gui/controls/dialog.ts" />
var ScanFromCurrentViewPointAction = /** @class */ (function (_super) {
    __extends(ScanFromCurrentViewPointAction, _super);
    function ScanFromCurrentViewPointAction(group, deletgate) {
        var _this = _super.call(this, 'Scan from current viewpoint', 'Create an new point cloud by simulating a LIDAR scanning of the group contents, from the current view point') || this;
        _this.group = group;
        _this.deletgate = deletgate;
        return _this;
    }
    ScanFromCurrentViewPointAction.prototype.Enabled = function () {
        return this.group.IsScannable();
    };
    ScanFromCurrentViewPointAction.prototype.Trigger = function () {
        var self = this;
        var dialog = new Dialog(
        //Ok has been clicked
        function (properties) {
            return self.LaunchScan(properties);
        }, 
        //Cancel has been clicked
        function () { return true; });
        dialog.InsertValue(ScanFromCurrentViewPointAction.hSamplingTitle, 1084);
        dialog.InsertValue(ScanFromCurrentViewPointAction.vSamplingTitle, 768);
    };
    ScanFromCurrentViewPointAction.prototype.LaunchScan = function (properties) {
        var hsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.hSamplingTitle));
        var vsampling = parseInt(properties.GetValue(ScanFromCurrentViewPointAction.vSamplingTitle));
        if (isNaN(hsampling) || isNaN(vsampling) || hsampling < 0 || vsampling < 0) {
            return false;
        }
        this.deletgate.ScanFromCurrentViewPoint(this.group, hsampling, vsampling);
        return true;
    };
    ScanFromCurrentViewPointAction.hSamplingTitle = 'Horizontal Sampling';
    ScanFromCurrentViewPointAction.vSamplingTitle = 'Vertical Sampling';
    return ScanFromCurrentViewPointAction;
}(Action));
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
var PCLGroup = /** @class */ (function (_super) {
    __extends(PCLGroup, _super);
    function PCLGroup(name, supportsPrimitivesCreation) {
        if (supportsPrimitivesCreation === void 0) { supportsPrimitivesCreation = true; }
        var _this = _super.call(this, name) || this;
        _this.supportsPrimitivesCreation = supportsPrimitivesCreation;
        _this.children = [];
        _this.folded = false;
        return _this;
    }
    PCLGroup.prototype.SetFolding = function (f) {
        var changed = f !== this.folded;
        this.folded = f;
        if (changed) {
            this.NotifyChange(this, ChangeType.Folding);
        }
    };
    PCLGroup.prototype.ToggleFolding = function () {
        this.SetFolding(!this.folded);
    };
    PCLGroup.prototype.DrawNode = function (drawingContext) {
        if (this.visible) {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index].Draw(drawingContext);
            }
        }
    };
    PCLGroup.prototype.RayIntersection = function (ray) {
        var picked = null;
        for (var index = 0; index < this.children.length; index++) {
            if (this.children[index].visible) {
                var intersection = this.children[index].RayIntersection(ray);
                if (picked == null || (intersection && intersection.Compare(picked) < 0)) {
                    picked = intersection;
                }
            }
        }
        return picked;
    };
    PCLGroup.prototype.GetDistance = function (p) {
        var dist = null;
        for (var index = 0; index < this.children.length; index++) {
            var d = this.children[index].GetDistance(p);
            if (dist == null || d < dist) {
                dist = d;
            }
        }
        return dist;
    };
    PCLGroup.prototype.Add = function (son) {
        if (son.owner) {
            son.owner.Remove(son);
        }
        son.owner = this;
        this.children.push(son);
        this.NotifyChange(this, ChangeType.Children | ChangeType.Properties);
    };
    PCLGroup.prototype.Insert = function (node, refnode, mode) {
        if (node.owner) {
            node.owner.Remove(node);
        }
        node.owner = this;
        var index = this.children.indexOf(refnode);
        this.children.splice(mode == PCLInsertionMode.Before ? index : (index + 1), 0, node);
        this.NotifyChange(this, ChangeType.Children | ChangeType.Properties);
    };
    PCLGroup.prototype.Remove = function (son) {
        var position = -1;
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
    };
    PCLGroup.prototype.GetBoundingBox = function () {
        var boundingbox = new BoundingBox();
        for (var index = 0; index < this.children.length; index++) {
            var bb = this.children[index].GetBoundingBox();
            if (bb && bb.IsValid()) {
                boundingbox.Add(bb.min);
                boundingbox.Add(bb.max);
            }
        }
        return boundingbox;
    };
    PCLGroup.prototype.Apply = function (proc) {
        if (!_super.prototype.Apply.call(this, proc)) {
            return false;
        }
        for (var index = 0; index < this.children.length; index++) {
            if (this.children[index].Apply(proc) === false) {
                return false;
            }
        }
        return true;
    };
    PCLGroup.prototype.GetChildren = function () {
        return this.children;
    };
    PCLGroup.prototype.GetActions = function (delegate) {
        var self = this;
        var result = _super.prototype.GetActions.call(this, delegate);
        result.push(null);
        if (this.folded) {
            result.push(new SimpleAction('Unfold', function () {
                self.folded = false;
                self.NotifyChange(self, ChangeType.Folding);
            }));
        }
        else {
            result.push(new SimpleAction('Fold', function () {
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
    };
    PCLGroup.prototype.FillProperties = function () {
        if (this.properties) {
            var self_6 = this;
            var children = new NumberProperty('Children', function () { return self_6.children.length; }, null);
            children.SetReadonly();
            this.properties.Push(children);
        }
    };
    PCLGroup.prototype.WrapNodeCreator = function (creator) {
        var self = this;
        return function () {
            var node = creator();
            self.Add(node);
            node.NotifyChange(node, ChangeType.NewItem);
        };
    };
    PCLGroup.prototype.GetGroupCreator = function () {
        return function () {
            return new PCLGroup(NameProvider.GetName('Group'));
        };
    };
    PCLGroup.prototype.GetPlaneCreator = function () {
        return function () {
            var plane = new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1);
            return new PCLPlane(plane);
        };
    };
    PCLGroup.prototype.GetSphereCreator = function () {
        return function () {
            var sphere = new Sphere(new Vector([0, 0, 0]), 1);
            return new PCLSphere(sphere);
        };
    };
    PCLGroup.prototype.GetCylinderCreator = function () {
        return function () {
            var cylinder = new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1);
            return new PCLCylinder(cylinder);
        };
    };
    PCLGroup.prototype.GetConeCreator = function () {
        return function () {
            var cone = new Cone(new Vector([0, 0, 0]), new Vector([0, 0, 1]), Math.PI / 6.0, 1);
            return new PCLCone(cone);
        };
    };
    PCLGroup.prototype.GetTorusCreator = function () {
        return function () {
            var torus = new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1);
            return new PCLTorus(torus);
        };
    };
    PCLGroup.prototype.IsScannable = function () {
        return !this.Apply(function (p) { return !(p instanceof PCLShape || p instanceof PCLMesh); });
    };
    PCLGroup.prototype.GetDisplayIcon = function () {
        return 'fa-folder' + (this.folded ? '' : '-open');
    };
    PCLGroup.prototype.GetSerializationID = function () {
        return PCLGroup.SerializationID;
    };
    PCLGroup.prototype.SerializeNode = function (serializer) {
        var self = this;
        if (!this.supportsPrimitivesCreation) {
            serializer.PushParameter('noprimitives');
        }
        var _loop_1 = function (index) {
            serializer.PushParameter('child', function () {
                self.children[index].Serialize(serializer);
            });
        };
        for (var index = 0; index < this.children.length; index++) {
            _loop_1(index);
        }
    };
    PCLGroup.prototype.GetParsingHandler = function () {
        return new PCLGroupParsingHandler();
    };
    PCLGroup.SerializationID = 'GROUP';
    return PCLGroup;
}(PCLNode));
var PCLGroupParsingHandler = /** @class */ (function (_super) {
    __extends(PCLGroupParsingHandler, _super);
    function PCLGroupParsingHandler() {
        var _this = _super.call(this) || this;
        _this.children = [];
        return _this;
    }
    PCLGroupParsingHandler.prototype.ProcessNodeParam = function (paramname, parser) {
        switch (paramname) {
            case 'noprimitives':
                this.noprimitives = true;
                return true;
            case 'child':
                var child = parser.ProcessNextObject();
                if (!(child instanceof PCLNode)) {
                    throw 'group children are expected to be valid nodes';
                }
                if (child) {
                    this.children.push(child);
                }
                return true;
        }
        return false;
    };
    PCLGroupParsingHandler.prototype.GetObject = function () {
        return new PCLGroup(this.name, !this.noprimitives);
    };
    PCLGroupParsingHandler.prototype.FinalizeNode = function () {
        var group = this.GetObject();
        for (var index = 0; index < this.children.length; index++) {
            group.Add(this.children[index]);
        }
        return group;
    };
    return PCLGroupParsingHandler;
}(PCLNodeParsingHandler));
/// <reference path="../../gui/objects/pclgroup.ts" />
var ScalarField = /** @class */ (function () {
    function ScalarField(values) {
        this.values = values || new Float32Array([]);
        this.nbvalues = this.values.length;
        this.min = null;
        this.max = null;
    }
    ScalarField.prototype.Reserve = function (capacity) {
        if (capacity > this.nbvalues) {
            var values = new Float32Array(capacity);
            for (var index = 0; index < this.nbvalues; index++) {
                values[index] = this.values[index];
            }
            this.values = values;
        }
    };
    ScalarField.prototype.GetValue = function (index) {
        return this.values[index];
    };
    ScalarField.prototype.SetValue = function (index, value) {
        this.values[index] = value;
        if (this.min === null || value < this.min) {
            this.min = value;
        }
        if (this.max === null || value > this.max) {
            this.max = value;
        }
    };
    ScalarField.prototype.PushValue = function (value) {
        this.SetValue(this.nbvalues, value);
        this.nbvalues++;
    };
    ScalarField.prototype.Size = function () {
        return this.nbvalues;
    };
    ScalarField.prototype.Min = function () {
        if (this.min === null) {
            for (var index = 0; index < this.nbvalues; index++) {
                if (this.min === null || this.values[index] < this.min) {
                    this.min = this.values[index];
                }
            }
        }
        return this.min;
    };
    ScalarField.prototype.Max = function () {
        if (this.max === null) {
            for (var index = 0; index < this.nbvalues; index++) {
                if (this.max === null || this.values[index] > this.max) {
                    this.max = this.values[index];
                }
            }
        }
        return this.max;
    };
    return ScalarField;
}());
/// <reference path="../maths/vector.ts" />
/// <reference path="../maths/geometry.ts" />
/// <reference path="pointcloud.ts" />
/// <reference path="shapes/shape.ts" />
/// <reference path="shapes/plane.ts" />
/// <reference path="shapes/sphere.ts" />
/// <reference path="shapes/cylinder.ts" />
/// <reference path="../tools/longprocess.ts" />
var Ransac = /** @class */ (function () {
    function Ransac(cloud, generators, nbFailure, noise) {
        if (generators === void 0) { generators = null; }
        this.cloud = cloud;
        this.generators = generators;
        this.nbFailure = nbFailure;
        this.noise = noise;
        this.nbPoints = 3;
        this.ignore = new Array(this.cloud.Size());
        for (var ii = 0; ii < this.cloud.Size(); ii++) {
            this.ignore[ii] = false;
        }
        this.remainingPoints = this.cloud.Size();
    }
    Ransac.prototype.SetGenerators = function (generators) {
        this.generators = generators;
    };
    Ransac.prototype.IsDone = function () {
        return this.remainingPoints > 0;
    };
    Ransac.prototype.FindBestFittingShape = function (onDone) {
        var step = new RansacStepProcessor(this);
        step.SetNext(function (s) { return onDone(s.best); });
        step.Start();
        return step;
    };
    Ransac.prototype.PickPoints = function () {
        var points = [];
        while (points.length < this.nbPoints) {
            var index = Math.floor(Math.random() * this.cloud.Size());
            if (!this.ignore[index]) {
                for (var ii = 0; ii < points.length; ii++) {
                    if (index === points[ii].index)
                        index = null;
                }
                if (index != null && index < this.cloud.Size()) {
                    points.push(new PickedPoints(index, this.cloud.GetPoint(index), this.cloud.GetNormal(index)));
                }
            }
        }
        return points;
    };
    Ransac.prototype.GenerateCandidate = function (points) {
        //Generate a candidate shape
        var candidates = [];
        for (var ii = 0; ii < this.generators.length; ii++) {
            var shape = this.generators[ii](points);
            if (shape != null) {
                candidates.push(new Candidate(shape));
            }
        }
        //Compute scores and keep the best candidate
        var candidate = null;
        for (var ii = 0; ii < candidates.length; ii++) {
            candidates[ii].ComputeScore(this.cloud, this.noise, this.ignore);
            if (candidate == null || candidate.score > candidates[ii].score) {
                candidate = candidates[ii];
            }
        }
        return candidate;
    };
    Ransac.RansacPlane = function (points) {
        var result = new Plane(points[0].point, points[0].normal, 0);
        return result;
    };
    Ransac.RansacSphere = function (points) {
        var r1 = new Ray(points[0].point, points[0].normal);
        var r2 = new Ray(points[1].point, points[1].normal);
        var center = Geometry.LinesIntersection(r1, r2);
        var radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());
        return new Sphere(center, radius);
    };
    Ransac.RansacCylinder = function (points) {
        var r1 = new Ray(points[0].point, points[0].normal);
        var r2 = new Ray(points[1].point, points[1].normal);
        var center = Geometry.LinesIntersection(r1, r2);
        var axis = r1.dir.Cross(r2.dir);
        var radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());
        return new Cylinder(center, axis, radius, 0);
    };
    Ransac.RansacCone = function (points) {
        var axis = points[2].normal.Minus(points[0].normal).Cross(points[1].normal.Minus(points[0].normal));
        axis.Normalize();
        var hh = axis.Dot(points[0].normal);
        var angle = Math.asin(hh);
        var planes = [
            new PlaneFittingResult(points[0].point, points[0].normal),
            new PlaneFittingResult(points[1].point, points[1].normal),
            new PlaneFittingResult(points[2].point, points[2].normal)
        ];
        var apex = Geometry.PlanesIntersection(planes);
        if (axis.Dot(points[0].point.Minus(apex)) < 0) {
            axis = axis.Times(-1);
        }
        return new Cone(apex, axis, angle, 0);
    };
    return Ransac;
}());
var PickedPoints = /** @class */ (function () {
    function PickedPoints(index, point, normal) {
        this.index = index;
        this.point = point;
        this.normal = normal;
    }
    return PickedPoints;
}());
var Candidate = /** @class */ (function () {
    function Candidate(shape) {
        this.shape = shape;
    }
    Candidate.prototype.ComputeScore = function (cloud, noise, ignore) {
        this.score = 0;
        this.points = [];
        //Suboptimal. TODO : use the KDTree to grant fast access to the shapes neighbours
        for (var ii = 0; ii < cloud.Size(); ii++) {
            if (!ignore[ii]) {
                var dist = this.shape.Distance(cloud.GetPoint(ii));
                if (dist > noise) {
                    dist = noise;
                }
                else {
                    this.points.push(ii);
                }
                this.score += dist * dist;
            }
        }
    };
    return Candidate;
}());
var RansacStepProcessor = /** @class */ (function (_super) {
    __extends(RansacStepProcessor, _super);
    function RansacStepProcessor(ransac) {
        var _this = _super.call(this, 'Searching for a new shape in the point cloud') || this;
        _this.ransac = ransac;
        _this.nbTrials = 0;
        _this.progress = 0;
        return _this;
    }
    Object.defineProperty(RansacStepProcessor.prototype, "Done", {
        get: function () {
            return this.nbTrials >= this.ransac.nbFailure;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RansacStepProcessor.prototype, "Current", {
        get: function () {
            return this.progress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RansacStepProcessor.prototype, "Target", {
        get: function () {
            return this.ransac.nbFailure;
        },
        enumerable: true,
        configurable: true
    });
    RansacStepProcessor.prototype.Step = function () {
        var points = this.ransac.PickPoints();
        var candidate = this.ransac.GenerateCandidate(points);
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
    };
    RansacStepProcessor.prototype.Finalize = function () {
        this.best.shape.FitToPoints(new PointSubCloud(this.ransac.cloud, this.best.points));
        this.best.ComputeScore(this.ransac.cloud, this.ransac.noise, this.ransac.ignore);
        this.best.shape.ComputeBounds(new PointSubCloud(this.ransac.cloud, this.best.points));
        for (var index = 0; index < this.best.points.length; index++) {
            this.ransac.ignore[this.best.points[index]] = true;
            this.ransac.remainingPoints--;
        }
    };
    return RansacStepProcessor;
}(LongProcess));
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../../files/pclserializer.ts" />
//=================================================
// The PCLScalar field extends the scalar field by providing
// - a name
// - color settings for display prupose (color scale)
// - a range to be displayed
//=================================================
var PCLScalarField = /** @class */ (function (_super) {
    __extends(PCLScalarField, _super);
    function PCLScalarField(name, values) {
        var _this = _super.call(this, values) || this;
        _this.name = name;
        _this.colormin = [0, 0, 1];
        _this.colormax = [1, 0, 0];
        _this.displaymin = null;
        _this.displaymax = null;
        return _this;
    }
    PCLScalarField.prototype.NotifyChange = function () {
        if (this.onChange) {
            this.onChange();
        }
    };
    PCLScalarField.prototype.GetDisplayMin = function () {
        return this.displaymin === null ? this.Min() : this.displaymin;
    };
    PCLScalarField.prototype.SetDisplayMin = function (v) {
        this.displaymin = v;
        this.NotifyChange();
    };
    PCLScalarField.prototype.GetDisplayMax = function () {
        return this.displaymax === null ? this.Max() : this.displaymax;
    };
    PCLScalarField.prototype.SetDisplayMax = function (v) {
        this.displaymax = v;
        this.NotifyChange();
    };
    PCLScalarField.prototype.GetSerializationID = function () {
        return PCLScalarField.SerializationID;
    };
    PCLScalarField.prototype.SetColorMin = function (c) {
        this.colormin = c;
        this.NotifyChange();
    };
    PCLScalarField.prototype.SetColorMax = function (c) {
        this.colormax = c;
        this.NotifyChange();
    };
    PCLScalarField.prototype.Serialize = function (serializer) {
        var _this = this;
        serializer.Start(this);
        var self = this;
        serializer.PushParameter('name', function (s) {
            s.PushString(self.name);
        });
        if (this.displaymin) {
            serializer.PushParameter('displaymin', function (s) {
                s.PushFloat32(_this.displaymin);
            });
        }
        if (this.displaymax) {
            serializer.PushParameter('displaymax', function (s) {
                s.PushFloat32(_this.displaymax);
            });
        }
        serializer.PushParameter('colormin', function (s) {
            s.PushFloat32(_this.colormin[0]);
            s.PushFloat32(_this.colormin[1]);
            s.PushFloat32(_this.colormin[2]);
        });
        serializer.PushParameter('colormax', function (s) {
            s.PushFloat32(_this.colormax[0]);
            s.PushFloat32(_this.colormax[1]);
            s.PushFloat32(_this.colormax[2]);
        });
        serializer.PushParameter('values', function (s) {
            s.PushInt32(self.Size());
            for (var index = 0; index < self.Size(); index++) {
                s.PushFloat32(self.GetValue(index));
            }
        });
        serializer.End(this);
    };
    PCLScalarField.prototype.GetParsingHandler = function () {
        return new PCLScalarFieldParsingHandler();
    };
    PCLScalarField.DensityFieldName = 'Density';
    PCLScalarField.NoiseFieldName = 'Noise';
    PCLScalarField.SerializationID = 'SCALARFIELD';
    return PCLScalarField;
}(ScalarField));
var PCLScalarFieldParsingHandler = /** @class */ (function () {
    function PCLScalarFieldParsingHandler() {
    }
    PCLScalarFieldParsingHandler.prototype.ProcessParam = function (paramname, parser) {
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
                var nbvalues = parser.reader.GetNextInt32();
                this.values = new Float32Array(nbvalues);
                for (var index = 0; index < nbvalues; index++) {
                    this.values[index] = parser.reader.GetNextFloat32();
                }
                return true;
        }
        return false;
    };
    PCLScalarFieldParsingHandler.prototype.Finalize = function () {
        var scalarfield = new PCLScalarField(this.name, this.values);
        scalarfield.colormin = this.colormin;
        scalarfield.colormax = this.colormax;
        if (this.displaymin) {
            scalarfield.displaymin = this.displaymin;
        }
        if (this.displaymax) {
            scalarfield.displaymax = this.displaymax;
        }
        return scalarfield;
    };
    return PCLScalarFieldParsingHandler;
}());
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
var PCLPointCloud = /** @class */ (function (_super) {
    __extends(PCLPointCloud, _super);
    function PCLPointCloud(cloud) {
        if (cloud === void 0) { cloud = null; }
        var _this = _super.call(this, NameProvider.GetName('PointCloud')) || this;
        _this.cloud = cloud;
        _this.fields = [];
        _this.currentfield = null;
        _this.drawing = new PointCloudDrawing();
        if (!_this.cloud) {
            _this.cloud = new PointCloud();
        }
        return _this;
    }
    PCLPointCloud.prototype.PushScalarField = function (field) {
        var _this = this;
        var self = this;
        this.fields.push(field);
        field.onChange = function () { return self.NotifyChange(_this, ChangeType.Display | ChangeType.ColorScale); };
    };
    PCLPointCloud.prototype.AddScalarField = function (name, values) {
        if (values === void 0) { values = null; }
        var field = new PCLScalarField(name, values);
        if (field.Size() == 0) {
            field.Reserve(this.cloud.Size());
        }
        else if (field.Size() !== this.cloud.Size()) {
            throw 'Cannot bind a scalar field whose size does not match (got: ' + field.Size() + ', expected: ' + this.cloud.Size();
        }
        this.PushScalarField(field);
        this.AddScaralFieldProperty(this.fields.length - 1);
        return field;
    };
    PCLPointCloud.prototype.GetDisplayIcon = function () {
        return 'fa-cloud';
    };
    PCLPointCloud.prototype.GetScalarField = function (name) {
        for (var index = 0; index < this.fields.length; index++) {
            if (this.fields[index].name === name) {
                return this.fields[index];
            }
        }
        return null;
    };
    PCLPointCloud.prototype.SetCurrentField = function (name, disableLighting) {
        if (disableLighting === void 0) { disableLighting = true; }
        for (var index = 0; index < this.fields.length; index++) {
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
    };
    PCLPointCloud.prototype.GetCurrentField = function () {
        if (this.currentfield !== null) {
            return this.fields[this.currentfield];
        }
        return null;
    };
    PCLPointCloud.prototype.RayIntersection = function (ray) {
        return new Picking(this);
    };
    PCLPointCloud.prototype.GetDistance = function (p) {
        return this.cloud.Distance(p);
    };
    PCLPointCloud.prototype.GetPrimitiveBoundingBox = function () {
        return this.cloud.boundingbox;
    };
    PCLPointCloud.prototype.GetActions = function (delegate) {
        var cloud = this;
        var result = _super.prototype.GetActions.call(this, delegate);
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
    };
    PCLPointCloud.prototype.TransformPrivitive = function (transform) {
        this.cloud.ApplyTransform(transform);
        this.InvalidateDrawing();
    };
    PCLPointCloud.prototype.FillProperties = function () {
        _super.prototype.FillProperties.call(this);
        if (this.properties) {
            var self_7 = this;
            var points = new NumberProperty('Points', function () { return self_7.cloud.Size(); }, null);
            points.SetReadonly();
            this.properties.Push(points);
            if (this.fields.length) {
                var fieldsProperty = new PropertyGroup(PCLPointCloud.ScalarFieldPropertyName);
                for (var index = 0; index < this.fields.length; index++) {
                    fieldsProperty.Add(this.GetScalarFieldProperty(index));
                }
                this.properties.Push(fieldsProperty);
            }
        }
    };
    PCLPointCloud.prototype.AddScaralFieldProperty = function (index) {
        if (this.properties) {
            var fieldsProperty = this.properties.GetPropertyByName(PCLPointCloud.ScalarFieldPropertyName);
            if (!fieldsProperty) {
                fieldsProperty = new PropertyGroup(PCLPointCloud.ScalarFieldPropertyName);
                this.properties.Push(fieldsProperty);
            }
            fieldsProperty.Add(this.GetScalarFieldProperty(index));
        }
    };
    PCLPointCloud.prototype.GetScalarFieldProperty = function (index) {
        var self = this;
        return new BooleanProperty(this.fields[index].name, function () { return (index === self.currentfield); }, function (value) {
            self.currentfield = value ? index : null;
            self.NotifyChange(self, ChangeType.ColorScale);
        });
    };
    PCLPointCloud.prototype.DrawPrimitive = function (drawingContext) {
        var field = this.currentfield !== null ? this.fields[this.currentfield] : null;
        this.drawing.FillBuffers(this.cloud, field, drawingContext);
        this.drawing.BindBuffers(this.lighting, !!field, drawingContext);
        this.drawing.Draw(drawingContext);
    };
    PCLPointCloud.prototype.InvalidateDrawing = function () {
        this.drawing.Clear();
        this.NotifyChange(this, ChangeType.Display | ChangeType.Properties);
    };
    PCLPointCloud.prototype.GetCSVData = function () {
        var result = 'x;y;z';
        if (this.cloud.HasNormals()) {
            result += ';nx;ny;nz';
        }
        for (var field = 0; field < this.fields.length; field++) {
            result += ';' + this.fields[field].name.replace(';', '_');
        }
        result += '\n';
        for (var index = 0; index < this.cloud.Size(); index++) {
            var point = this.cloud.GetPoint(index);
            result += point.Get(0) + ';' +
                point.Get(1) + ';' +
                point.Get(2);
            if (this.cloud.HasNormals()) {
                var normal = this.cloud.GetNormal(index);
                result += ';' + normal.Get(0) + ';' +
                    normal.Get(1) + ';' +
                    normal.Get(2);
            }
            for (var field = 0; field < this.fields.length; field++) {
                result += ';' + this.fields[field].GetValue(index);
            }
            result += '\n';
        }
        return result;
    };
    PCLPointCloud.prototype.GetSerializationID = function () {
        return PCLPointCloud.SerializationID;
    };
    PCLPointCloud.prototype.SerializePrimitive = function (serializer) {
        var self = this;
        serializer.PushParameter('points', function (s) {
            s.PushInt32(self.cloud.pointssize);
            for (var index = 0; index < self.cloud.pointssize; index++) {
                s.PushFloat32(self.cloud.points[index]);
            }
        });
        if (this.cloud.HasNormals()) {
            serializer.PushParameter('normals', function (s) {
                s.PushInt32(self.cloud.normalssize);
                for (var index = 0; index < self.cloud.normalssize; index++) {
                    s.PushFloat32(self.cloud.normals[index]);
                }
            });
        }
        var _loop_2 = function (index) {
            serializer.PushParameter('scalarfield', function (s) {
                self.fields[index].Serialize(serializer);
            });
        };
        for (var index = 0; index < this.fields.length; index++) {
            _loop_2(index);
        }
    };
    PCLPointCloud.prototype.GetParsingHandler = function () {
        return new PCLPointCloudParsingHandler();
    };
    PCLPointCloud.ScalarFieldPropertyName = 'Scalar fields';
    PCLPointCloud.SerializationID = 'POINTCLOUD';
    return PCLPointCloud;
}(PCLPrimitive));
var PCLPointCloudParsingHandler = /** @class */ (function (_super) {
    __extends(PCLPointCloudParsingHandler, _super);
    function PCLPointCloudParsingHandler() {
        var _this = _super.call(this) || this;
        _this.fields = [];
        return _this;
    }
    PCLPointCloudParsingHandler.prototype.ProcessPrimitiveParam = function (paramname, parser) {
        switch (paramname) {
            case 'points':
                var nbpoints = parser.reader.GetNextInt32();
                this.points = new Float32Array(nbpoints);
                for (var index = 0; index < nbpoints; index++) {
                    this.points[index] = parser.reader.GetNextFloat32();
                }
                return true;
            case 'normals':
                var nbnormals = parser.reader.GetNextInt32();
                this.normals = new Float32Array(nbnormals);
                for (var index = 0; index < nbnormals; index++) {
                    this.normals[index] = parser.reader.GetNextFloat32();
                }
                return true;
            case 'scalarfield':
                var field = parser.ProcessNextObject();
                if (!(field instanceof PCLScalarField)) {
                    return false;
                }
                this.fields.push(field);
                return true;
        }
        return false;
    };
    PCLPointCloudParsingHandler.prototype.FinalizePrimitive = function () {
        var cloud = new PCLPointCloud(new PointCloud(this.points, this.normals));
        for (var index = 0; index < this.fields.length; index++) {
            cloud.PushScalarField(this.fields[index]);
        }
        return cloud;
    };
    return PCLPointCloudParsingHandler;
}(PCLPrimitiveParsingHandler));
var PointCloudDrawing = /** @class */ (function () {
    function PointCloudDrawing() {
        this.glNormalsBuffer = null;
        this.glPointsBuffer = null;
    }
    PointCloudDrawing.prototype.FillBuffers = function (cloud, field, ctx) {
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
    };
    PointCloudDrawing.prototype.BindBuffers = function (uselighting, usescalars, ctx) {
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
    };
    PointCloudDrawing.prototype.Draw = function (ctx) {
        ctx.gl.drawArrays(ctx.gl.POINTS, 0, this.cloudsize);
        ctx.EnableScalars(false);
    };
    PointCloudDrawing.prototype.Clear = function () {
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
    };
    return PointCloudDrawing;
}());
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
var PCLShapeWrapper = /** @class */ (function () {
    function PCLShapeWrapper(shape) {
        this.shape = shape;
    }
    PCLShapeWrapper.prototype.GetPCLShape = function () {
        var result;
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
    };
    return PCLShapeWrapper;
}());
var FileExporter = /** @class */ (function () {
    function FileExporter() {
    }
    FileExporter.ExportFile = function (filename, filecontent, filetype) {
        var link = document.createElement('a');
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
    };
    return FileExporter;
}());
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
var PCLCloudAction = /** @class */ (function (_super) {
    __extends(PCLCloudAction, _super);
    function PCLCloudAction(cloud, message, hint) {
        if (hint === void 0) { hint = null; }
        var _this = _super.call(this, message, hint) || this;
        _this.cloud = cloud;
        return _this;
    }
    PCLCloudAction.prototype.GetPCLCloud = function () {
        return this.cloud;
    };
    PCLCloudAction.prototype.GetCloud = function () {
        return this.GetPCLCloud().cloud;
    };
    return PCLCloudAction;
}(Action));
//===================================================
// Generic cloud process
//===================================================
var CloudProcess = /** @class */ (function (_super) {
    __extends(CloudProcess, _super);
    function CloudProcess(cloud, message) {
        var _this = _super.call(this, cloud.Size(), message) || this;
        _this.cloud = cloud;
        return _this;
    }
    CloudProcess.prototype.GetResult = function () {
        return null;
    };
    return CloudProcess;
}(IterativeLongProcess));
//===================================================
// Shapes detection
//===================================================
var RansacDetectionAction = /** @class */ (function (_super) {
    __extends(RansacDetectionAction, _super);
    function RansacDetectionAction(cloud) {
        return _super.call(this, cloud, 'Detect shapes ...', 'Try to detect as many shapes as possible in the selected point cloud (using the RANSAC algorithm)') || this;
    }
    RansacDetectionAction.prototype.Enabled = function () {
        return this.GetCloud().HasNormals();
    };
    RansacDetectionAction.prototype.Trigger = function () {
        var self = this;
        var dialog = new Dialog(function (d) { return self.InitializeAndLauchRansac(d); }, function (d) { return true; });
        dialog.InsertValue('Failures', 100);
        dialog.InsertValue('Noise', 0.1);
        dialog.InsertTitle('Shapes to detect');
        dialog.InsertCheckBox('Planes', true);
        dialog.InsertCheckBox('Spheres', true);
        dialog.InsertCheckBox('Cylinders', true);
        dialog.InsertCheckBox('Cones', true);
    };
    RansacDetectionAction.prototype.InitializeAndLauchRansac = function (properties) {
        var nbFailure;
        var noise;
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
        var self = this;
        this.stoped = false;
        this.ransac = new Ransac(this.GetCloud(), generators, nbFailure, noise);
        this.progress = new ProgressBar(function () { return self.Stop(); });
        this.progress.Initialize('Dicovering shapes in the point cloud', this);
        this.LaunchNewRansacStep();
        return true;
    };
    RansacDetectionAction.prototype.Stopable = function () {
        return true;
    };
    RansacDetectionAction.prototype.Stop = function () {
        this.stoped = true;
        if (this.pendingstep) {
            this.pendingstep.Stop();
        }
        this.progress.Finalize();
        this.progress.Delete();
    };
    RansacDetectionAction.prototype.LaunchNewRansacStep = function () {
        var self = this;
        var target = this.ransac.cloud.Size();
        var done = target - this.ransac.remainingPoints;
        this.progress.Update(done, target);
        if (this.ransac.remainingPoints > this.ransac.nbPoints && !this.stoped) {
            setTimeout(function () {
                self.pendingstep = self.ransac.FindBestFittingShape(function (s) { return self.HandleResult(s); });
            }, this.progress.RefreshDelay());
        }
        else {
            if (!this.stoped) {
                this.GetPCLCloud().SetVisibility(false);
            }
            this.progress.Finalize();
            this.progress.Delete();
        }
    };
    RansacDetectionAction.prototype.HandleResult = function (candidate) {
        if (!this.stoped) {
            if (!this.result) {
                this.result = new PCLGroup('Shapes detection in "' + this.GetPCLCloud().name + '"');
                var owner = this.GetPCLCloud().owner;
                owner.Add(this.result);
                this.result.NotifyChange(this.result, ChangeType.NewItem);
            }
            var subcloud = new PointSubCloud(this.ransac.cloud, candidate.points);
            var segment = new PCLPointCloud(subcloud.ToPointCloud());
            this.result.Add(segment);
            segment.NotifyChange(segment, ChangeType.NewItem);
            var pclshape = new PCLShapeWrapper(candidate.shape).GetPCLShape();
            this.result.Add(pclshape);
            pclshape.NotifyChange(pclshape, ChangeType.NewItem);
            this.LaunchNewRansacStep();
        }
    };
    return RansacDetectionAction;
}(PCLCloudAction));
//===================================================
// Shapes fitting
//===================================================
var ShapeFittingResult = /** @class */ (function () {
    function ShapeFittingResult(cloud) {
        this.cloud = cloud;
        this.shapes = [];
        this.errors = [];
    }
    ShapeFittingResult.prototype.AddFittingResult = function (shape) {
        var error = 0;
        var size = this.cloud.Size();
        for (var index = 0; index < size; index++) {
            error += Math.pow(shape.Distance(this.cloud.GetPoint(index)), 2);
        }
        error /= size;
        this.shapes.push(shape);
        this.errors.push(error);
    };
    ShapeFittingResult.prototype.GetBestShape = function () {
        var bestindex = null;
        var besterror = null;
        for (var index = 0; index < this.shapes.length; index++) {
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
    };
    ShapeFittingResult.prototype.ShowResult = function (bestShapeIndex) {
        var message = 'Shapes fitting results :\n';
        message += '<table><tbody><tr style="font-style:italic;"><td>Shape</td><td>Mean Square Error</td></tr>';
        for (var index = 0; index < this.shapes.length; index++) {
            var emphasize = (index === bestShapeIndex);
            message += '<tr' + (emphasize ? ' style="color:green; text-decoration:underline;"' : '') + '>';
            message += '<td style="font-weight:bold;">';
            message += this.shapes[index].constructor['name'];
            message += '</td><td>';
            message += this.errors[index];
            message += '</td></tr>';
        }
        message += '</tbody></table>';
        new TemporaryHint(message, null);
    };
    return ShapeFittingResult;
}());
var FindBestFittingShapeAction = /** @class */ (function (_super) {
    __extends(FindBestFittingShapeAction, _super);
    function FindBestFittingShapeAction(cloud) {
        return _super.call(this, cloud, 'Find the best fitting shape ...', 'Compute the shape (plane, sphere, cylinder, cone) that best fits the whole selected point cloud (assuming the point cloud samples a single shape)') || this;
    }
    FindBestFittingShapeAction.prototype.Enabled = function () {
        return true;
    };
    FindBestFittingShapeAction.prototype.Trigger = function () {
        var self = this;
        var dialog = new Dialog(function (d) { return self.ComputeBestFittingShape(d); }, function (d) { return true; });
        dialog.InsertTitle('Shapes to be tested');
        dialog.InsertCheckBox('Plane', true);
        dialog.InsertCheckBox('Sphere', true);
        dialog.InsertCheckBox('Cylinder', true);
        dialog.InsertCheckBox('Cone', true);
    };
    FindBestFittingShapeAction.prototype.ComputeBestFittingShape = function (properties) {
        var cloud = this.GetCloud();
        this.results = new ShapeFittingResult(cloud);
        var fittingProcesses = [];
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
        if (fittingProcesses.length) {
            var self_8 = this;
            for (var index = 1; index < fittingProcesses.length; index++) {
                fittingProcesses[index - 1].SetNext(fittingProcesses[index]);
            }
            fittingProcesses[fittingProcesses.length - 1].SetNext(function () { return self_8.HandleResult(); });
            fittingProcesses[0].Start();
            return true;
        }
        return false;
    };
    FindBestFittingShapeAction.prototype.HandleResult = function () {
        var shape = this.results.GetBestShape();
        if (shape) {
            var pclshape = (new PCLShapeWrapper(shape)).GetPCLShape();
            pclshape.name = 'Best fit to "' + this.GetPCLCloud().name + '"';
            var owner = this.GetPCLCloud().owner;
            owner.Add(pclshape);
            owner.NotifyChange(pclshape, ChangeType.NewItem);
        }
    };
    return FindBestFittingShapeAction;
}(PCLCloudAction));
var LSFittingProcess = /** @class */ (function (_super) {
    __extends(LSFittingProcess, _super);
    function LSFittingProcess(fittingResult) {
        var _this = _super.call(this) || this;
        _this.fittingResult = fittingResult;
        return _this;
    }
    LSFittingProcess.prototype.Run = function (ondone) {
        var self = this;
        var shape = this.GetInitialGuess(this.fittingResult.cloud);
        shape.onChange = function () {
            shape.onChange = null;
            self.fittingResult.AddFittingResult(shape);
            ondone();
        };
        shape.FitToPoints(this.fittingResult.cloud);
    };
    return LSFittingProcess;
}(Process));
var PlaneFittingProcess = /** @class */ (function (_super) {
    __extends(PlaneFittingProcess, _super);
    function PlaneFittingProcess(fittingResult) {
        return _super.call(this, fittingResult) || this;
    }
    PlaneFittingProcess.prototype.GetInitialGuess = function () {
        return new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 0);
    };
    return PlaneFittingProcess;
}(LSFittingProcess));
var SphereFittingProcess = /** @class */ (function (_super) {
    __extends(SphereFittingProcess, _super);
    function SphereFittingProcess(fittingResult) {
        return _super.call(this, fittingResult) || this;
    }
    SphereFittingProcess.prototype.GetInitialGuess = function (cloud) {
        return Sphere.InitialGuessForFitting(cloud);
    };
    return SphereFittingProcess;
}(LSFittingProcess));
var CylinderFittingProcess = /** @class */ (function (_super) {
    __extends(CylinderFittingProcess, _super);
    function CylinderFittingProcess(fittingResult) {
        return _super.call(this, fittingResult) || this;
    }
    CylinderFittingProcess.prototype.GetInitialGuess = function (cloud) {
        return Cylinder.InitialGuessForFitting(cloud);
    };
    return CylinderFittingProcess;
}(LSFittingProcess));
var ConeFittingProcess = /** @class */ (function (_super) {
    __extends(ConeFittingProcess, _super);
    function ConeFittingProcess(fittingResult) {
        return _super.call(this, fittingResult) || this;
    }
    ConeFittingProcess.prototype.GetInitialGuess = function (cloud) {
        return Cone.InitialGuessForFitting(cloud);
    };
    return ConeFittingProcess;
}(LSFittingProcess));
//===================================================
// Normals computation
//===================================================
var ComputeNormalsAction = /** @class */ (function (_super) {
    __extends(ComputeNormalsAction, _super);
    function ComputeNormalsAction(cloud) {
        return _super.call(this, cloud, 'Compute normals', 'Compute the vectors normal to the surface sampled by this point cloud') || this;
    }
    ComputeNormalsAction.prototype.Enabled = function () {
        return !this.GetCloud().HasNormals();
    };
    ComputeNormalsAction.prototype.Trigger = function () {
        var k = 30;
        var cloud = this.GetPCLCloud();
        var ondone = function () { return cloud.InvalidateDrawing(); };
        var ncomputer = new NormalsComputer(this.GetCloud(), k);
        var nharmonizer = new NormalsComputer(this.GetCloud(), k);
        ncomputer.SetNext(nharmonizer).SetNext(ondone);
        ncomputer.Start();
    };
    return ComputeNormalsAction;
}(PCLCloudAction));
var NormalsComputer = /** @class */ (function (_super) {
    __extends(NormalsComputer, _super);
    function NormalsComputer(cloud, k) {
        var _this = _super.call(this, cloud.Size(), 'Computing normals (' + cloud.Size() + ' data points)') || this;
        _this.cloud = cloud;
        _this.k = k;
        return _this;
    }
    NormalsComputer.prototype.Initialize = function () {
        if (this.cloud.normals.length != this.cloud.points.length) {
            this.cloud.normals = new Float32Array(this.cloud.points.length);
        }
        this.cloud.ClearNormals();
    };
    NormalsComputer.prototype.Iterate = function (step) {
        var normal = this.cloud.ComputeNormal(step, this.k);
        this.cloud.PushNormal(normal);
    };
    return NormalsComputer;
}(IterativeLongProcess));
;
var NormalsHarmonizer = /** @class */ (function (_super) {
    __extends(NormalsHarmonizer, _super);
    function NormalsHarmonizer(cloud, k) {
        return _super.call(this, cloud, k, 'Harmonizing normals (' + cloud.Size() + ' data points)') || this;
    }
    NormalsHarmonizer.prototype.ProcessPoint = function (cloud, index, knn, region) {
        //Search for the neighbor whose normal orientation has been decided,
        //and whose normal is the most aligned with the current one
        var ss = 0;
        var normal = cloud.GetNormal(index);
        for (var ii = 0; ii < knn.length; ii++) {
            var nnindex = knn[ii].index;
            if (this.Status(nnindex) === RegionGrowthStatus.processed) {
                var nnormal = cloud.GetNormal(nnindex);
                var s = nnormal.Dot(normal);
                if (Math.abs(s) > Math.abs(ss))
                    ss = s;
            }
        }
        if (ss < 0)
            cloud.InvertNormal(index);
    };
    return NormalsHarmonizer;
}(RegionGrowthProcess));
;
var ClearNormalsAction = /** @class */ (function (_super) {
    __extends(ClearNormalsAction, _super);
    function ClearNormalsAction(cloud) {
        return _super.call(this, cloud, 'Clear normals', 'Clear previously computed normals') || this;
    }
    ClearNormalsAction.prototype.Enabled = function () {
        return this.GetCloud().HasNormals();
    };
    ClearNormalsAction.prototype.Trigger = function () {
        this.GetCloud().ClearNormals();
        this.GetPCLCloud().InvalidateDrawing();
    };
    return ClearNormalsAction;
}(PCLCloudAction));
var GaussianSphereAction = /** @class */ (function (_super) {
    __extends(GaussianSphereAction, _super);
    function GaussianSphereAction(cloud) {
        return _super.call(this, cloud, 'Extract the gaussian sphere', 'Builds a new point cloud made of the point cloud normals. The resulting point cloud will sample the unit sphere (since normals are unit vectors) - hence the name.') || this;
    }
    GaussianSphereAction.prototype.Enabled = function () {
        return this.GetCloud().HasNormals();
    };
    GaussianSphereAction.prototype.Trigger = function () {
        var gsphere = new PCLPointCloud(new GaussianSphere(this.GetCloud()).ToPointCloud());
        gsphere.name = 'Gaussian sphere of "' + this.GetPCLCloud().name + '"';
        this.GetPCLCloud().NotifyChange(gsphere, ChangeType.NewItem);
    };
    return GaussianSphereAction;
}(PCLCloudAction));
//===================================================
// Connected components
//===================================================
var ConnectedComponentsAction = /** @class */ (function (_super) {
    __extends(ConnectedComponentsAction, _super);
    function ConnectedComponentsAction(cloud) {
        return _super.call(this, cloud, 'Compute connected components', 'Split the point cloud into connected subsets') || this;
    }
    ConnectedComponentsAction.prototype.Enabled = function () {
        return true;
    };
    ConnectedComponentsAction.prototype.Trigger = function () {
        var k = 30;
        var self = this;
        var ondone = function (b) { return self.GetPCLCloud().NotifyChange(b.result, ChangeType.NewItem); };
        var builder = new ConnecterComponentsBuilder(this.GetCloud(), k, this.GetPCLCloud().name);
        builder.SetNext(ondone);
        builder.Start();
    };
    return ConnectedComponentsAction;
}(PCLCloudAction));
var ConnecterComponentsBuilder = /** @class */ (function (_super) {
    __extends(ConnecterComponentsBuilder, _super);
    function ConnecterComponentsBuilder(cloud, k, prefix) {
        var _this = _super.call(this, cloud, k, 'Computing connected components') || this;
        _this.result = new PCLGroup(prefix + ' - connected components');
        return _this;
    }
    ConnecterComponentsBuilder.prototype.ProcessPoint = function (cloud, index, knn, region) {
        if (region >= this.result.children.length)
            this.result.Add(new PCLPointCloud());
        var component = this.result.children[region].cloud;
        component.PushPoint(cloud.GetPoint(index));
        if (cloud.HasNormals())
            component.PushNormal(cloud.GetNormal(index));
    };
    return ConnecterComponentsBuilder;
}(RegionGrowthProcess));
//===================================================
// Density
//===================================================
var ComputeDensityAction = /** @class */ (function (_super) {
    __extends(ComputeDensityAction, _super);
    function ComputeDensityAction(cloud) {
        return _super.call(this, cloud, 'Compute density', 'Estimate the points density at each point of the cloud, and assign the corresponding scalar field') || this;
    }
    ComputeDensityAction.prototype.Enabled = function () {
        return !this.GetPCLCloud().GetScalarField(PCLScalarField.DensityFieldName);
    };
    ComputeDensityAction.prototype.Trigger = function () {
        var k = 30;
        var density = new DensityComputer(this.GetPCLCloud(), k);
        density.Start();
    };
    return ComputeDensityAction;
}(PCLCloudAction));
var DensityComputer = /** @class */ (function (_super) {
    __extends(DensityComputer, _super);
    function DensityComputer(cloud, k) {
        var _this = _super.call(this, cloud.cloud.Size(), 'Computing points density') || this;
        _this.cloud = cloud;
        _this.k = k;
        return _this;
    }
    DensityComputer.prototype.Initialize = function () {
        this.scalarfield = this.cloud.AddScalarField(PCLScalarField.DensityFieldName);
    };
    DensityComputer.prototype.Finalize = function () {
        this.cloud.SetCurrentField(PCLScalarField.DensityFieldName);
    };
    DensityComputer.prototype.Iterate = function (step) {
        var cloud = this.cloud.cloud;
        var nbh = cloud.KNearestNeighbours(cloud.GetPoint(step), this.k + 1);
        var ballSqrRadius = nbh.GetSqrDistance();
        this.scalarfield.PushValue(this.k / Math.sqrt(ballSqrRadius));
    };
    return DensityComputer;
}(IterativeLongProcess));
//===================================================
// Noise
//===================================================
var ComputeNoiseAction = /** @class */ (function (_super) {
    __extends(ComputeNoiseAction, _super);
    function ComputeNoiseAction(cloud) {
        return _super.call(this, cloud, 'Estimate noise', 'Estimate the noise, based on the mean weighted distance to the local planar surface at each point (requires normals).') || this;
    }
    ComputeNoiseAction.prototype.Enabled = function () {
        if (!this.GetCloud().HasNormals())
            return false;
        return !this.GetPCLCloud().GetScalarField(PCLScalarField.NoiseFieldName);
    };
    ComputeNoiseAction.prototype.Trigger = function () {
        var k = 10;
        var noise = new NoiseComputer(this.GetPCLCloud(), k);
        noise.Start();
    };
    return ComputeNoiseAction;
}(PCLCloudAction));
var NoiseComputer = /** @class */ (function (_super) {
    __extends(NoiseComputer, _super);
    function NoiseComputer(cloud, k) {
        var _this = _super.call(this, cloud.cloud.Size(), 'Computing points noise') || this;
        _this.cloud = cloud;
        _this.k = k;
        return _this;
    }
    NoiseComputer.prototype.Initialize = function () {
        this.scalarfield = this.cloud.AddScalarField(PCLScalarField.NoiseFieldName);
    };
    NoiseComputer.prototype.Finalize = function () {
        this.cloud.SetCurrentField(PCLScalarField.NoiseFieldName);
    };
    NoiseComputer.prototype.Iterate = function (step) {
        var cloud = this.cloud.cloud;
        var point = cloud.GetPoint(step);
        var normal = cloud.GetNormal(step);
        var nbh = cloud.KNearestNeighbours(point, this.k + 1).Neighbours();
        var noise = 0;
        for (var index = 0; index < nbh.length; index++) {
            noise += Math.abs(normal.Dot(cloud.GetPoint(nbh[index].index).Minus(point))) / (1 + nbh[index].sqrdistance);
        }
        this.scalarfield.PushValue(noise);
    };
    return NoiseComputer;
}(IterativeLongProcess));
//===================================================
// Noise
//===================================================
var ComputeDistancesAction = /** @class */ (function (_super) {
    __extends(ComputeDistancesAction, _super);
    function ComputeDistancesAction(cloud, target) {
        var _this = _super.call(this, cloud, 'Compute distances', 'Compute distances from a point cloud to another object') || this;
        _this.target = target;
        return _this;
    }
    ComputeDistancesAction.prototype.GetFieldName = function () {
        return 'Distance to "' + this.target.name + '"';
    };
    ComputeDistancesAction.prototype.Enabled = function () {
        return !this.GetPCLCloud().GetScalarField(this.GetFieldName());
    };
    ComputeDistancesAction.prototype.Trigger = function () {
        var noise = new DistancesComputer(this.GetPCLCloud(), this.target, this.GetFieldName());
        noise.Start();
    };
    return ComputeDistancesAction;
}(PCLCloudAction));
var DistancesComputer = /** @class */ (function (_super) {
    __extends(DistancesComputer, _super);
    function DistancesComputer(cloud, target, fieldName) {
        var _this = _super.call(this, cloud.cloud.Size(), 'Computing distances') || this;
        _this.cloud = cloud;
        _this.target = target;
        _this.fieldName = fieldName;
        return _this;
    }
    DistancesComputer.prototype.Initialize = function () {
        this.scalarfield = this.cloud.AddScalarField(this.fieldName);
    };
    DistancesComputer.prototype.Finalize = function () {
        this.cloud.SetCurrentField(this.fieldName);
    };
    DistancesComputer.prototype.Iterate = function (step) {
        var cloud = this.cloud.cloud;
        this.scalarfield.PushValue(this.target.GetDistance(cloud.GetPoint(step)));
    };
    return DistancesComputer;
}(IterativeLongProcess));
//===================================================
// File export
//===================================================
var ExportPointCloudFileAction = /** @class */ (function (_super) {
    __extends(ExportPointCloudFileAction, _super);
    function ExportPointCloudFileAction(cloud) {
        return _super.call(this, cloud, 'Export CSV file') || this;
    }
    ExportPointCloudFileAction.prototype.Enabled = function () {
        return true;
    };
    ExportPointCloudFileAction.prototype.Trigger = function () {
        FileExporter.ExportFile(this.GetPCLCloud().name + '.csv', this.GetPCLCloud().GetCSVData(), 'text/csv');
    };
    return ExportPointCloudFileAction;
}(PCLCloudAction));
/// <reference path="binarystream.ts" />
var BinaryWriter = /** @class */ (function (_super) {
    __extends(BinaryWriter, _super);
    function BinaryWriter(size) {
        return _super.call(this, size ? new ArrayBuffer(size) : null) || this;
    }
    BinaryWriter.prototype.PushUInt8 = function (value) {
        if (this.stream) {
            this.stream.setUint8(this.cursor, value);
        }
        this.cursor++;
        this.lastvalue = value;
    };
    BinaryWriter.prototype.PushInt32 = function (value) {
        if (this.stream) {
            this.stream.setInt32(this.cursor, value, this.endianness == Endianness.LittleEndian);
        }
        this.cursor += 4;
        this.lastvalue = value;
    };
    BinaryWriter.prototype.PushFloat32 = function (value) {
        if (this.stream) {
            this.stream.setFloat32(this.cursor, value, this.endianness == Endianness.LittleEndian);
        }
        this.cursor += 4;
        this.lastvalue = value;
    };
    BinaryWriter.prototype.PushString = function (value) {
        for (var index = 0; index < value.length; index++) {
            if (this.stream) {
                this.stream.setUint8(this.cursor, value.charCodeAt(index));
            }
            this.cursor++;
            this.lastvalue = value[index];
        }
    };
    BinaryWriter.prototype.PushUILenghedString = function (value) {
        this.PushUInt8(value.length);
        this.PushString(value);
    };
    return BinaryWriter;
}(BinaryStream));
var FileLoader = /** @class */ (function () {
    function FileLoader() {
    }
    return FileLoader;
}());
/// <reference path="fileloader.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="../maths/vector.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />
var CsvLoader = /** @class */ (function (_super) {
    __extends(CsvLoader, _super);
    function CsvLoader(content) {
        var _this = _super.call(this) || this;
        _this.parser = new CSVParser(content);
        return _this;
    }
    CsvLoader.prototype.Load = function (ondone, onerror) {
        this.parser.SetNext(function (p) {
            if (p.error) {
                onerror(p.error);
            }
            else {
                ondone(p.pclcloud);
            }
        });
        this.parser.Start();
    };
    return CsvLoader;
}(FileLoader));
var CSVParser = /** @class */ (function (_super) {
    __extends(CSVParser, _super);
    function CSVParser(content) {
        var _this = _super.call(this, 0, 'Parsing CSV file content') || this;
        _this.separator = ';';
        _this.reader = new BinaryReader(content);
        _this.error = null;
        return _this;
    }
    CSVParser.prototype.Initialize = function (caller) {
        this.header = null;
        this.rawheader = null;
        this.headermapping = null;
        this.done = false;
        this.pclcloud = new PCLPointCloud();
        this.nbsteps = this.reader.CountAsciiOccurences('\n');
        this.pclcloud.cloud.Reserve(this.nbsteps);
        this.reader.Reset();
    };
    CSVParser.prototype.Iterate = function (step) {
        var line = this.ParseCurrentLine();
        if (line) {
            if (!this.header) {
                this.SetHeader(line);
            }
            else {
                var point = this.GetVector(line, CSVParser.PointCoordinates);
                var cloud = this.pclcloud.cloud;
                var fields = this.pclcloud.fields;
                if (point) {
                    cloud.PushPoint(point);
                    var normal = this.GetVector(line, CSVParser.NormalCoordinates);
                    if (normal) {
                        cloud.PushNormal(normal);
                    }
                    for (var index = 0; index < fields.length; index++) {
                        var field = fields[index];
                        field.PushValue(this.GetValue(line, field.name));
                    }
                }
            }
        }
        else {
            this.done = true;
        }
    };
    Object.defineProperty(CSVParser.prototype, "Done", {
        get: function () { return this.done || !!this.error; },
        enumerable: true,
        configurable: true
    });
    CSVParser.prototype.SetHeader = function (line) {
        this.header = {};
        this.rawheader = line;
        for (var index = 0; index < line.length; index++) {
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
                var ciKey = key.toLocaleLowerCase();
                this.header[ciKey] = index;
                if (!this.IsCoordinate(ciKey)) {
                    this.pclcloud.AddScalarField(key).Reserve(this.nbsteps);
                }
            }
        }
    };
    CSVParser.prototype.IsCoordinate = function (key) {
        var coords = CSVParser.PointCoordinates.concat(CSVParser.NormalCoordinates);
        for (var index = 0; index < coords.length; index++) {
            if (key == coords[index]) {
                return true;
            }
        }
        return false;
    };
    CSVParser.prototype.ParseCurrentLine = function () {
        if (this.reader.Eof()) {
            return null;
        }
        var line = this.reader.GetAsciiLine();
        if (line) {
            return line.split(this.separator);
        }
        return null;
    };
    CSVParser.prototype.GetValue = function (line, key) {
        var ciKey = key.toLocaleLowerCase();
        if (ciKey in this.header) {
            var index = this.header[ciKey];
            try {
                return parseFloat(line[index]);
            }
            catch (e) {
            }
        }
        return null;
    };
    CSVParser.prototype.GetVector = function (line, data) {
        var result = [];
        for (var index = 0; index < data.length; index++) {
            var value = this.GetValue(line, data[index]);
            if (value !== null) {
                result.push(value);
            }
            else {
                return null;
            }
        }
        return new Vector(result);
    };
    CSVParser.PointCoordinates = ['x', 'y', 'z'];
    CSVParser.NormalCoordinates = ['nx', 'ny', 'nz'];
    return CSVParser;
}(IterativeLongProcess));
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
var PCLLoader = /** @class */ (function (_super) {
    __extends(PCLLoader, _super);
    function PCLLoader(content) {
        var _this = _super.call(this) || this;
        _this.parser = new PCLParser(content, _this);
        return _this;
    }
    PCLLoader.prototype.Load = function (ondone, onError) {
        try {
            this.parser.ProcessHeader();
            var result = this.parser.ProcessNextObject();
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
    };
    PCLLoader.prototype.GetHandler = function (objecttype) {
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
    };
    return PCLLoader;
}(FileLoader));
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
var PlyDefinition = /** @class */ (function () {
    function PlyDefinition(name, type, params) {
        this.name = name;
        this.type = type;
        this.params = params;
    }
    return PlyDefinition;
}());
var PlyElement = /** @class */ (function () {
    function PlyElement(name, count) {
        this.name = name;
        this.count = count;
        this.definition = [];
        this.items = [];
    }
    PlyElement.prototype.PushDefinitionProperty = function (name, type, params) {
        //Check the property has not already been defined
        for (var index = 0; index < this.definition.length; index++) {
            if (this.definition[index].name == name) {
                throw 'the property \"' + name + '\" already exists for element \"' + this.name + '\"';
            }
        }
        this.definition.push(new PlyDefinition(name, type, params));
    };
    PlyElement.prototype.GetNextValue = function (reader, format, type) {
        if (reader.Eof()) {
            throw 'reached end of file while parsing PLY items';
        }
        switch (format) {
            case PLYFormat.Ascii:
                {
                    var value = reader.GetAsciiWord(true);
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
    };
    PlyElement.prototype.ParseItem = function (reader, format) {
        var storedItem = {};
        for (var index = 0; index < this.definition.length; index++) {
            if (this.definition[index].type == 'list') {
                var length_1 = this.GetNextValue(reader, format, this.definition[index].params[0]);
                var values = new Array(length_1);
                for (var cursor = 0; cursor < length_1; cursor++) {
                    values[cursor] = this.GetNextValue(reader, format, this.definition[index].params[1]);
                }
                storedItem[this.definition[index].name] = values;
            }
            else {
                storedItem[this.definition[index].name] = this.GetNextValue(reader, format, this.definition[index].type);
            }
        }
        return storedItem;
    };
    PlyElement.prototype.PushItem = function (reader, format) {
        var expected;
        var found;
        if (this.definition.length == 0) {
            throw 'no definition provided for element \"' + this.name + '\"';
        }
        this.items.push(this.ParseItem(reader, format));
        if (format == PLYFormat.Ascii) {
            reader.GetAsciiLine();
        }
    };
    PlyElement.prototype.IsFilled = function () {
        return (this.count == this.items.length);
    };
    PlyElement.prototype.GetItem = function (index) {
        return this.items[index];
    };
    PlyElement.prototype.NbItems = function () {
        return this.items.length;
    };
    return PlyElement;
}());
//////////////////////////////////////
// Elements collection handler
//////////////////////////////////////
var PlyElements = /** @class */ (function () {
    function PlyElements() {
        this.elements = [];
        this.current = 0;
    }
    PlyElements.prototype.PushElement = function (name, count) {
        this.elements.push(new PlyElement(name, count));
        this.current = this.elements.length - 1;
    };
    PlyElements.prototype.GetCurrent = function () {
        if (this.current < this.elements.length) {
            return this.elements[this.current];
        }
        return null;
    };
    PlyElements.prototype.GetElement = function (name) {
        for (var index = 0; index < this.elements.length; index++) {
            if (this.elements[index].name == name) {
                return this.elements[index];
            }
        }
        return null;
    };
    PlyElements.prototype.ResetCurrent = function () {
        this.current = 0;
    };
    PlyElements.prototype.NbElements = function () {
        return this.elements.length;
    };
    PlyElements.prototype.PushItem = function (reader, format) {
        var currentElement = null;
        while ((currentElement = this.GetCurrent()) != null && currentElement.IsFilled()) {
            this.current++;
        }
        if (currentElement == null) {
            throw 'all the elements have been filled with items.';
        }
        currentElement.PushItem(reader, format);
    };
    return PlyElements;
}());
//////////////////////////////////////////
// PLY File Loader
//////////////////////////////////////////
var PlyLoader = /** @class */ (function (_super) {
    __extends(PlyLoader, _super);
    function PlyLoader(content) {
        var _this = _super.call(this) || this;
        _this.reader = new BinaryReader(content);
        _this.elements = new PlyElements();
        return _this;
    }
    PlyLoader.prototype.Load = function (onloaded, onerror) {
        function Error(message) {
            throw 'PLY ERROR : ' + message;
        }
        try {
            //Firt line shoul be 'PLY'
            if (this.reader.Eof() || this.reader.GetAsciiLine().toLowerCase() != 'ply') {
                Error('this is not a valid PLY file (line 1)');
            }
            //Second line indicates the PLY format
            var format = void 0;
            if (!this.reader.Eof()) {
                var parts = this.reader.GetAsciiLine().split(' ');
                if (parts.length == 3 || parts[0].toLowerCase() != 'format') {
                    var formatstr = parts[1].toLowerCase();
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
            var inHeader = true;
            do {
                if (this.reader.Eof()) {
                    Error('unexpected end of file while parsing header');
                }
                var currentLine = this.reader.GetAsciiLine().split(' ');
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
                            var currentElement = this.elements.GetCurrent();
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
            var loader = new ItemsLoader(this.reader, this.elements, format);
            loader
                .SetNext(new CloudBuilder(this.elements))
                .SetNext(new MeshBuilder(this.elements))
                .SetNext(new Finalizer())
                .SetNext(function (f) { return onloaded(f.result); });
            loader.Start();
        }
        catch (error) {
            onerror(error);
        }
    };
    return PlyLoader;
}(FileLoader));
//////////////////////////////////////////
// PLY elements loading process
//////////////////////////////////////////
var ItemsLoader = /** @class */ (function (_super) {
    __extends(ItemsLoader, _super);
    function ItemsLoader(reader, elements, format) {
        var _this = _super.call(this, 'Parsing PLY content') || this;
        _this.reader = reader;
        _this.elements = elements;
        _this.format = format;
        return _this;
    }
    ItemsLoader.prototype.Step = function () {
        try {
            this.elements.PushItem(this.reader, this.format);
        }
        catch (exception) {
            Error(exception);
        }
    };
    Object.defineProperty(ItemsLoader.prototype, "Done", {
        get: function () { return this.reader.Eof(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ItemsLoader.prototype, "Current", {
        get: function () { return this.reader.stream.byteOffset; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ItemsLoader.prototype, "Target", {
        get: function () { return this.reader.stream.byteLength; },
        enumerable: true,
        configurable: true
    });
    return ItemsLoader;
}(LongProcess));
//////////////////////////////////////////
// Build point cloud from loaded ply vertices
//////////////////////////////////////////
var CloudBuilder = /** @class */ (function (_super) {
    __extends(CloudBuilder, _super);
    function CloudBuilder(elements) {
        var _this = _super.call(this, 0, 'Loading PLY vertices') || this;
        _this.elements = elements;
        return _this;
    }
    CloudBuilder.prototype.Initialize = function (caller) {
        this.vertices = this.elements.GetElement('vertex');
        if (this.vertices) {
            this.nbsteps = this.vertices.NbItems();
            this.cloud = new PointCloud();
            this.cloud.Reserve(this.nbsteps);
        }
    };
    CloudBuilder.prototype.Iterate = function (step) {
        var vertex = this.vertices.GetItem(step);
        this.cloud.PushPoint(new Vector([vertex.x, vertex.y, vertex.z]));
    };
    return CloudBuilder;
}(IterativeLongProcess));
//////////////////////////////////////////
// Build mesh from loaded ply faces, if any
//////////////////////////////////////////
var MeshBuilder = /** @class */ (function (_super) {
    __extends(MeshBuilder, _super);
    function MeshBuilder(elements) {
        var _this = _super.call(this, 0, 'Loading PLY mesh') || this;
        _this.elements = elements;
        return _this;
    }
    MeshBuilder.prototype.Initialize = function (caller) {
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
    };
    MeshBuilder.prototype.Iterate = function (step) {
        var face = this.faces.GetItem(step);
        var mesh = this.result;
        mesh.PushFace(face.vertex_indices);
    };
    return MeshBuilder;
}(IterativeLongProcess));
//////////////////////////////////////////
//  Finalize the result
//////////////////////////////////////////
var Finalizer = /** @class */ (function (_super) {
    __extends(Finalizer, _super);
    function Finalizer() {
        return _super.call(this) || this;
    }
    Finalizer.prototype.Initialize = function (caller) {
        if (caller.result instanceof Mesh) {
            this.result = new PCLMesh(caller.result);
        }
        else {
            this.result = caller.result;
        }
    };
    Finalizer.prototype.Run = function (ondone) {
        if (this.result instanceof PCLMesh) {
            var mesh = this.result.mesh;
            mesh.ComputeNormals(function (m) {
                m.ComputeOctree(ondone);
                return true;
            });
        }
        else {
            ondone();
        }
    };
    return Finalizer;
}(Process));
/// <reference path="drawingcontext.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../maths/matrix.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="../../controler/controler.ts" />
var ScreenDimensions = /** @class */ (function () {
    function ScreenDimensions(width, height) {
        this.width = width;
        this.height = height;
    }
    return ScreenDimensions;
}());
var Base = /** @class */ (function () {
    function Base(right, up, lookAt, distance) {
        this.right = right;
        this.up = up;
        this.lookAt = lookAt;
        this.distance = distance;
    }
    return Base;
}());
var Camera = /** @class */ (function () {
    function Camera(context) {
        this.at = new Vector([10.0, 10.0, 10.0]);
        this.to = new Vector([.0, .0, .0]);
        this.up = new Vector([.0, 1.0, .0]);
        this.near = 0.001;
        this.far = 10000.0;
        this.fov = Math.PI / 4;
        this.InititalizeDrawingContext(context);
    }
    Camera.prototype.InititalizeDrawingContext = function (context) {
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
    };
    Camera.prototype.GetInnerBase = function () {
        var lookAt = this.to.Minus(this.at);
        var d = lookAt.Norm();
        lookAt = lookAt.Times(1. / d);
        var right = lookAt.Cross(this.up).Normalized();
        var up = right.Cross(lookAt).Normalized();
        return { right: right, up: up, lookAt: lookAt, distance: d };
    };
    Camera.prototype.GetModelViewMatrix = function () {
        var innerBase = this.GetInnerBase();
        var basechange = Matrix.Identity(4);
        var translation = Matrix.Identity(4);
        for (var index = 0; index < 3; index++) {
            basechange.SetValue(0, index, innerBase.right.Get(index));
            basechange.SetValue(1, index, innerBase.up.Get(index));
            basechange.SetValue(2, index, -innerBase.lookAt.Get(index));
            translation.SetValue(index, 3, -this.at.Get(index));
        }
        return basechange.Multiply(translation);
    };
    Camera.prototype.GetProjectionMatrix = function () {
        var aspectRatio = this.screen.width / this.screen.height;
        var projection = Matrix.Null(4, 4);
        var f = 1. / Math.tan(this.fov / 2.);
        projection.SetValue(0, 0, f / aspectRatio);
        projection.SetValue(1, 1, f);
        projection.SetValue(2, 2, -(this.near + this.far) / (this.far - this.near));
        projection.SetValue(2, 3, -(2.0 * this.near * this.far) / (this.far - this.near));
        projection.SetValue(3, 2, -1.0);
        return projection;
    };
    Camera.prototype.GetTranslationVector = function (dx, dy) {
        var f = Math.tan(this.fov / 2.0);
        var innerBase = this.GetInnerBase();
        var objectSpaceHeight = f * innerBase.distance;
        var objectSpaceWidth = objectSpaceHeight * this.screen.width / this.screen.height;
        var deltax = innerBase.right.Times(objectSpaceWidth * -dx / this.screen.width);
        var deltay = innerBase.up.Times(-(objectSpaceHeight * -dy / this.screen.height));
        return deltax.Plus(deltay);
    };
    Camera.prototype.GetScreenHeight = function () {
        return this.screen.height;
    };
    Camera.prototype.Pan = function (dx, dy) {
        var delta = this.GetTranslationVector(dx, dy);
        this.at = this.at.Plus(delta);
        this.to = this.to.Plus(delta);
    };
    Camera.prototype.TrackBallProjection = function (x, y) {
        //Transform creen coordinates to inner trackball coordinates
        var point = new Vector([(x / this.screen.width) - 0.5, -((y / this.screen.height) - 0.5), 0]);
        var sqrnorm = point.SqrNorm();
        point.Set(2, (sqrnorm < 0.5) ? (1.0 - sqrnorm) : (0.5 / Math.sqrt(sqrnorm)));
        //compute scene coordinates instead of inner coordinates
        var innerBase = this.GetInnerBase();
        var result = innerBase.right.Times(point.Get(0));
        result = result.Plus(innerBase.up.Times(point.Get(1)));
        result = result.Plus(innerBase.lookAt.Times(-point.Get(2)));
        return result;
    };
    Camera.prototype.GetRotationMatrix = function (fromx, fromy, tox, toy) {
        var from = this.TrackBallProjection(fromx, fromy).Normalized();
        var to = this.TrackBallProjection(tox, toy).Normalized();
        var angle = Math.acos(from.Dot(to));
        var axis = to.Cross(from).Normalized();
        return Matrix.Rotation(axis, angle);
    };
    Camera.prototype.Rotate = function (fromx, fromy, tox, toy) {
        var rotation = this.GetRotationMatrix(fromx, fromy, tox, toy);
        var p = this.at.Minus(this.to);
        p = Homogeneous.ToVector(rotation.Multiply(new HomogeneousPoint(p)));
        this.at = this.to.Plus(p);
        this.up = Homogeneous.ToVector(rotation.Multiply(new HomogeneousVector(this.up)));
    };
    Camera.prototype.Zoom = function (d) {
        this.Distance *= Math.pow(0.9, d);
    };
    Camera.prototype.GetPosition = function () {
        return this.at;
    };
    Camera.prototype.SetPosition = function (p) {
        this.at = p;
    };
    Camera.prototype.ComputeProjection = function (v, applyViewPort) {
        var u;
        u = new HomogeneousPoint(v);
        var projection = this.GetProjectionMatrix();
        var modelview = this.GetModelViewMatrix();
        var render = projection.Multiply(modelview);
        var w = new Vector(render.Multiply(u).values);
        w = w.Times(1. / w.Get(3));
        if (applyViewPort) {
            w.Set(0, (w.Get(0) + 1.0) * this.screen.width / 2.0);
            w.Set(1, (w.Get(1) + 1.0) * this.screen.height / 2.0);
        }
        return w;
    };
    Camera.prototype.ComputeInvertedProjection = function (p) {
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
    };
    Camera.prototype.CenterOnBox = function (box) {
        if (box && box.IsValid()) {
            var radius = box.GetSize().Norm() / 2.0;
            this.to = box.GetCenter();
            if (radius) {
                this.Distance = radius / Math.tan(this.fov / 2.);
            }
            return true;
        }
        return false;
    };
    Camera.prototype.GetDirection = function () {
        return this.to.Minus(this.at).Normalized();
    };
    Camera.prototype.SetDirection = function (dir, upv) {
        this.at = this.to.Minus(dir.Normalized().Times(this.Distance));
        this.up = upv;
    };
    Object.defineProperty(Camera.prototype, "Distance", {
        get: function () {
            return this.to.Minus(this.at).Norm();
        },
        set: function (d) {
            this.at = this.to.Minus(this.GetDirection().Times(d));
        },
        enumerable: true,
        configurable: true
    });
    return Camera;
}());
/// <reference path="pclgroup.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="../nameprovider.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../files/pclserializer.ts" />
var LightsContainer = /** @class */ (function (_super) {
    __extends(LightsContainer, _super);
    function LightsContainer(name) {
        return _super.call(this, name || NameProvider.GetName('Lights'), false) || this;
    }
    LightsContainer.prototype.GetActions = function (delegate) {
        var result = _super.prototype.GetActions.call(this, delegate);
        result.push(null);
        result.push(new NewLightAction(this));
        return result;
    };
    LightsContainer.prototype.GetSerializationID = function () {
        return LightsContainer.SerializationID;
    };
    LightsContainer.prototype.GetParsingHandler = function () {
        return new LightsContainerParsingHandler();
    };
    LightsContainer.SerializationID = 'LIGHTSSET';
    return LightsContainer;
}(PCLGroup));
var LightsContainerParsingHandler = /** @class */ (function (_super) {
    __extends(LightsContainerParsingHandler, _super);
    function LightsContainerParsingHandler() {
        return _super.call(this) || this;
    }
    LightsContainerParsingHandler.prototype.GetObject = function () {
        return new LightsContainer(this.name);
    };
    return LightsContainerParsingHandler;
}(PCLGroupParsingHandler));
var NewLightAction = /** @class */ (function (_super) {
    __extends(NewLightAction, _super);
    function NewLightAction(container) {
        var _this = _super.call(this, 'New light', 'Add up to ' + DrawingContext.NbMaxLights + ' light sources') || this;
        _this.container = container;
        return _this;
    }
    NewLightAction.prototype.Trigger = function () {
        var light = new Light(new Vector([100.0, 100.0, 100.0]));
        this.container.Add(light);
    };
    NewLightAction.prototype.Enabled = function () {
        return this.container.children.length < DrawingContext.NbMaxLights;
    };
    return NewLightAction;
}(Action));
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
var Light = /** @class */ (function (_super) {
    __extends(Light, _super);
    function Light(position) {
        var _this = _super.call(this, NameProvider.GetName("Light")) || this;
        _this.position = position;
        _this.color = [1.0, 1.0, 1.0];
        return _this;
    }
    Light.prototype.PrepareRendering = function (drawingContext) {
        var shapetransform = Matrix.Identity(4);
        drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));
        if (!this.glPointsBuffer) {
            this.glPointsBuffer = new FloatArrayBuffer(new Float32Array(this.position.Flatten()), drawingContext, 3);
        }
        this.glPointsBuffer.BindAttribute(drawingContext.vertices);
        drawingContext.gl.uniform3fv(drawingContext.color, new Float32Array(this.color));
        drawingContext.EnableNormals(false);
        drawingContext.EnableScalars(false);
    };
    Light.prototype.DrawNode = function (drawingContext) {
        this.PrepareRendering(drawingContext);
        drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, 1);
    };
    Light.prototype.RayIntersection = function (ray) {
        return new Picking(null);
    };
    Light.prototype.GetBoundingBox = function () {
        return null;
    };
    Light.prototype.FillProperties = function () {
        if (this.properties) {
            var self_9 = this;
            this.properties.Push(new VectorProperty('Position', function () { return self_9.position; }, false, function () { }));
            this.properties.Push(new ColorProperty('Color', function () { return self_9.color; }, function (newColor) { return self_9.color = newColor; }));
        }
    };
    Light.prototype.GetDisplayIcon = function () {
        return 'fa-lightbulb-o';
    };
    Light.prototype.GetPosition = function () {
        return this.position;
    };
    Light.prototype.SetPositon = function (p) {
        this.position = p;
    };
    Light.prototype.GetDistance = function (p) {
        return p.Minus(this.position).Norm();
    };
    Light.prototype.GetSerializationID = function () {
        return Light.SerializationID;
    };
    Light.prototype.SerializeNode = function (serializer) {
        var self = this;
        serializer.PushParameter('position', function (s) {
            s.PushFloat32(self.position.Get(0));
            s.PushFloat32(self.position.Get(1));
            s.PushFloat32(self.position.Get(2));
        });
        serializer.PushParameter('color', function (s) {
            s.PushFloat32(self.color[0]);
            s.PushFloat32(self.color[1]);
            s.PushFloat32(self.color[2]);
        });
    };
    Light.prototype.GetParsingHandler = function () {
        return new LightParsingHandler();
    };
    Light.SerializationID = 'LIGHT';
    return Light;
}(PCLNode));
var LightParsingHandler = /** @class */ (function (_super) {
    __extends(LightParsingHandler, _super);
    function LightParsingHandler() {
        return _super.call(this) || this;
    }
    LightParsingHandler.prototype.ProcessNodeParam = function (paramname, parser) {
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
    };
    LightParsingHandler.prototype.FinalizeNode = function () {
        var light = new Light(this.position);
        light.color = this.color;
        return light;
    };
    return LightParsingHandler;
}(PCLNodeParsingHandler));
/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="light.ts" />
/// <reference path="lightscontainer.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />
var Scene = /** @class */ (function (_super) {
    __extends(Scene, _super);
    function Scene(initialize) {
        if (initialize === void 0) { initialize = true; }
        var _this = _super.call(this, "Scene") || this;
        _this.deletable = false;
        if (initialize) {
            _this.children = [null, null];
            _this.Contents = new PCLGroup("Objects");
            _this.Contents.deletable = false;
            _this.Lights = new LightsContainer("Lights");
            _this.Lights.deletable = false;
            _this.Lights.visible = false;
            _this.Lights.folded = true;
            var defaultLight = new Light(new Vector([10.0, 10.0, 10.0]));
            _this.Lights.Add(defaultLight);
            defaultLight.deletable = false;
        }
        return _this;
    }
    Object.defineProperty(Scene.prototype, "Contents", {
        get: function () {
            return this.children[1];
        },
        set: function (c) {
            this.children[1] = c;
            c.owner = this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "Lights", {
        get: function () {
            return this.children[0];
        },
        set: function (l) {
            this.children[0] = l;
            l.owner = this;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.GetDisplayIcon = function () {
        return 'fa-desktop';
    };
    Scene.prototype.GetSerializationID = function () {
        return Scene.SerializationID;
    };
    Scene.prototype.GetParsingHandler = function () {
        return new SceneParsingHandler();
    };
    Scene.SerializationID = 'SCENE';
    return Scene;
}(PCLGroup));
var SceneParsingHandler = /** @class */ (function (_super) {
    __extends(SceneParsingHandler, _super);
    function SceneParsingHandler() {
        return _super.call(this) || this;
    }
    SceneParsingHandler.prototype.GetObject = function () {
        return new Scene(false);
    };
    return SceneParsingHandler;
}(PCLGroupParsingHandler));
/// <reference path="../controls/control.ts" />
/// <reference path="drawingcontext.ts" />
/// <reference path="camera.ts" />
/// <reference path="../objects/scene.ts" />
/// <reference path="../objects/pclnode.ts" />
/// <reference path="../objects/light.ts" />
/// <reference path="../objects/pclpointcloud.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../tools/longprocess.ts" />
/// <reference path="../../model/pointcloud.ts" />
var Renderer = /** @class */ (function () {
    function Renderer(className) {
        //Create a canvas to display the scene
        this.sceneRenderingArea = document.createElement('canvas');
        this.sceneRenderingArea.className = className;
        this.drawingcontext = new DrawingContext(this.sceneRenderingArea);
        this.camera = new Camera(this.drawingcontext);
    }
    Renderer.prototype.GetElement = function () {
        return this.sceneRenderingArea;
    };
    Renderer.prototype.Draw = function (scene) {
        var gl = this.drawingcontext.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //Set the lights positions and colors
        var nbLights = 0;
        for (var index = 0; index < scene.Lights.children.length; index++) {
            var light = scene.Lights.children[index];
            if (light.visible) {
                this.drawingcontext.gl.uniform3fv(this.drawingcontext.lightpositions[nbLights], new Float32Array(light.position.Flatten()));
                this.drawingcontext.gl.uniform3fv(this.drawingcontext.lightcolors[nbLights], new Float32Array(light.color));
                nbLights++;
            }
        }
        this.drawingcontext.gl.uniform1i(this.drawingcontext.nblights, nbLights);
        //Set the camera position
        this.camera.InititalizeDrawingContext(this.drawingcontext);
        //Perform rendering
        if (scene) {
            scene.Draw(this.drawingcontext);
        }
    };
    Renderer.prototype.RefreshSize = function () {
        this.Resize(this.sceneRenderingArea.scrollWidth, this.sceneRenderingArea.scrollHeight);
    };
    Renderer.prototype.Resize = function (width, height) {
        this.drawingcontext.renderingArea.width = width;
        this.drawingcontext.renderingArea.height = height;
        this.camera.screen.width = width;
        this.camera.screen.height = height;
    };
    Renderer.prototype.GetRay = function (x, y) {
        var point = this.camera.ComputeInvertedProjection(new Vector([x, y, -1.0]));
        return new Ray(this.camera.at, point.Minus(this.camera.at).Normalized());
    };
    Renderer.prototype.ResolveRayIntersection = function (ray, root) {
        return root.RayIntersection(ray);
    };
    Renderer.prototype.PickObject = function (x, y, scene) {
        var ray = this.GetRay(x, y);
        var picked = this.ResolveRayIntersection(ray, scene.Contents);
        if (picked != null && picked.HasIntersection()) {
            return picked.object;
        }
        return null;
    };
    Renderer.prototype.ScanFromCurrentViewPoint = function (group, hsampling, vsampling) {
        var scanner = new SceneScanner(this, group, hsampling, vsampling);
        scanner.SetNext(function (s) {
            var cloud = new PCLPointCloud(s.cloud);
            group.Add(cloud);
            cloud.NotifyChange(cloud, ChangeType.NewItem);
        });
        scanner.Start();
    };
    return Renderer;
}());
var SceneScanner = /** @class */ (function (_super) {
    __extends(SceneScanner, _super);
    function SceneScanner(renderer, group, width, height) {
        var _this = _super.call(this, 'Scanning the scene (' + width + 'x' + height + ')') || this;
        _this.renderer = renderer;
        _this.group = group;
        _this.width = width;
        _this.height = height;
        _this.currenti = 0;
        _this.currentj = 0;
        return _this;
    }
    SceneScanner.prototype.Initialize = function () {
        this.cloud = new PointCloud();
        this.cloud.Reserve(this.width * this.height);
    };
    SceneScanner.prototype.Step = function () {
        var screen = this.renderer.camera.screen;
        var x = screen.width * (this.currenti / this.width);
        var y = screen.height * (this.currentj / this.height);
        var ray = this.renderer.GetRay(x, y);
        var intersection = this.renderer.ResolveRayIntersection(ray, this.group);
        if (intersection && intersection.HasIntersection()) {
            var point = ray.from.Plus(ray.dir.Times(intersection.distance));
            this.cloud.PushPoint(point);
        }
        this.currentj++;
        if (this.currentj >= this.height) {
            this.currentj = 0;
            this.currenti++;
        }
    };
    Object.defineProperty(SceneScanner.prototype, "Current", {
        get: function () { return this.currenti * this.width + this.currentj; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneScanner.prototype, "Target", {
        get: function () { return this.width * this.height; },
        enumerable: true,
        configurable: true
    });
    return SceneScanner;
}(LongProcess));
;
/// <reference path="control.ts" />
var Pannel = /** @class */ (function () {
    function Pannel(classname) {
        if (classname === void 0) { classname = ""; }
        this.pannel = document.createElement('div');
        this.pannel.className = classname;
    }
    Pannel.prototype.GetElement = function () {
        return this.pannel;
    };
    Pannel.prototype.AddControl = function (control) {
        this.pannel.appendChild(control.GetElement());
    };
    Pannel.prototype.RemoveControl = function (control) {
        this.pannel.removeChild(control.GetElement());
    };
    Pannel.prototype.Clear = function () {
        while (this.pannel.lastChild) {
            this.pannel.removeChild(this.pannel.lastChild);
        }
    };
    return Pannel;
}());
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
var Handle = /** @class */ (function () {
    function Handle(owner, position) {
        this.owner = owner;
        this.position = position;
        var self = this;
        this.handle = document.createElement('div');
        this.handle.className = 'HideablePannelHandle';
        this.handle.setAttribute("Position", HandlePosition[position]);
        this.handle.onclick = function (event) {
            if (!self.owner.pinned)
                self.owner.SwitchVisibility();
        };
        this.UpdateCursor();
    }
    Handle.prototype.GetElement = function () {
        return this.handle;
    };
    Handle.prototype.RefreshSize = function () {
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
    };
    Handle.prototype.UpdateCursor = function () {
        var orientation = '';
        var visible = this.owner.visible;
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
    };
    return Handle;
}());
var HideablePannel = /** @class */ (function (_super) {
    __extends(HideablePannel, _super);
    function HideablePannel(classname, handlePosition) {
        if (classname === void 0) { classname = ""; }
        if (handlePosition === void 0) { handlePosition = HandlePosition.None; }
        var _this = _super.call(this, classname) || this;
        _this.container = new Pannel('HideablePannelContainer');
        _super.prototype.AddControl.call(_this, _this.container);
        if (handlePosition !== HandlePosition.None) {
            _this.handle = new Handle(_this, handlePosition);
            _super.prototype.AddControl.call(_this, _this.handle);
        }
        _this.originalWidth = null;
        _this.originalHeight = null;
        _this.visible = true;
        _this.originalvisibility = true;
        _this.pinned = false;
        return _this;
    }
    HideablePannel.prototype.AddControl = function (control) {
        this.container.AddControl(control);
    };
    HideablePannel.prototype.Show = function () {
        if (!this.visible) {
            var pannel = this.GetElement();
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
    };
    HideablePannel.prototype.Hide = function () {
        if (this.visible) {
            var pannel = this.GetElement();
            var handle = this.handle.GetElement();
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
    };
    HideablePannel.prototype.TemporaryHide = function () {
        var visbilityToRestore = this.visible;
        this.Hide();
        this.originalvisibility = visbilityToRestore;
    };
    HideablePannel.prototype.RestoreVisibility = function () {
        if (this.originalvisibility) {
            this.Show();
        }
        else {
            this.Hide();
        }
    };
    HideablePannel.prototype.SwitchVisibility = function () {
        if (this.visible) {
            this.Hide();
        }
        else {
            this.Show();
        }
    };
    HideablePannel.prototype.RefreshSize = function () {
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
    };
    return HideablePannel;
}(Pannel));
/// <reference path="control.ts" />
/// <reference path="hint.ts" />
/// <reference path="../../controler/actions/action.ts" />
var PopupItem = /** @class */ (function () {
    function PopupItem(action) {
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
            var itemLabel = document.createTextNode(action.GetLabel());
            this.item.appendChild(itemLabel);
            if (action.hintMessage) {
                this.hint = new Hint(this, action.hintMessage);
            }
        }
        else {
            this.item.className = 'PopupSeparator';
        }
    }
    PopupItem.prototype.ItemClicked = function (action) {
        var self = this;
        return function () {
            action.Run();
            if (self.hint) {
                self.hint.Hide();
            }
            Popup.DestroyCurrent();
        };
    };
    PopupItem.prototype.GetElement = function () {
        return this.item;
    };
    return PopupItem;
}());
/// <reference path="control.ts" />
/// <reference path="popupitem.ts" />
/// <reference path="../../controler/actions/action.ts" />
var Popup = /** @class */ (function () {
    function Popup(owner, actions) {
        this.actions = actions;
        this.popupContainer = document.createElement('div');
        this.popupContainer.className = 'Popup';
        this.popupContainer.id = 'Popup';
        var element;
        if (owner instanceof HTMLElement)
            element = owner;
        else
            element = owner.GetElement();
        var rect = element.getBoundingClientRect();
        this.popupContainer.style.top = rect.bottom + 'px';
        this.popupContainer.style.left = rect.left + 'px';
        this.popupContainer.onmouseleave = function () {
            Popup.DestroyCurrent();
        };
        document.body.appendChild(this.popupContainer);
        this.items = [];
        var popupContent = ((typeof actions == 'function') ? actions() : actions);
        for (var index = 0; index < popupContent.length; index++) {
            var popupItem = new PopupItem(popupContent[index]);
            this.items.push(PopupItem);
            this.popupContainer.appendChild(popupItem.GetElement());
        }
    }
    Popup.DestroyCurrent = function () {
        if (this.current) {
            var popupElement = this.current.GetElement();
            popupElement.parentNode.removeChild(popupElement);
        }
        this.current = null;
    };
    Popup.CreatePopup = function (owner, actions) {
        Popup.DestroyCurrent();
        this.current = new Popup(owner, actions);
        return this.current;
    };
    Popup.prototype.GetElement = function () {
        return this.popupContainer;
    };
    return Popup;
}());
var DraggingType;
(function (DraggingType) {
    DraggingType[DraggingType["Vertical"] = 1] = "Vertical";
    DraggingType[DraggingType["Horizontal"] = 2] = "Horizontal";
    DraggingType[DraggingType["Both"] = 3] = "Both";
})(DraggingType || (DraggingType = {}));
var Draggable = /** @class */ (function () {
    function Draggable(draggingtype) {
        if (draggingtype === void 0) { draggingtype = DraggingType.Both; }
        this.draggingtype = draggingtype;
    }
    Draggable.prototype.MakeDraggable = function () {
        var element = this.GetElement();
        var self = this;
        element.onmousedown = function (event) {
            self.InitializeDragging(event);
        };
    };
    Draggable.prototype.InitializeDragging = function (event) {
        event = event || window.event;
        this.tracker = new MouseTracker(event);
        this.dragged = false;
        var self = this;
        this.mousemovebackup = document.onmousemove;
        document.onmousemove = function (event) {
            self.UpdateDragging(event);
        };
        this.mouseupbackup = document.onmouseup;
        document.onmouseup = function (event) {
            self.Finalize(event);
        };
    };
    Draggable.prototype.UpdateDragging = function (event) {
        var element = this.GetElement();
        var delta = this.tracker.UpdatePosition(event);
        var dx = this.draggingtype & DraggingType.Horizontal ? delta.dx : 0;
        var dy = this.draggingtype & DraggingType.Vertical ? delta.dy : 0;
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
    };
    Draggable.prototype.GetModifiedPosition = function (pos, delta) {
        var value = parseInt(pos, 10);
        var suffix = pos.replace(value.toString(), '');
        var result = (value + delta) + suffix;
        return result;
    };
    Draggable.prototype.Finalize = function (event) {
        document.onmousemove = this.mousemovebackup;
        document.onmouseup = this.mouseupbackup;
        if (this.dragged) {
            this.OnDrop(event);
        }
        else {
            this.OnClick();
        }
    };
    Draggable.prototype.OnClick = function () {
    };
    Draggable.prototype.OnMove = function () {
    };
    Draggable.prototype.Authorized = function (dx, dy) {
        return true;
    };
    return Draggable;
}());
/// <reference path="../control.ts" />
/// <reference path="../draggable.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
/// <reference path="../../../tools/stringutils.ts" />
var ColorScaleBoundsContainer = /** @class */ (function () {
    function ColorScaleBoundsContainer(field) {
        this.field = field;
        this.container = document.createElement('div');
        this.container.className = 'ColorScaleBoundsContainer';
        this.lower = new ColorScaleLowerBound(this, function (c) { return field.SetColorMin(c); });
        this.upper = new ColorScaleUpperBound(this, function (c) { return field.SetColorMax(c); });
        this.container.appendChild(this.lower.GetElement());
        this.container.appendChild(this.upper.GetElement());
    }
    ColorScaleBoundsContainer.prototype.GetElement = function () {
        return this.container;
    };
    ColorScaleBoundsContainer.prototype.Refresh = function () {
        this.lower.SetValue(this.field.GetDisplayMin());
        this.lower.SetColor(this.field.colormin);
        this.upper.SetValue(this.field.GetDisplayMax());
        this.upper.SetColor(this.field.colormax);
    };
    ColorScaleBoundsContainer.prototype.GetHeight = function () {
        return this.container.getBoundingClientRect().height;
    };
    return ColorScaleBoundsContainer;
}());
var ColorScaleBound = /** @class */ (function (_super) {
    __extends(ColorScaleBound, _super);
    function ColorScaleBound(owner, onColorChange) {
        var _this = _super.call(this, DraggingType.Vertical) || this;
        _this.owner = owner;
        _this.container = document.createElement('div');
        _this.container.className = 'ColorScaleBound';
        _this.value = document.createTextNode('');
        _this.container.appendChild(_this.value);
        _this.color = document.createElement('input');
        _this.color.type = 'color';
        _this.color.style.display = 'None';
        _this.container.appendChild(_this.color);
        var self = _this;
        _this.color.onchange = function () {
            self.UpdateColor();
            onColorChange(StringUtils.StrToRGBf(self.color.value));
        };
        _this.MakeDraggable();
        return _this;
    }
    ColorScaleBound.prototype.OnClick = function () {
        this.color.click();
    };
    ColorScaleBound.prototype.GetElement = function () {
        return this.container;
    };
    ColorScaleBound.prototype.OnDrop = function () {
    };
    ColorScaleBound.prototype.SetValue = function (v, updatepos) {
        if (updatepos === void 0) { updatepos = true; }
        this.value.data = Number(v).toFixed(2);
        var min = this.owner.field.Min();
        var max = this.owner.field.Max();
        var ratio = (v - min) / (max - min);
        this.UpdatePosition(ratio);
    };
    ColorScaleBound.prototype.SetColor = function (color) {
        var colorStr = StringUtils.RGBfToStr(color);
        this.color.value = colorStr;
        this.UpdateColor();
    };
    ColorScaleBound.prototype.UpdateColor = function () {
        this.container.style.color = this.color.value;
    };
    return ColorScaleBound;
}(Draggable));
var ColorScaleLowerBound = /** @class */ (function (_super) {
    __extends(ColorScaleLowerBound, _super);
    function ColorScaleLowerBound(owner, onColorChange) {
        var _this = _super.call(this, owner, onColorChange) || this;
        _this.container.classList.add('Lower');
        return _this;
    }
    ColorScaleLowerBound.prototype.Authorized = function (dx, dy) {
        var top = parseInt(this.container.style.top, 10) + dy;
        var min = this.owner.GetHeight() - parseInt(this.owner.upper.container.style.bottom, 10);
        return min <= top && top <= this.owner.GetHeight();
    };
    ColorScaleLowerBound.prototype.UpdatePosition = function (ratio) {
        this.container.style.top = ((1.0 - ratio) * this.owner.GetHeight()) + 'px';
    };
    ColorScaleLowerBound.prototype.OnMove = function () {
        var ratio = parseInt(this.container.style.top) / this.owner.GetHeight();
        var min = this.owner.field.Min();
        var max = this.owner.field.Max();
        var value = min + ((1.0 - ratio) * (max - min));
        this.value.data = Number(value).toFixed(2);
        this.owner.field.SetDisplayMin(value);
    };
    return ColorScaleLowerBound;
}(ColorScaleBound));
var ColorScaleUpperBound = /** @class */ (function (_super) {
    __extends(ColorScaleUpperBound, _super);
    function ColorScaleUpperBound(owner, onColorChange) {
        var _this = _super.call(this, owner, onColorChange) || this;
        _this.container.classList.add('Upper');
        return _this;
    }
    ColorScaleUpperBound.prototype.Authorized = function (dx, dy) {
        var bottom = parseInt(this.container.style.bottom, 10) - dy;
        var min = this.owner.GetHeight() - parseInt(this.owner.lower.container.style.top, 10);
        return min <= bottom && bottom <= this.owner.GetHeight();
    };
    ColorScaleUpperBound.prototype.UpdatePosition = function (ratio) {
        this.container.style.bottom = (ratio * this.owner.GetHeight()) + 'px';
    };
    ColorScaleUpperBound.prototype.OnMove = function () {
        var ratio = parseInt(this.container.style.bottom) / this.owner.GetHeight();
        var min = this.owner.field.Min();
        var max = this.owner.field.Max();
        var value = min + (ratio * (max - min));
        this.value.data = Number(value).toFixed(2);
        this.owner.field.SetDisplayMax(value);
    };
    return ColorScaleUpperBound;
}(ColorScaleBound));
/// <reference path="../../opengl/drawingcontext.ts" />
/// <reference path="../control.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
var ColorScaleRenderer = /** @class */ (function () {
    function ColorScaleRenderer() {
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
        var indentity = Matrix.Identity(4);
        this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.modelview, false, indentity.values);
        this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.projection, false, indentity.values);
        this.drawingcontext.gl.uniformMatrix4fv(this.drawingcontext.shapetransform, false, indentity.values);
        this.drawingcontext.EnableNormals(false);
        this.drawingcontext.EnableScalars(true);
    }
    ColorScaleRenderer.prototype.Refresh = function (field) {
        this.drawingcontext.gl.viewport(0, 0, this.scaleRenderingArea.width, this.scaleRenderingArea.height);
        this.drawingcontext.gl.clear(this.drawingcontext.gl.COLOR_BUFFER_BIT | this.drawingcontext.gl.DEPTH_BUFFER_BIT);
        var min = field.GetDisplayMin();
        var max = field.GetDisplayMax();
        this.drawingcontext.gl.uniform1f(this.drawingcontext.minscalarvalue, min);
        this.drawingcontext.gl.uniform1f(this.drawingcontext.maxscalarvalue, max);
        this.drawingcontext.gl.uniform3fv(this.drawingcontext.minscalarcolor, field.colormin);
        this.drawingcontext.gl.uniform3fv(this.drawingcontext.maxscalarcolor, field.colormax);
        min = field.Min();
        max = field.Max();
        var scalars = new FloatArrayBuffer(new Float32Array([min, min, max, max]), this.drawingcontext, 1);
        this.points.BindAttribute(this.drawingcontext.vertices);
        scalars.BindAttribute(this.drawingcontext.scalarvalue);
        this.indices.Bind();
        this.drawingcontext.gl.drawElements(this.drawingcontext.gl.TRIANGLES, 6, this.drawingcontext.GetIntType(true), 0);
    };
    ColorScaleRenderer.prototype.GetElement = function () {
        return this.scaleRenderingArea;
    };
    ColorScaleRenderer.prototype.GetColor = function (v) {
        var gl = this.drawingcontext.gl;
        var pixel = new Uint8Array(4);
        gl.readPixels(0, Math.round(v * gl.drawingBufferHeight), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        return StringUtils.RGBiToStr(pixel);
    };
    return ColorScaleRenderer;
}());
/// <reference path="scalarfield.ts" />
var Histogram = /** @class */ (function () {
    function Histogram(values, nbchunks) {
        if (nbchunks <= 0) {
            throw "Invalid histogram parameter : " + nbchunks;
        }
        this.chunkcounters = new Array(nbchunks);
        for (var index = 0; index < nbchunks; index++) {
            this.chunkcounters[index] = 0;
        }
        this.minvalue = values.Min();
        this.maxvalue = values.Max();
        this.total = values.Size();
        this.maxcounter = 0;
        var chunkwidth = (this.maxvalue - this.minvalue) / nbchunks;
        for (var index = 0; index < values.Size(); index++) {
            var chunkindex = Math.floor((values.GetValue(index) - this.minvalue) / chunkwidth);
            if (chunkindex == nbchunks) {
                chunkindex--;
            }
            this.chunkcounters[chunkindex]++;
            if (this.chunkcounters[chunkindex] > this.maxcounter) {
                this.maxcounter = this.chunkcounters[chunkindex];
            }
        }
    }
    Histogram.prototype.Size = function () {
        return this.chunkcounters.length;
    };
    Histogram.prototype.GetChunk = function (chunkindex) {
        if (chunkindex === void 0) { chunkindex = null; }
        if (chunkindex === null) {
            return new HistogramChunk(this, this.minvalue, this.maxvalue, this.total);
        }
        var histowidth = this.maxvalue - this.minvalue;
        var chunkwidth = histowidth / this.chunkcounters.length;
        return new HistogramChunk(this, this.minvalue + (chunkindex * chunkwidth), this.minvalue + ((chunkindex + 1) * chunkwidth), this.chunkcounters[chunkindex]);
    };
    return Histogram;
}());
var HistogramChunk = /** @class */ (function () {
    function HistogramChunk(histogram, from, to, count) {
        this.histogram = histogram;
        this.from = from;
        this.to = to;
        this.count = count;
    }
    HistogramChunk.prototype.GetStartingValue = function () {
        return this.from;
    };
    HistogramChunk.prototype.GetNormalizedStartingValue = function () {
        return (this.from - this.histogram.minvalue) / (this.histogram.maxvalue - this.histogram.minvalue);
    };
    HistogramChunk.prototype.GetEndingValue = function () {
        return this.to;
    };
    HistogramChunk.prototype.GetNormalizedEndingValue = function () {
        return (this.to - this.histogram.minvalue) / (this.histogram.maxvalue - this.histogram.minvalue);
    };
    HistogramChunk.prototype.GetWidth = function () {
        return this.to - this.from;
    };
    HistogramChunk.prototype.GetNormalizedWidth = function () {
        return this.GetWidth() / (this.histogram.maxvalue - this.histogram.minvalue);
    };
    HistogramChunk.prototype.GetCount = function () {
        return this.count;
    };
    HistogramChunk.prototype.GetNormalizedCount = function () {
        return this.count / this.histogram.total;
    };
    HistogramChunk.prototype.GetMaxNormalizedCount = function () {
        return this.count /= this.histogram.maxcounter;
    };
    return HistogramChunk;
}());
/// <reference path="../control.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
/// <reference path="../../../model/histogram.ts" />
var HistogramViewer = /** @class */ (function () {
    function HistogramViewer(scalarfield, color) {
        if (color === void 0) { color = null; }
        this.scalarfield = scalarfield;
        this.color = color;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'HistogramViewer';
        this.nbrequestedchunks = 30;
        var self = this;
        this.canvas.onwheel = function (event) {
            self.nbrequestedchunks += event.deltaY > 0 ? -1 : 1;
            if (self.nbrequestedchunks < 1) {
                self.nbrequestedchunks = 1;
            }
            self.Refresh();
            event.stopPropagation();
        };
    }
    HistogramViewer.prototype.Refresh = function () {
        var histogram = new Histogram(this.scalarfield, this.nbrequestedchunks);
        var ctx = this.canvas.getContext('2d');
        var width = this.canvas.width;
        var height = this.canvas.height;
        ctx.fillStyle = 'white';
        ctx.clearRect(0, 0, width, height);
        for (var index = 0; index < histogram.Size(); index++) {
            var chunck = histogram.GetChunk(index);
            if (this.color) {
                var midvalue = 0.5 * (chunck.GetStartingValue() + chunck.GetEndingValue());
                ctx.fillStyle = this.color(midvalue);
            }
            ctx.fillRect(0, height * (1.0 - chunck.GetNormalizedEndingValue()), chunck.GetMaxNormalizedCount() * width, chunck.GetNormalizedWidth() * height);
        }
    };
    HistogramViewer.prototype.IsCollapsed = function () {
        return this.canvas.classList.contains(HistogramViewer.CollapsedClassName);
    };
    HistogramViewer.prototype.Collapse = function () {
        if (!this.IsCollapsed()) {
            this.canvas.classList.add(HistogramViewer.CollapsedClassName);
        }
    };
    HistogramViewer.prototype.Expand = function () {
        if (this.IsCollapsed()) {
            this.canvas.classList.remove(HistogramViewer.CollapsedClassName);
        }
    };
    HistogramViewer.prototype.GetElement = function () {
        return this.canvas;
    };
    HistogramViewer.CollapsedClassName = 'Collapsed';
    return HistogramViewer;
}());
/// <reference path="scalebounds.ts" />
/// <reference path="scalerenderer.ts" />
/// <reference path="histogramviewer.ts" />
/// <reference path="../pannel.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
var ColorScale = /** @class */ (function (_super) {
    __extends(ColorScale, _super);
    function ColorScale(field) {
        var _this = _super.call(this, 'ColorScale') || this;
        _this.field = field;
        _this.renderer = new ColorScaleRenderer();
        _this.bounds = new ColorScaleBoundsContainer(_this.field);
        _this.histo = new HistogramViewer(_this.field, function (v) { return self.GetColor(v); });
        _this.AddControl(_this.bounds);
        _this.AddControl(_this.renderer);
        _this.AddControl(_this.histo);
        var self = _this;
        _this.renderer.GetElement().onclick = function () {
            self.histo.IsCollapsed() ? self.histo.Expand() : self.histo.Collapse();
        };
        _this.histo.GetElement().onclick = function () {
            self.histo.Collapse();
        };
        return _this;
    }
    ColorScale.prototype.GetColor = function (value) {
        var ratio = (value - this.field.Min()) / (this.field.Max() - this.field.Min());
        return this.renderer.GetColor(ratio);
    };
    ColorScale.Show = function (field) {
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
    };
    ColorScale.Hide = function () {
        if (this.instance) {
            ColorScale.showHisto = this.instance.histo && !this.instance.histo.IsCollapsed();
            document.body.removeChild(this.instance.GetElement());
            delete this.instance;
        }
    };
    ColorScale.prototype.Refresh = function () {
        this.renderer.Refresh(this.field);
        this.bounds.Refresh();
        this.histo.Refresh();
    };
    ColorScale.showHisto = true;
    return ColorScale;
}(Pannel));
/// <reference path="control.ts" />
/// <reference path="popup.ts" />
/// <reference path="../objects/pclnode.ts" />
/// <reference path="../objects/pclgroup.ts" />
/// <reference path="../datahandler.ts" />
/// <reference path="./colorscale/colorscale.ts" />
var DataItem = /** @class */ (function () {
    //Here we go
    function DataItem(item, dataHandler) {
        var _this = this;
        this.item = item;
        this.dataHandler = dataHandler;
        this.uuid = DataItem.ItemsCache.length;
        DataItem.ItemsCache.push(this);
        this.sons = [];
        this.container = document.createElement('div');
        this.container.className = 'TreeItemContainer';
        this.container.id = DataItem.GetId(this.uuid);
        this.container.draggable = true;
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
        var self = this;
        //Quick actions (visibility, menu, deletion)
        this.visibilityIcon = document.createElement('i');
        this.visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
        this.itemContentContainer.appendChild(this.visibilityIcon);
        this.visibilityIcon.onclick = function (ev) { return self.ViewClicked(); };
        var menuIcon = document.createElement('i');
        menuIcon.className = 'ItemAction fa fa-ellipsis-h';
        this.itemContentContainer.appendChild(menuIcon);
        menuIcon.onclick = function (ev) { return _this.ItemMenu(ev); };
        var deletionIcon = null;
        if (this.item.deletable) {
            deletionIcon = document.createElement('i');
            deletionIcon.className = 'ItemAction fa fa-trash';
            this.itemContentContainer.appendChild(deletionIcon);
            deletionIcon.onclick = function (ev) { return self.DeletionClicked(ev); };
        }
        //The item name by itself
        var itemNameContainer = document.createElement('span');
        itemNameContainer.className = 'ItemNameContainer';
        this.itemName = document.createTextNode(this.item.name);
        itemNameContainer.appendChild(this.itemName);
        this.itemContentContainer.appendChild(itemNameContainer);
        //Handle left/right click on the item title
        this.itemContentContainer.onclick = function (ev) { return self.ItemClicked(ev); };
        this.itemContentContainer.oncontextmenu = function (ev) { return _this.ItemMenu(ev); };
        //Handle Drag'n drop
        this.InitializeDrapNDrop();
        //Populate children
        this.itemChildContainer = document.createElement('div');
        this.itemChildContainer.className = 'ItemChildContainer';
        if (item instanceof PCLGroup) {
            this.UpdateGroupFolding(item);
        }
        this.container.appendChild(this.itemChildContainer);
        var children = item.GetChildren();
        for (var index = 0; index < children.length; index++) {
            this.AddSon(children[index]);
        }
        //Bind HTML content to match the actual state of the item
        item.AddChangeListener(this);
        item.AddChangeListener(this.dataHandler.selection);
    }
    DataItem.GetItemById = function (id) {
        var key = parseInt(id.replace(DataItem.IdPrefix, ''), 10);
        return DataItem.ItemsCache[key];
    };
    DataItem.GetId = function (uuid) {
        return DataItem.IdPrefix + uuid;
    };
    DataItem.prototype.ClearDrapNDropStyles = function () {
        this.container.classList.remove('DropInside');
        this.container.classList.remove('DropBefore');
        this.container.classList.remove('DropAfter');
    };
    DataItem.prototype.InitializeDrapNDrop = function () {
        var _this = this;
        this.container.ondragstart = function (ev) {
            ev.stopPropagation();
            ev.dataTransfer.setData("application/my-app", (ev.target).id);
            ev.dataTransfer.dropEffect = 'move';
            if (PCLNode.IsPCLContainer(_this.item)) {
                _this.item.SetFolding(true);
            }
        };
        this.container.ondragover = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            ev.dataTransfer.dropEffect = 'move';
            var target = (ev.target);
            if (PCLNode.IsPCLContainer(_this.item) && target.classList.contains('ItemIcon')) {
                _this.container.classList.add('DropInside');
                _this.item.SetFolding(false);
            }
            else {
                if (ev.offsetY > _this.itemContentContainer.clientHeight / 2) {
                    _this.container.classList.remove('DropBefore');
                    _this.container.classList.add('DropAfter');
                }
                else {
                    _this.container.classList.remove('DropAfter');
                    _this.container.classList.add('DropBefore');
                }
            }
        };
        this.container.ondragleave = function (ev) {
            ev.stopPropagation();
            _this.ClearDrapNDropStyles();
        };
        this.container.ondragend = function (ev) {
            _this.ClearDrapNDropStyles();
        };
        this.container.ondrop = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var sourceId = ev.dataTransfer.getData("application/my-app");
            var source = DataItem.GetItemById(sourceId).item;
            var target = _this.item;
            if (PCLNode.IsPCLContainer(target) && ev.target.classList.contains('ItemIcon')) {
                target.Add(source);
            }
            else {
                if (ev.offsetY > _this.itemContentContainer.clientHeight / 2) {
                    (target.owner).Insert(source, target, PCLInsertionMode.After);
                }
                else {
                    (target.owner).Insert(source, target, PCLInsertionMode.Before);
                }
            }
            _this.ClearDrapNDropStyles();
        };
    };
    // Hierarchy management
    DataItem.prototype.AddSon = function (item, index) {
        if (index === void 0) { index = null; }
        var son = new DataItem(item, this.dataHandler);
        if (index === null) {
            this.sons.push(son);
            this.itemChildContainer.appendChild(son.GetContainerElement());
        }
        else {
            this.sons.splice(index, 0, son);
            this.itemChildContainer.insertBefore(son.GetContainerElement(), this.itemChildContainer.childNodes[index]);
        }
    };
    DataItem.prototype.RemoveSon = function (index) {
        this.sons.splice(index, 1);
        this.itemChildContainer.removeChild(this.itemChildContainer.childNodes[index]);
    };
    DataItem.prototype.SwapSons = function (a, b) {
        var son = this.sons[a];
        this.sons[a] = this.sons[b];
        this.sons[b] = son;
        var container = this.itemChildContainer;
        var child = container.removeChild(container.childNodes[a]);
        container.insertBefore(container.childNodes[b], container.childNodes[a]);
        container.insertBefore(child, container.childNodes.length > b ? container.childNodes[b] : null);
    };
    DataItem.prototype.FindSon = function (item) {
        for (var index = 0; index < this.sons.length; index++) {
            if (this.sons[index].item === item)
                return index;
        }
        return -1;
    };
    DataItem.prototype.Refresh = function () {
        if (this.item instanceof PCLGroup) {
            this.UpdateGroupFolding(this.item);
        }
        this.itemName.data = this.item.name;
        this.itemContentContainer.className = this.item.selected ? 'SelectedSceneItem' : 'SceneItem';
        this.itemIcon.className = 'ItemIcon fa ' + this.item.GetDisplayIcon();
        this.visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
    };
    DataItem.prototype.RefreshChildsList = function () {
        var children = this.item.GetChildren();
        //First - check for insertions
        for (var index = 0; index < children.length; index++) {
            var child = children[index];
            var sonIndex = this.FindSon(child);
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
    };
    //Whenever the data changes, handle it
    DataItem.prototype.NotifyChange = function (source, change) {
        this.Refresh();
        if (change & ChangeType.Creation) {
            if (!source.owner) {
                var owner = this.dataHandler.GetNewItemOwner();
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
    };
    //Group folding management - When clicking a group icon
    DataItem.prototype.ItemFolded = function () {
        var self = this;
        return function (event) {
            self.item.ToggleFolding();
            self.CancelBubbling(event);
        };
    };
    DataItem.prototype.UpdateGroupFolding = function (item) {
        this.itemChildContainer.style.display = item.folded ? 'none' : 'block';
    };
    //When left - clicking an item
    DataItem.prototype.ItemClicked = function (ev) {
        var event = ev || window.event;
        if (event.ctrlKey) {
            this.item.ToggleSelection();
        }
        else {
            this.dataHandler.selection.SingleSelect(this.item);
            new TemporaryHint('You can select multiple items by pressing the CTRL key when clicking an element');
        }
        this.CancelBubbling(event);
    };
    //When right - clicking an item
    DataItem.prototype.ItemMenu = function (ev) {
        var event = ev || window.event;
        if (event.ctrlKey) {
            this.item.Select(true);
        }
        else {
            this.dataHandler.selection.SingleSelect(this.item);
        }
        var actions = this.dataHandler.selection.GetActions(this.dataHandler.GetActionsDelegate());
        if (actions) {
            Popup.CreatePopup(this.itemContentContainer, actions);
        }
        this.CancelBubbling(event);
        return false;
    };
    //When clicking the visibility icon next to an item
    DataItem.prototype.ViewClicked = function () {
        this.item.ToggleVisibility();
    };
    //When clicking the deletion icon next to an item
    DataItem.prototype.DeletionClicked = function (ev) {
        var event = ev || window.event;
        if (confirm('Are you sure you want to delete "' + this.item.name + '" ?')) {
            this.item.Select(false);
            this.item.owner.Remove(this.item);
            this.CancelBubbling(event);
        }
    };
    DataItem.prototype.CancelBubbling = function (event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        else {
            event.cancelBubble = true;
        }
    };
    DataItem.prototype.GetElement = function () {
        return this.container;
    };
    DataItem.prototype.GetContainerElement = function () {
        return this.container;
    };
    //Fast access to all the data items
    DataItem.ItemsCache = [];
    DataItem.IdPrefix = 'DataItem#';
    return DataItem;
}());
/// <reference path="pclnode.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../model/boundingbox.ts" />
var SelectionList = /** @class */ (function () {
    function SelectionList(changeHandler) {
        this.changeHandler = changeHandler;
        this.items = [];
    }
    SelectionList.prototype.RegisterListenableItem = function (item) {
        item.AddChangeListener(this);
        this.UpdateSelectionList(item);
    };
    SelectionList.prototype.NotifyChange = function (node, type) {
        if (type === ChangeType.Selection) {
            this.UpdateSelectionList(node);
        }
    };
    SelectionList.prototype.UpdateSelectionList = function (item) {
        var itemIndex = this.items.indexOf(item);
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
    };
    SelectionList.prototype.GetBoundingBox = function () {
        var box = new BoundingBox();
        for (var index = 0; index < this.items.length; index++) {
            box.AddBoundingBox(this.items[index].GetBoundingBox());
        }
        return box;
    };
    SelectionList.prototype.Size = function () {
        return this.items.length;
    };
    SelectionList.prototype.GetProperties = function () {
        if (this.Size() == 1) {
            return this.items[0].GetProperties();
        }
        else if (this.Size() > 1) {
            if (!this.ownProperties) {
                var self_10 = this;
                this.ownProperties = new Properties();
                this.ownProperties.Push(new NumberProperty('Selected items', function () { return self_10.Size(); }, null));
            }
            return this.ownProperties;
        }
        return null;
    };
    SelectionList.prototype.GetActions = function (delegate) {
        var _this = this;
        var actions = [];
        var self = this;
        if (this.Size() > 1) {
            actions.push(new SimpleAction('Hide all', function () { return _this.ShowAll(false); }, 'Hide all the selected items'));
            actions.push(new SimpleAction('Show all', function () { return _this.ShowAll(true); }, 'Show all the selected items'));
            actions.push(null);
        }
        if (this.Size() == 1) {
            actions = this.items[0].GetActions(delegate);
        }
        else if (this.Size() == 2) {
            var cloudindex = this.FindFirst(function (n) { return n instanceof PCLPointCloud; });
            if (cloudindex >= 0) {
                actions = actions || [];
                var cloud = this.items[cloudindex];
                var other = this.items[1 - cloudindex];
                actions.push(new ComputeDistancesAction(cloud, other));
            }
        }
        return actions;
    };
    SelectionList.prototype.FindFirst = function (test) {
        for (var index = 0; index < this.items.length; index++) {
            if (test(this.items[index]))
                return index;
        }
        return -1;
    };
    SelectionList.prototype.ShowAll = function (b) {
        for (var index = 0; index < this.Size(); index++) {
            this.items[index].SetVisibility(b);
        }
    };
    SelectionList.prototype.GetSingleSelection = function () {
        return this.items.length == 1 ? this.items[0] : null;
    };
    SelectionList.prototype.SingleSelect = function (node) {
        var changeHandler = this.changeHandler;
        this.changeHandler = null;
        if (node) {
            node.Select(true);
        }
        while (this.items.length) {
            var length_2 = this.items.length;
            var last = this.items[length_2 - 1];
            if (last != node) {
                last.Select(false);
            }
            if (this.items.length == length_2) {
                this.items.pop();
            }
        }
        if (node) {
            this.items.push(node);
        }
        this.changeHandler = changeHandler;
        this.changeHandler.OnSelectionChange(this);
    };
    return SelectionList;
}());
/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/pannel.ts" />
/// <reference path="controls/dataitem.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="objects/pclgroup.ts" />
/// <reference path="objects/selectionlist.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="app.ts" />
/// <reference path="opengl/renderer.ts" />
/// <reference path="../controler/actions/delegate.ts" />
var DataHandler = /** @class */ (function (_super) {
    __extends(DataHandler, _super);
    function DataHandler(scene, ownerView) {
        var _this = _super.call(this, 'DataWindow', HandlePosition.Right) || this;
        _this.scene = scene;
        _this.ownerView = ownerView;
        _this.selection = new SelectionList(_this);
        _this.dataArea = new Pannel('DataArea');
        _this.propertiesArea = new Pannel('PropertiesArea');
        _this.AddControl(_this.dataArea);
        _this.dataArea.AddControl(new DataItem(scene, _this));
        _this.AddControl(_this.propertiesArea);
        return _this;
    }
    DataHandler.prototype.ReplaceScene = function (scene) {
        this.scene = scene;
        this.propertiesArea.Clear();
        this.dataArea.Clear();
        this.dataArea.AddControl(new DataItem(scene, this));
        this.AskRendering();
    };
    DataHandler.prototype.Resize = function (width, height) {
        var pannel = this.GetElement();
        pannel.style.height = (height - 2 * pannel.offsetTop) + 'px';
        this.RefreshSize();
        this.HandlePropertiesWindowVisibility();
    };
    DataHandler.prototype.HandlePropertiesWindowVisibility = function () {
        var pannel = this.GetElement();
        var dataArea = this.dataArea.GetElement();
        var propertiesArea = this.propertiesArea.GetElement();
        if (this.selection.GetProperties()) {
            var height = pannel.clientHeight / 2;
            dataArea.style.height = height + 'px';
            var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
            height -= delta;
            dataArea.style.height = height + 'px';
            propertiesArea.style.height = dataArea.style.height;
            dataArea.style.borderBottom = '1px solid lightGray';
            propertiesArea.style.borderTop = '1px solid darkGray';
        }
        else {
            var height = pannel.clientHeight;
            dataArea.style.height = height + 'px';
            var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
            height -= delta;
            dataArea.style.height = height + 'px';
            propertiesArea.style.height = "0px";
            dataArea.style.borderBottom = '';
            propertiesArea.style.borderTop = '';
        }
    };
    DataHandler.prototype.DeclareNewItem = function (item) {
        this.selection.RegisterListenableItem(item);
    };
    DataHandler.prototype.OnSelectionChange = function (selection) {
        this.UpdateProperties();
        this.ownerView.RefreshRendering();
        this.RefreshColorScale();
    };
    DataHandler.prototype.FocusOnItem = function (item) {
        this.selection.SingleSelect(item);
        this.ownerView.FocusOnCurrentSelection();
    };
    DataHandler.prototype.UpdateProperties = function () {
        var properties = this.selection.GetProperties();
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
    };
    DataHandler.prototype.RefreshColorScale = function () {
        var item = this.selection.GetSingleSelection();
        if (item && (item instanceof PCLPointCloud)) {
            var cloud = item;
            var field = cloud.GetCurrentField();
            if (field)
                ColorScale.Show(field).Refresh();
            else
                ColorScale.Hide();
        }
        else
            ColorScale.Hide();
    };
    DataHandler.prototype.GetNewItemOwner = function () {
        var item = this.selection.GetSingleSelection();
        var owner = (item && item.owner && !(item instanceof LightsContainer)) ?
            item :
            this.scene.Contents;
        if (owner instanceof PCLGroup)
            return owner;
        return owner.owner;
    };
    DataHandler.prototype.GetSceneRenderer = function () {
        return this.ownerView.sceneRenderer;
    };
    DataHandler.prototype.GetActionsDelegate = function () {
        return this.ownerView;
    };
    DataHandler.prototype.AskRendering = function () {
        this.ownerView.RefreshRendering();
    };
    return DataHandler;
}(HideablePannel));
/// <reference path="control.ts" />
/// <reference path="button.ts" />
var ComboBox = /** @class */ (function () {
    function ComboBox(label, actions, hintMessage) {
        var self = this;
        this.button = new Button(label, function () {
            var options;
            if (Action.IsActionProvider(actions)) {
                options = actions.GetActions();
            }
            else {
                options = actions;
            }
            if (options && options.length) {
                Popup.CreatePopup(self.button, options);
            }
        }, hintMessage);
    }
    ComboBox.prototype.GetElement = function () {
        return this.button.GetElement();
    };
    return ComboBox;
}());
/// <reference path="control.ts" />
var ProgressBar = /** @class */ (function () {
    function ProgressBar(onstop) {
        if (onstop === void 0) { onstop = null; }
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
    ProgressBar.prototype.Initialize = function (message, stopable) {
        if (stopable === void 0) { stopable = null; }
        this.SetMessage(message);
        this.Show();
        if (stopable && stopable.Stopable()) {
            var stopbtn = document.createElement('div');
            stopbtn.className = 'ProgressStop';
            stopbtn.innerText = 'Stop';
            stopbtn.onclick = function () { return stopable.Stop(); };
            this.control.appendChild(stopbtn);
        }
    };
    ProgressBar.prototype.Finalize = function () {
        this.Delete();
    };
    ProgressBar.prototype.RefreshDelay = function () {
        return this.refreshtime;
    };
    ProgressBar.prototype.SetMessage = function (message) {
        this.message.innerHTML = '';
        this.message.appendChild(document.createTextNode(message));
    };
    ProgressBar.prototype.Show = function () {
        if (ProgressBar.CurrentProgress) {
            ProgressBar.CurrentProgress.nestedcontainer.appendChild(this.control);
        }
        else {
            document.body.appendChild(this.control);
            ProgressBar.CurrentProgress = this;
        }
    };
    ProgressBar.prototype.Delete = function () {
        if (this.control.parentNode && this.control.parentNode.contains(this.control)) {
            this.control.parentNode.removeChild(this.control);
        }
        if (ProgressBar.CurrentProgress === this) {
            ProgressBar.CurrentProgress = null;
        }
    };
    ProgressBar.prototype.Update = function (current, total) {
        var now = (new Date()).getTime();
        if (this.lastupdate == null || (now - this.lastupdate) > this.updatedelay) {
            this.progress.innerText = (current / total * 100).toFixed(1) + '%';
            this.progress.style.width = ((current / total) * this.container.scrollWidth) + 'px';
            this.lastupdate = now;
            return true;
        }
        return false;
    };
    ProgressBar.prototype.GetElement = function () {
        return this.control;
    };
    return ProgressBar;
}());
/// <reference path="control.ts" />
/// <reference path="combobox.ts" />
/// <reference path="progressbar.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../files/csvloader.ts" />
/// <reference path="../../files/plyloader.ts" />
/// <reference path="../../files/pclloader.ts" />
var FileOpener = /** @class */ (function (_super) {
    __extends(FileOpener, _super);
    function FileOpener(label, filehandler, hintMessage) {
        var _this = _super.call(this, label, function () { return _this.UploadFile(); }, hintMessage) || this;
        _this.label = label;
        _this.filehandler = filehandler;
        _this.hintMessage = hintMessage;
        var self = _this;
        _this.input = document.createElement('input');
        _this.input.type = 'File';
        _this.input.className = 'FileOpener';
        _this.input.multiple = false;
        _this.input.onchange = function () {
            self.LoadFile(self.input.files[0]);
        };
        return _this;
    }
    FileOpener.prototype.UploadFile = function () {
        this.input.value = null;
        this.input.accept = '.ply,.csv,.pcld';
        this.input.click();
    };
    FileOpener.prototype.LoadFile = function (file) {
        if (file) {
            var self_11 = this;
            var progress_1 = new ProgressBar();
            var reader = new FileReader();
            reader.onloadend = function () {
                progress_1.Delete();
                self_11.LoadFromContent(file.name, this.result);
            };
            reader.onprogress = function (event) {
                progress_1.Update(event.loaded, event.total);
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
            progress_1.Show();
            progress_1.SetMessage('Loading file : ' + file.name);
            reader.readAsArrayBuffer(file);
        }
    };
    FileOpener.prototype.LoadFromContent = function (fileName, fileContent) {
        if (fileContent) {
            var extension = fileName.split('.').pop().toLocaleLowerCase();
            var loader = null;
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
                var self_12 = this;
                loader.Load(function (result) { self_12.filehandler(result); }, function (error) { alert(error); });
            }
        }
    };
    return FileOpener;
}(Button));
/// <reference path="control.ts" />
var SelectDrop = /** @class */ (function () {
    function SelectDrop(label, options, selected, hintMessage) {
        var self = this;
        for (var index = 0; index < options.length; index++) {
            options[index].AddListener(this);
        }
        this.button = new Button(label, function () { return Popup.CreatePopup(self.button, self.GetAvailableOptions(options)); }, hintMessage);
        this.SetCurrent(options[selected].GetLabel(false));
    }
    SelectDrop.prototype.GetAvailableOptions = function (options) {
        var availableOptions = [];
        for (var index = 0; index < options.length; index++) {
            var option = options[index];
            if (option.GetLabel(false) !== this.button.GetLabel()) {
                availableOptions.push(option);
            }
        }
        return availableOptions;
    };
    SelectDrop.prototype.GetElement = function () {
        return this.button.GetElement();
    };
    SelectDrop.prototype.SetCurrent = function (current) {
        this.button.SetLabel(current);
    };
    SelectDrop.prototype.OnTrigger = function (action) {
        this.SetCurrent(action.GetLabel(false));
    };
    return SelectDrop;
}());
/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/toolbar.ts" />
/// <reference path="controls/fileopener.ts" />
/// <reference path="controls/button.ts" />
/// <reference path="controls/selectdrop.ts" />
/// <reference path="app.ts" />
/// <reference path="../controler/actions/cameracenter.ts" />
/// <reference path="../controler/actions/controlerchoice.ts" />
var Menu = /** @class */ (function (_super) {
    __extends(Menu, _super);
    function Menu(application) {
        var _this = _super.call(this, 'MenuToolbar', HandlePosition.Bottom) || this;
        _this.application = application;
        _this.toolbar = new Toolbar();
        _this.container.AddControl(_this.toolbar);
        var dataHandler = application.dataHandler;
        _this.toolbar.AddControl(new FileOpener('[Icon:file-o]', function (createdObject) {
            if (createdObject != null) {
                if (createdObject instanceof Scene) {
                    dataHandler.ReplaceScene(createdObject);
                }
                else {
                    var owner = dataHandler.GetNewItemOwner();
                    owner.Add(createdObject);
                    createdObject.NotifyChange(createdObject, ChangeType.NewItem);
                }
            }
        }, 'Load data from a file'));
        _this.toolbar.AddControl(new Button('[Icon:save]', function () {
            application.SaveCurrentScene();
        }, 'Save the scene data to your browser storage (data will be automatically retrieved on next launch)'));
        _this.toolbar.AddControl(new ComboBox('[Icon:bars]', _this, 'Contextual menu : list of actions available for the current selection.'));
        _this.toolbar.AddControl(new Button('[Icon:search]', function () {
            application.FocusOnCurrentSelection();
        }, 'Focus current viewpoint on the selected item'));
        _this.toolbar.AddControl(new SelectDrop('[Icon:desktop] Mode', [
            application.RegisterShortCut(new CameraModeAction(application)),
            application.RegisterShortCut(new TransformModeAction(application)),
            application.RegisterShortCut(new LightModeAction(application))
        ], 0, 'Change the current working mode (how the mouse/keyboard are considered to interact with the scene)'));
        _this.toolbar.AddControl(new Button('[Icon:question-circle]', function () {
            window.open('help.html', '_blank');
        }));
        return _this;
    }
    Menu.prototype.Clear = function () {
        this.toolbar.Clear();
    };
    Menu.prototype.GetActions = function () {
        return this.application.dataHandler.selection.GetActions(this.application);
    };
    return Menu;
}(HideablePannel));
/// <reference path="control.ts" />
/// <reference path="../coordinatessystem.ts" />
/// <reference path="../../maths/vector.ts" />
var AxisLabel = /** @class */ (function () {
    function AxisLabel(label, axis, system) {
        this.label = label;
        this.axis = axis;
        this.system = system;
        var color = axis.Normalized().Times(160).Flatten();
        this.container = document.createElement('div');
        this.container.className = 'AxisLabel';
        this.container.style.color = 'rgb(' + color.join(',') + ')';
        this.container.appendChild(document.createTextNode(label));
        this.container.onclick = function (event) {
            system.ChangeViewAxis(axis);
        };
    }
    AxisLabel.prototype.GetElement = function () {
        return this.container;
    };
    AxisLabel.prototype.Refresh = function () {
        var camera = this.system.renderer.camera;
        var projection = camera.ComputeProjection(this.axis, true);
        var ownerRect = this.system.GetElement().getBoundingClientRect();
        this.container.style.left = (ownerRect.left + projection.Get(0)) + 'px';
        this.container.style.top = (ownerRect.bottom - projection.Get(1)) + 'px';
        this.depth = projection.Get(2);
    };
    AxisLabel.prototype.UpdateDepth = function (axes) {
        var order = 0;
        for (var index = 0; index < axes.length; index++) {
            if (this.depth < axes[index].depth) {
                order++;
            }
        }
        this.container.style.zIndex = '' + (2 + order);
    };
    return AxisLabel;
}());
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
var CoordinatesSystem = /** @class */ (function () {
    function CoordinatesSystem(view) {
        this.view = view;
        var self = this;
        //Create the coordinates axes to be rendered
        var axes = [
            new PCLCylinder(new Cylinder(new Vector([.5, .0, .0]), new Vector([1.0, .0, .0]), .1, 1.0)),
            new PCLCylinder(new Cylinder(new Vector([.0, .5, .0]), new Vector([.0, 1.0, .0]), .1, 1.0)),
            new PCLCylinder(new Cylinder(new Vector([.0, .0, .5]), new Vector([.0, .0, 1.0]), .1, 1.0))
        ];
        this.coordssystem = new Scene();
        for (var index_4 = 0; index_4 < axes.length; index_4++) {
            axes[index_4].SetBaseColor(axes[index_4].cylinder.axis.Flatten());
            this.coordssystem.Contents.Add(axes[index_4]);
            axes[index_4].AddChangeListener(this);
        }
        //Refine lighting
        var light = this.coordssystem.Lights.children[0];
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
    CoordinatesSystem.prototype.Refresh = function () {
        var mainCamera = this.MainRenderer.camera;
        this.renderer.camera.SetDirection(mainCamera.GetDirection(), mainCamera.up);
        this.renderer.RefreshSize();
        this.renderer.Draw(this.coordssystem);
        for (var index = 0; index < this.axesLabels.length; index++) {
            this.axesLabels[index].Refresh();
        }
        for (var index = 0; index < this.axesLabels.length; index++) {
            this.axesLabels[index].UpdateDepth(this.axesLabels);
        }
    };
    CoordinatesSystem.prototype.GetElement = function () {
        return this.renderer.GetElement();
    };
    CoordinatesSystem.prototype.ChangeViewAxis = function (axis) {
        this.MainRenderer.camera.SetDirection(axis, axis.GetOrthogonnal());
        this.view.RefreshRendering();
    };
    Object.defineProperty(CoordinatesSystem.prototype, "MainRenderer", {
        get: function () {
            return this.view.sceneRenderer;
        },
        enumerable: true,
        configurable: true
    });
    CoordinatesSystem.prototype.NotifyChange = function (node) {
        this.renderer.Draw(this.coordssystem);
        this.view.RefreshRendering();
    };
    return CoordinatesSystem;
}());
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
var PCLApp = /** @class */ (function () {
    function PCLApp() {
        this.shortcuts = {};
        var scenebuffer = null;
        try {
            scenebuffer = window.localStorage.getItem(PCLApp.sceneStorageKey);
        }
        catch (e) {
            scenebuffer = null;
            console.warn('Could not load data from local storage');
        }
        if (scenebuffer) {
            console.info('Loading locally stored data');
            var loader = new PCLLoader(scenebuffer);
            var self_13 = this;
            loader.Load(function (scene) { return self_13.Initialize(scene); }, function (error) {
                console.error('Failed to initialize scene from storage : ' + error);
                console.warn('Start from an empty scene, instead');
                self_13.Initialize(new Scene());
            });
        }
        else {
            console.info('Initializing a brand new scene');
            this.Initialize(new Scene());
        }
    }
    PCLApp.Run = function () {
        if (!PCLApp.instance) {
            PCLApp.instance = new PCLApp();
        }
    };
    PCLApp.prototype.Initialize = function (scene) {
        var self = this;
        this.InitializeLongProcess();
        this.InitializeDataHandler(scene);
        this.InitializeRenderers(scene);
        this.InitializeMenu();
        this.Resize();
        window.onresize = function () {
            self.Resize();
        };
        this.RefreshRendering();
    };
    PCLApp.prototype.InitializeLongProcess = function () {
        LongProcess.progresFactory = function () { return new ProgressBar(); };
    };
    PCLApp.prototype.InitializeDataHandler = function (scene) {
        var self = this;
        this.dataHandler = new DataHandler(scene, this);
        document.body.appendChild(self.dataHandler.GetElement());
    };
    PCLApp.prototype.InitializeMenu = function () {
        var self = this;
        this.menu = new Menu(this);
        document.body.appendChild(self.menu.GetElement());
    };
    PCLApp.prototype.InitializeRenderers = function (scene) {
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
    };
    PCLApp.prototype.Resize = function () {
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
    };
    PCLApp.prototype.RenderScene = function () {
        if (this.sceneRenderer) {
            this.sceneRenderer.Draw(this.dataHandler.scene);
        }
    };
    PCLApp.prototype.RefreshRendering = function () {
        this.RenderScene();
        if (this.coordinatesSystem) {
            this.coordinatesSystem.Refresh();
        }
    };
    PCLApp.prototype.SaveCurrentScene = function () {
        //Dry run (to get the buffer size)
        var serializer = new PCLSerializer(null);
        this.dataHandler.scene.Serialize(serializer);
        var bufferSize = serializer.GetBufferSize();
        //Actual serialization
        serializer = new PCLSerializer(bufferSize);
        this.dataHandler.scene.Serialize(serializer);
        try {
            window.localStorage.setItem(PCLApp.sceneStorageKey, serializer.GetBufferAsString());
            var data = window.localStorage.getItem(PCLApp.sceneStorageKey);
            if (data.length != serializer.GetBufferSize()) {
                console.info('Integrity check failure. Cannot save data to the local storage.');
                window.localStorage.setItem(PCLApp.sceneStorageKey, '');
            }
            console.info('Scene data have been sucessfully saved to local storage.');
        }
        catch (e) {
            var message = 'The data cannot be saved to your browser local storage :\n';
            message += '"' + e + '"\n';
            message += 'Do you want to save the scene data to a local file, instead ?\n';
            message += '(You can load the generated file using the leftmost menu entry)';
            if (confirm(message)) {
                this.dataHandler.scene.SaveToFile();
            }
        }
    };
    //=========================================
    // Implement Controlable interface
    //=========================================
    PCLApp.prototype.GetViewPoint = function () {
        return this.sceneRenderer.camera;
    };
    PCLApp.prototype.GetLightPosition = function (takeFocus) {
        var scene = this.dataHandler.scene;
        var light;
        if (scene.Lights.children.length == 1) {
            light = scene.Lights.children[0];
            if (takeFocus) {
                this.dataHandler.selection.SingleSelect(light);
            }
        }
        else {
            var item = this.dataHandler.selection.GetSingleSelection();
            if (item && item instanceof Light) {
                light = item;
            }
        }
        return light;
    };
    PCLApp.prototype.GetCurrentTransformable = function () {
        var item = this.dataHandler.selection.GetSingleSelection();
        if (item && item instanceof PCLPrimitive)
            return item;
        return null;
    };
    PCLApp.prototype.NotifyControlStart = function () {
        this.dataHandler.TemporaryHide();
        this.menu.TemporaryHide();
    };
    PCLApp.prototype.NotifyControlEnd = function () {
        this.dataHandler.RestoreVisibility();
        this.menu.RestoreVisibility();
    };
    PCLApp.prototype.NotifyPendingControl = function () {
    };
    PCLApp.prototype.NotifyViewPointChange = function (c) {
        if (this.coordinatesSystem) {
            if (c === ViewPointChange.Rotation || c === ViewPointChange.Position) {
                this.coordinatesSystem.Refresh();
            }
        }
        this.RenderScene();
    };
    PCLApp.prototype.NotifyTransform = function () {
        this.RenderScene();
    };
    PCLApp.prototype.GetRengeringArea = function () {
        return this.sceneRenderer.GetElement();
    };
    PCLApp.prototype.SetCurrentControler = function (controler, refresh) {
        if (refresh === void 0) { refresh = true; }
        this.currentControler = controler;
        this.sceneRenderer.drawingcontext.bboxcolor = controler.GetSelectionColor();
        if (refresh) {
            this.RefreshRendering();
        }
    };
    PCLApp.prototype.GetCurrentControler = function () {
        return this.currentControler;
    };
    PCLApp.prototype.PickItem = function (x, y, exclusive) {
        var scene = this.dataHandler.scene;
        var selected = this.sceneRenderer.PickObject(x, y, scene);
        if (exclusive) {
            this.dataHandler.selection.SingleSelect(selected);
        }
        else if (selected && (selected instanceof PCLNode)) {
            selected.Select(true);
        }
    };
    PCLApp.prototype.FocusOnCurrentSelection = function () {
        var selection = this.dataHandler.selection;
        var selectionbb = selection.GetBoundingBox();
        if (selectionbb && this.sceneRenderer.camera.CenterOnBox(selectionbb)) {
            this.sceneRenderer.Draw(this.dataHandler.scene);
        }
    };
    PCLApp.prototype.CanFocus = function () {
        var selectionbb = this.dataHandler.selection.GetBoundingBox();
        return (selectionbb && selectionbb.IsValid());
    };
    PCLApp.prototype.ToggleRendering = function (mode) {
        var rendering = this.sceneRenderer.drawingcontext.rendering;
        switch (mode) {
            case RenderingMode.Point:
                rendering.Point(!rendering.Point());
                break;
            case RenderingMode.Wire:
                rendering.Wire(!rendering.Wire());
                break;
            case RenderingMode.Surface:
                rendering.Surface(!rendering.Surface());
                break;
        }
        this.RenderScene();
    };
    PCLApp.prototype.RegisterShortCut = function (action) {
        var shortcut = action.GetShortCut();
        if (shortcut) {
            var key = shortcut.toLowerCase();
            if (!(key in this.shortcuts)) {
                this.shortcuts[key] = action;
            }
            else {
                console.error('Shortcut "' + shortcut + '" is being registered multiples times.');
            }
        }
        return action;
    };
    PCLApp.prototype.HandleShortcut = function (key) {
        var action = this.shortcuts[key.toLowerCase()];
        if (action && action.Enabled()) {
            action.Run();
            return true;
        }
        return false;
    };
    //===================================
    // Implement ActionsDelegate interface
    // ==================================
    PCLApp.prototype.ScanFromCurrentViewPoint = function (group, hsampling, vsampling) {
        this.sceneRenderer.ScanFromCurrentViewPoint(group, hsampling, vsampling);
    };
    PCLApp.prototype.GetShapesSampling = function () {
        return this.sceneRenderer.drawingcontext.sampling;
    };
    //===================================
    // Implement Notifiable interface
    // ==================================
    PCLApp.prototype.NotifyChange = function (source) {
        this.RenderScene();
    };
    PCLApp.sceneStorageKey = 'PointCloudLab-Scene';
    return PCLApp;
}());
var IterativeRootFinder = /** @class */ (function () {
    function IterativeRootFinder(derivatives) {
        this.derivatives = derivatives;
        this.Run = function (initialGuess, step) {
            var current = initialGuess;
            for (var index = 0; index < this.maxIterations; index++) {
                var values = [];
                for (var order = 0; order < this.derivatives.length; order++) {
                    values.push(this.derivatives[order](current));
                }
                if (Math.abs(values[0]) <= this.resultTolerance)
                    return current;
                var delta = step(current, values);
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
    IterativeRootFinder.NewtonRaphsonStep = function (x, derivativesValues) {
        if (Math.abs(derivativesValues[1]) < 1.0e-12) {
            return null;
        }
        return -derivativesValues[0] / derivativesValues[1];
    };
    IterativeRootFinder.HalleyStep = function (x, derivativesValues) {
        var delta = (2.0 * derivativesValues[1] * derivativesValues[1]) - (derivativesValues[0] * derivativesValues[2]);
        if (Math.abs(delta) < 1.0e-12) {
            return null;
        }
        return -2.0 * derivativesValues[0] * derivativesValues[1] / delta;
    };
    return IterativeRootFinder;
}());
/// <reference path="rootsfinding.ts" />
var Polynomial = /** @class */ (function () {
    //Coefs are given from lowest degree to higher degree
    function Polynomial(coefficients) {
        this.coefficients = coefficients;
    }
    Polynomial.prototype.Degree = function () {
        return this.coefficients.length - 1;
    };
    Polynomial.prototype.Evaluate = function (x) {
        var index = this.coefficients.length - 1;
        var result = index >= 0 ? this.coefficients[index] : 0.0;
        while (index > 0) {
            index--;
            result = result * x + this.coefficients[index];
        }
        return result;
    };
    Polynomial.prototype.Derivate = function () {
        var coefs = [];
        for (var index = 1; index < this.coefficients.length; index++) {
            coefs.push(index * this.coefficients[index]);
        }
        return new Polynomial(coefs);
    };
    //Devide current polynomial by (x - a)
    Polynomial.prototype.Deflate = function (a) {
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
    };
    Polynomial.prototype.FindRealRoots = function (initialGuess) {
        var result = [];
        var degree = this.Degree();
        var root = initialGuess;
        var polynomial = this;
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
    };
    return Polynomial;
}());
//# sourceMappingURL=PointCloudLab.js.map