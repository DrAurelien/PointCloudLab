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
var Action = /** @class */ (function () {
    function Action(label, hintMessage) {
        this.label = label;
        this.hintMessage = hintMessage;
    }
    return Action;
}());
var SimpleAction = /** @class */ (function (_super) {
    __extends(SimpleAction, _super);
    function SimpleAction(label, callback, hintMessage) {
        if (callback === void 0) { callback = null; }
        var _this = _super.call(this, label, hintMessage) || this;
        _this.label = label;
        _this.callback = callback;
        _this.hintMessage = hintMessage;
        return _this;
    }
    SimpleAction.prototype.Enabled = function () {
        return this.callback !== null;
    };
    SimpleAction.prototype.Run = function () {
        return this.callback();
    };
    return SimpleAction;
}(Action));
/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
var CameraControler = /** @class */ (function (_super) {
    __extends(CameraControler, _super);
    function CameraControler(view, scene) {
        var _this = _super.call(this, view) || this;
        _this.scene = scene;
        return _this;
    }
    CameraControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var renderer = this.view.sceneRenderer;
        switch (displacement.button) {
            case 1: //Left mouse
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
                renderer.camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
                this.view.coordinatesSystem.Refresh();
                this.Cursor = Cursor.Rotate;
                break;
            case 2: //Middle mouse
                renderer.camera.Zoom(-displacement.dy / 10);
                this.Cursor = Cursor.Scale;
                break;
            case 3: //Right mouse
                renderer.camera.Pan(displacement.dx, displacement.dy);
                this.Cursor = Cursor.Translate;
                break;
            default:
                return true;
        }
        renderer.Draw(this.scene);
        return true;
    };
    CameraControler.prototype.HandleClick = function (tracker) {
        var renderer = this.view.sceneRenderer;
        switch (tracker.button) {
            case 1: //Left mouse
                var selected = renderer.PickObject(tracker.x, tracker.y, this.scene);
                this.scene.Select(selected);
                this.view.UpdateSelectedElement(selected);
                break;
            case 2: //Middle mouse
                var center = new CenterCameraAction(this.scene, this.view);
                center.Run();
                break;
            default:
                return true;
        }
        return true;
    };
    CameraControler.prototype.HandleWheel = function (delta) {
        var renderer = this.view.sceneRenderer;
        renderer.camera.Zoom(delta / 100);
        renderer.Draw(this.scene);
        return true;
    };
    CameraControler.prototype.HandleKey = function (key) {
        var renderer = this.view.sceneRenderer;
        switch (key) {
            case 'p'.charCodeAt(0):
                renderer.drawingcontext.rendering.Point(!renderer.drawingcontext.rendering.Point());
                break;
            case 'w'.charCodeAt(0):
                renderer.drawingcontext.rendering.Wire(!renderer.drawingcontext.rendering.Wire());
                break;
            case 's'.charCodeAt(0):
                renderer.drawingcontext.rendering.Surface(!renderer.drawingcontext.rendering.Surface());
                break;
            default:
                return true;
        }
        renderer.Draw(this.scene);
        return true;
    };
    return CameraControler;
}(MouseControler));
/**
 * The Camera Contorler handles mouse inputs in order to move the camera for the scene renderering
 */
var LightControler = /** @class */ (function (_super) {
    __extends(LightControler, _super);
    function LightControler(view) {
        var _this = _super.call(this, view) || this;
        var item = _this.view.dataHandler.currentItem;
        if (item && item instanceof Light) {
            _this.light = item;
            _this.view.sceneRenderer.camera.at = _this.light.Position;
            _this.view.RefreshRendering();
        }
        return _this;
    }
    LightControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var renderer = this.view.sceneRenderer;
        switch (displacement.button) {
            case 1: //Left mouse
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
                renderer.camera.Rotate(x, y, this.mousetracker.x, this.mousetracker.y);
                break;
            case 2: //Middle mouse
                renderer.camera.Zoom(-displacement.dy / 10);
                break;
            case 3: //Right mouse
                renderer.camera.Pan(displacement.dx, displacement.dy);
                break;
            default:
                return true;
        }
        this.light.Position = renderer.camera.at;
        this.Cursor = Cursor.Light;
        this.view.RefreshRendering();
        return true;
    };
    LightControler.prototype.HandleClick = function (tracker) {
        return true;
    };
    LightControler.prototype.HandleWheel = function (delta) {
        return true;
    };
    LightControler.prototype.HandleKey = function (key) {
        return true;
    };
    LightControler.prototype.EndMouseEvent = function () {
        this.view.Refresh();
    };
    return LightControler;
}(MouseControler));
var MouseControler = /** @class */ (function () {
    function MouseControler(view) {
        this.view = view;
        this.targetElement = view.sceneRenderer.GetElement();
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
                self.view.dataHandler.Hide();
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
        this.view.TemporaryHideHideables();
        this.StartMouseEvent();
    };
    MouseControler.prototype.End = function () {
        if (this.mousetracker != null && this.mousetracker.IsQuickEvent()) {
            this.HandleClick(this.mousetracker);
        }
        this.mousetracker = null;
        this.view.RestoreHideables();
        this.cursor.Restore(this.targetElement);
        this.EndMouseEvent();
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
    return MouseControler;
}());
var MouseTracker = /** @class */ (function () {
    function MouseTracker(event) {
        this.x = event.clientX;
        this.y = event.clientY;
        this.button = event.which;
        this.date = new Date();
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
var TransformControler = /** @class */ (function (_super) {
    __extends(TransformControler, _super);
    function TransformControler(view, scene) {
        var _this = _super.call(this, view) || this;
        _this.scene = scene;
        return _this;
    }
    TransformControler.prototype.HandleMouseMove = function (displacement) {
        if (displacement.IsNull()) {
            return true;
        }
        var datahandler = this.view.dataHandler;
        var renderer = this.view.sceneRenderer;
        if (!datahandler.currentItem || !(datahandler.currentItem instanceof Shape))
            return false;
        var item = datahandler.currentItem;
        switch (displacement.button) {
            case 1: //Left mouse
                var x = this.mousetracker.x - displacement.dx;
                var y = this.mousetracker.y - displacement.dy;
                var rotation = renderer.camera.GetRotationMatrix(this.mousetracker.x, this.mousetracker.y, x, y);
                item.Rotate(rotation);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Rotate]);
                break;
            case 2: //Middle mouse
                var scale = 1.0 - (displacement.dy / renderer.camera.screen.height);
                item.Scale(scale);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Scale]);
                break;
            case 3: //Right mouse
                var translation = renderer.camera.GetTranslationVector(-displacement.dx, -displacement.dy);
                item.Translate(translation);
                this.Cursor = Cursor.Combine([Cursor.Edit, Cursor.Translate]);
                break;
            default:
                return true;
        }
        renderer.Draw(this.scene);
        return true;
    };
    TransformControler.prototype.HandleClick = function (tracker) {
        var renderer = this.view.sceneRenderer;
        switch (tracker.button) {
            case 1: //Left mouse
                var selected = renderer.PickObject(tracker.x, tracker.y, this.scene);
                this.scene.Select(selected);
                this.view.UpdateSelectedElement(selected);
                break;
            case 2: //Middle mouse
                var center = new CenterCameraAction(this.scene, this.view);
                center.Run();
                break;
            default:
                return true;
        }
        return true;
    };
    TransformControler.prototype.HandleWheel = function (delta) {
        var datahandler = this.view.dataHandler;
        var renderer = this.view.sceneRenderer;
        if (!datahandler.currentItem || !(datahandler.currentItem instanceof Shape))
            return false;
        var item = datahandler.currentItem;
        item.Scale(1.0 + (delta / 1000.0));
        renderer.Draw(this.scene);
        return true;
    };
    TransformControler.prototype.HandleKey = function (key) {
        return true;
    };
    TransformControler.prototype.EndMouseEvent = function () {
        _super.prototype.EndMouseEvent.call(this);
        this.view.dataHandler.RefreshContent();
    };
    return TransformControler;
}(MouseControler));
var CenterCameraAction = /** @class */ (function (_super) {
    __extends(CenterCameraAction, _super);
    function CenterCameraAction(scene, view) {
        var _this = _super.call(this, 'Center camera on selection', 'Change the camera viewing direction so that it points to the selected object(s)') || this;
        _this.scene = scene;
        _this.view = view;
        return _this;
    }
    CenterCameraAction.prototype.Run = function () {
        var selectionbb = this.scene.GetSelectionBoundingBox();
        if (selectionbb && this.view.sceneRenderer.camera.CenterOnBox(selectionbb)) {
            this.view.sceneRenderer.Draw(this.scene);
        }
    };
    CenterCameraAction.prototype.Enabled = function () {
        var selectionbb = this.scene.GetSelectionBoundingBox();
        return (selectionbb && selectionbb.IsValid());
    };
    return CenterCameraAction;
}(Action));
var CameraModeAction = /** @class */ (function (_super) {
    __extends(CameraModeAction, _super);
    function CameraModeAction(view) {
        var _this = _super.call(this, 'Camera mode', 'The mouse can be used to control the position of the camera') || this;
        _this.view = view;
        return _this;
    }
    CameraModeAction.prototype.Run = function () {
        this.view.UseCameraControler();
    };
    CameraModeAction.prototype.Enabled = function () {
        return !(this.view.currentControler instanceof CameraControler);
    };
    return CameraModeAction;
}(Action));
var TransformModeAction = /** @class */ (function (_super) {
    __extends(TransformModeAction, _super);
    function TransformModeAction(view) {
        var _this = _super.call(this, 'Transformation mode', 'The mouse can be used to control the geometry of the selected item') || this;
        _this.view = view;
        return _this;
    }
    TransformModeAction.prototype.Run = function () {
        this.view.UseTransformationControler();
    };
    TransformModeAction.prototype.Enabled = function () {
        return !(this.view.currentControler instanceof TransformControler);
    };
    return TransformModeAction;
}(Action));
var LightModeAction = /** @class */ (function (_super) {
    __extends(LightModeAction, _super);
    function LightModeAction(view) {
        var _this = _super.call(this, 'Light mode', 'The mouse can be used to control the position of the selected light') || this;
        _this.view = view;
        return _this;
    }
    LightModeAction.prototype.Run = function () {
        this.view.UseLightControler();
    };
    LightModeAction.prototype.Enabled = function () {
        var item = this.view.dataHandler.currentItem;
        if (!(item && (item instanceof Light))) {
            return false;
        }
        return !(this.view.currentControler instanceof LightControler);
    };
    return LightModeAction;
}(Action));
var ResetDetectionAction = /** @class */ (function (_super) {
    __extends(ResetDetectionAction, _super);
    function ResetDetectionAction(cloud, onDone) {
        var _this = _super.call(this, 'Reset detection') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ResetDetectionAction.prototype.Enabled = function () {
        return !!this.cloud.ransac;
    };
    ResetDetectionAction.prototype.Run = function () {
        this.cloud.ransac = null;
        if (this.onDone)
            this.onDone();
    };
    return ResetDetectionAction;
}(Action));
var RansacDetectionAction = /** @class */ (function (_super) {
    __extends(RansacDetectionAction, _super);
    function RansacDetectionAction(cloud, onDone) {
        var _this = _super.call(this, 'Detect ' + (cloud.ransac ? 'another' : 'a') + ' shape') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    RansacDetectionAction.prototype.Enabled = function () {
        return this.cloud.HasNormals();
    };
    RansacDetectionAction.prototype.Run = function () {
        if (!this.cloud.ransac) {
            var self_1 = this;
            this.cloud.ransac = new Ransac(this.cloud);
            var dialog = new Dialog(function (d) { return self_1.InitializeAndLauchRansac(d); }, function () {
                self_1.cloud.ransac = null;
                return true;
            });
            dialog.InsertValue('Failures', this.cloud.ransac.nbFailure);
            dialog.InsertValue('Noise', this.cloud.ransac.noise);
            dialog.InsertTitle('Shapes to detect');
            dialog.InsertCheckBox('Planes', true);
            dialog.InsertCheckBox('Spheres', true);
            dialog.InsertCheckBox('Cylinders', true);
        }
        else {
            this.cloud.ransac.FindBestFittingShape(this.onDone);
        }
    };
    RansacDetectionAction.prototype.InitializeAndLauchRansac = function (properties) {
        try {
            this.cloud.ransac.nbFailure = parseInt(properties.GetValue('Failures'));
            this.cloud.ransac.noise = parseFloat(properties.GetValue('Noise'));
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
        this.cloud.ransac.SetGenerators(generators);
        this.cloud.ransac.FindBestFittingShape(this.onDone);
        return true;
    };
    return RansacDetectionAction;
}(Action));
var ConnectedComponentsAction = /** @class */ (function (_super) {
    __extends(ConnectedComponentsAction, _super);
    function ConnectedComponentsAction(cloud, onDone) {
        var _this = _super.call(this, 'Compute connected components', 'Split the point cloud into connected subsets') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ConnectedComponentsAction.prototype.Enabled = function () {
        return true;
    };
    ConnectedComponentsAction.prototype.Run = function () {
        this.cloud.ComputeConnectedComponents(30, this.onDone);
    };
    return ConnectedComponentsAction;
}(Action));
var ExportPointCloudFileAction = /** @class */ (function (_super) {
    __extends(ExportPointCloudFileAction, _super);
    function ExportPointCloudFileAction(cloud, onDone) {
        var _this = _super.call(this, 'Export file') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ExportPointCloudFileAction.prototype.Enabled = function () {
        return true;
    };
    ExportPointCloudFileAction.prototype.Run = function () {
        FileExporter.ExportFile(this.cloud.name + '.csv', this.cloud.GetCSVData(), 'text/csv');
    };
    return ExportPointCloudFileAction;
}(Action));
var ComputeNormalsAction = /** @class */ (function (_super) {
    __extends(ComputeNormalsAction, _super);
    function ComputeNormalsAction(cloud, onDone) {
        var _this = _super.call(this, 'Compute normals', 'Compute the vectors normal to the surface sampled by this point cloud') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ComputeNormalsAction.prototype.Enabled = function () {
        return !this.cloud.HasNormals();
    };
    ComputeNormalsAction.prototype.Run = function () {
        this.cloud.ComputeNormals(0, this.onDone);
    };
    return ComputeNormalsAction;
}(Action));
var ClearNormalsAction = /** @class */ (function (_super) {
    __extends(ClearNormalsAction, _super);
    function ClearNormalsAction(cloud, onDone) {
        var _this = _super.call(this, 'Clear normals', 'Clear previously computed normals') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    ClearNormalsAction.prototype.Enabled = function () {
        return this.cloud.HasNormals();
    };
    ClearNormalsAction.prototype.Run = function () {
        this.cloud.ClearNormals();
        if (this.onDone)
            this.onDone();
    };
    return ClearNormalsAction;
}(Action));
var GaussianSphereAction = /** @class */ (function (_super) {
    __extends(GaussianSphereAction, _super);
    function GaussianSphereAction(cloud, onDone) {
        var _this = _super.call(this, 'Compute gaussian sphere', 'Builds en new point cloud made of the point cloud normals. The resulting point cloud will sample the unit sphere (since normals are unit vectors) - hence the name.') || this;
        _this.cloud = cloud;
        _this.onDone = onDone;
        return _this;
    }
    GaussianSphereAction.prototype.Enabled = function () {
        return this.cloud.HasNormals();
    };
    GaussianSphereAction.prototype.Run = function () {
        var gsphere = this.cloud.GaussianSphere();
        if (this.onDone)
            this.onDone(gsphere);
    };
    return GaussianSphereAction;
}(Action));
var ScanFromCurrentViewPointAction = /** @class */ (function (_super) {
    __extends(ScanFromCurrentViewPointAction, _super);
    function ScanFromCurrentViewPointAction(group, dataHandler, onDone) {
        var _this = _super.call(this, 'Scan from current viewpoint', 'Create an new point cloud by simulating a LIDAR scanning of the group contents, from the current view point') || this;
        _this.group = group;
        _this.dataHandler = dataHandler;
        _this.onDone = onDone;
        return _this;
    }
    ScanFromCurrentViewPointAction.prototype.Enabled = function () {
        return this.group.IsScannable();
    };
    ScanFromCurrentViewPointAction.prototype.Run = function () {
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
        var self = this;
        this.dataHandler.GetSceneRenderer().ScanFromCurrentViewPoint(this.group, hsampling, vsampling, function (cloud) {
            self.group.Add(cloud);
            if (self.onDone) {
                self.onDone(cloud);
            }
        });
        return true;
    };
    ScanFromCurrentViewPointAction.hSamplingTitle = 'Horizontal Sampling';
    ScanFromCurrentViewPointAction.vSamplingTitle = 'Vertical Sampling';
    return ScanFromCurrentViewPointAction;
}(Action));
var Endianness;
(function (Endianness) {
    Endianness[Endianness["BigEndian"] = 0] = "BigEndian";
    Endianness[Endianness["LittleEndian"] = 1] = "LittleEndian";
})(Endianness || (Endianness = {}));
var BinaryReader = /** @class */ (function () {
    function BinaryReader(buffer) {
        this.cursor = 0;
        this.stream = new DataView(buffer);
        this.endianness = Endianness.BigEndian;
        var tmp = new ArrayBuffer(2);
        new DataView(tmp).setInt16(0, 256, true);
        this.innerendianness = (new Int16Array(tmp)[0] === 256 ? Endianness.LittleEndian : Endianness.BigEndian);
    }
    BinaryReader.prototype.Reset = function () {
        this.cursor = 0;
    };
    BinaryReader.prototype.Eof = function () {
        return (this.cursor >= this.stream.byteLength) || (this.stream[this.cursor] == 3);
    };
    BinaryReader.prototype.CountAsciiOccurences = function (asciichar) {
        var count = 0;
        this.Reset();
        while (!this.Eof()) {
            if (this.GetNextAsciiChar() == asciichar) {
                count++;
            }
        }
        return count;
    };
    BinaryReader.prototype.GetAsciiLine = function () {
        return this.GetAsciiUntil(['\n']);
    };
    BinaryReader.prototype.GetAsciiWord = function (onSameLine) {
        var stops = [' '];
        if (onSameLine === false) {
            stops.push('\n');
        }
        return this.GetAsciiUntil(stops);
    };
    BinaryReader.prototype.GetAsciiUntil = function (stops) {
        var result = '';
        function Stop(test) {
            for (var index = 0; index < stops.length; index++) {
                if (test == stops[index]) {
                    return true;
                }
            }
            return false;
        }
        do {
            result += this.GetNextAsciiChar();
        } while (!this.Eof() && !Stop(this.GetCurrentAsciiChar()));
        while (!this.Eof() && Stop(this.GetCurrentAsciiChar())) {
            this.GetNextAsciiChar();
        }
        return result;
    };
    BinaryReader.prototype.GetNextAsciiChar = function () {
        return String.fromCharCode(this.stream.getUint8(this.cursor++));
    };
    BinaryReader.prototype.GetCurrentAsciiChar = function () {
        return String.fromCharCode(this.stream.getUint8(this.cursor));
    };
    BinaryReader.prototype.GetNextUInt8 = function () {
        var result = this.stream.getInt8(this.cursor);
        this.cursor++;
        return result;
    };
    BinaryReader.prototype.GetNextInt32 = function () {
        var result = this.stream.getInt32(this.cursor, this.endianness == Endianness.LittleEndian);
        this.cursor += 4;
        return result;
    };
    BinaryReader.prototype.GetNextFloat32 = function () {
        var result = this.stream.getFloat32(this.cursor, this.endianness == Endianness.LittleEndian);
        this.cursor += 4;
        return result;
    };
    return BinaryReader;
}());
var CsvLoader = /** @class */ (function (_super) {
    __extends(CsvLoader, _super);
    function CsvLoader(content) {
        var _this = _super.call(this) || this;
        _this.parser = new CSVParser(content);
        _this.result = null;
        return _this;
    }
    CsvLoader.prototype.Load = function (ondone) {
        var self = this;
        this.result = new PointCloud();
        this.parser.SetNext(function (p) {
            self.result = p.cloud;
            ondone();
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
        _this.lineseparator = '\n';
        _this.reader = new BinaryReader(content);
        return _this;
    }
    CSVParser.prototype.Initialize = function (caller) {
        this.header = null;
        this.headermapping = null;
        this.done = false;
        this.cloud = new PointCloud();
        this.nbsteps = this.reader.CountAsciiOccurences(this.lineseparator);
        this.reader.Reset();
    };
    CSVParser.prototype.Iterate = function (step) {
        var line = this.ParseCurrentLine();
        if (line) {
            if (!this.header) {
                this.SetHeader(line);
            }
            else {
                var point = this.GetVector(line, ['x', 'y', 'z']);
                if (point) {
                    this.cloud.PushPoint(point);
                    var normal = this.GetVector(line, ['nx', 'ny', 'nz']);
                    if (normal) {
                        this.cloud.PushNormal(normal);
                    }
                }
            }
        }
        else {
            this.done = true;
        }
    };
    Object.defineProperty(CSVParser.prototype, "Done", {
        get: function () { return this.done; },
        enumerable: true,
        configurable: true
    });
    CSVParser.prototype.SetHeader = function (line) {
        this.header = {};
        for (var index = 0; index < line.length; index++) {
            var key = line[index];
            if (this.headermapping) {
                if (key in this.headermapping) {
                    key = this.headermapping[key];
                }
                else {
                    console.warn('Cannot map "' + key + '" to a valid data, given the specified CSV mapping');
                    key = null;
                }
            }
            if (key) {
                this.header[key] = index;
            }
        }
    };
    CSVParser.prototype.ParseCurrentLine = function () {
        if (this.reader.Eof()) {
            return null;
        }
        var line = this.reader.GetAsciiUntil([this.lineseparator]);
        if (line) {
            return line.split(this.separator);
        }
        return null;
    };
    CSVParser.prototype.GetVector = function (line, data) {
        var result = [];
        for (var index = 0; index < data.length; index++) {
            var key = data[index];
            if (key in this.header) {
                key = this.header[key];
                try {
                    var value = parseFloat(line[key]);
                    result.push(value);
                }
                catch (e) {
                    result = null;
                }
            }
            else {
                result = null;
            }
            if (!result) {
                return null;
            }
        }
        return new Vector(result);
    };
    return CSVParser;
}(IterativeLongProcess));
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
var FileLoader = /** @class */ (function () {
    function FileLoader() {
    }
    return FileLoader;
}());
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
            case 'ascii':
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
            case 'binary':
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
                var length = this.GetNextValue(reader, format, this.definition[index].params[0]);
                var values = new Array(length);
                for (var cursor = 0; cursor < length; cursor++) {
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
        if (format == 'ascii') {
            while (!reader.Eof() && reader.GetCurrentAsciiChar() == '\n') {
                reader.GetNextAsciiChar();
            }
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
var PlyLoader = /** @class */ (function () {
    function PlyLoader(content) {
        this.Load = function (onloaded) {
            function Error(message) {
                throw 'PLY ERROR : ' + message;
            }
            //Firt line shoul be 'PLY'
            if (this.reader.Eof() || this.reader.GetAsciiLine().toLowerCase() != 'ply') {
                Error('this is not a valid PLY file (line 1)');
            }
            //Second line indicates the PLY format
            if (!this.reader.Eof()) {
                var format = this.reader.GetAsciiLine().split(' ');
                if (format.length == 3 || format[0].toLowerCase() != 'format') {
                    format = format[1].toLowerCase();
                    if (format == 'binary_big_endian') {
                        format = 'binary';
                        this.reader.endianness = Endianness.BigEndian;
                    }
                    else if (format == 'binary_little_endian') {
                        format = 'binary';
                        this.reader.endianness = Endianness.LittleEndian;
                    }
                    else if (format != 'ascii') {
                        Error('unsuported PLY format "' + format + '" (line 2)');
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
                .SetNext(new Finalizer(this))
                .SetNext(function (f) { return onloaded(f.result); });
            loader.Start();
        };
        this.reader = new BinaryReader(content);
        this.elements = new PlyElements();
        this.result = null;
    }
    return PlyLoader;
}());
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
    };
    MeshBuilder.prototype.Iterate = function (step) {
        var face = this.faces.GetItem(step);
        this.result.PushFace(face.vertex_indices);
    };
    return MeshBuilder;
}(IterativeLongProcess));
//////////////////////////////////////////
//  Finalize the result
//////////////////////////////////////////
var Finalizer = /** @class */ (function (_super) {
    __extends(Finalizer, _super);
    function Finalizer(loader) {
        var _this = _super.call(this) || this;
        _this.loader = loader;
        return _this;
    }
    Finalizer.prototype.Initialize = function (caller) {
        this.result = caller.result;
    };
    Finalizer.prototype.Run = function (ondone) {
        this.loader.result = this.result;
        if (this.result instanceof Mesh) {
            this.result.ComputeNormals(function (m) {
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
var DataHandler = /** @class */ (function (_super) {
    __extends(DataHandler, _super);
    function DataHandler(scene, ownerView) {
        var _this = _super.call(this, 'DataWindow', HandlePosition.Right) || this;
        _this.scene = scene;
        _this.ownerView = ownerView;
        //Data visualization
        _this.dataArea = new Pannel('DataArea');
        _this.AddControl(_this.dataArea);
        //Properties visualization
        _this.propertiesArea = new Pannel('PropertiesArea');
        _this.AddControl(_this.propertiesArea);
        _this.RefreshContent();
        return _this;
    }
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
        if (this.currentItem != null) {
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
    DataHandler.prototype.AddCreatedObject = function (scene, createdObject) {
        if (createdObject) {
            //If the object does not have an owner, affect one
            if (!createdObject.owner) {
                var owner = (createdObject instanceof Light) ? scene.Lights : scene.Contents;
                if (this.currentItem && this.currentItem instanceof CADGroup) {
                    owner = this.currentItem;
                }
                owner.Add(createdObject);
            }
            //Select the new item, and make it the current active object
            scene.Select(createdObject);
            this.currentItem = createdObject;
            this.NotifyChange();
        }
    };
    DataHandler.prototype.NotifyChange = function () {
        this.ownerView.Refresh();
    };
    DataHandler.prototype.GetSceneRenderer = function () {
        return this.ownerView.sceneRenderer;
    };
    //Refresh content of data and properties views
    DataHandler.prototype.RefreshContent = function () {
        this.RefreshData();
        this.RefreshProperties();
    };
    DataHandler.prototype.RefreshData = function () {
        this.dataArea.Clear();
        var item = new DataItem(this.scene, this, this.scene);
        this.dataArea.GetElement().appendChild(item.GetContainerElement());
    };
    DataHandler.prototype.RefreshProperties = function () {
        this.HandlePropertiesWindowVisibility();
        this.propertiesArea.Clear();
        if (this.currentItem != null) {
            var currentProperties = this.currentItem.GetProperties();
            var self_2 = this;
            currentProperties.onChange = function () { return self_2.NotifyChange(); };
            this.propertiesArea.AddControl(currentProperties);
        }
    };
    return DataHandler;
}(HideablePannel));
var Interface = /** @class */ (function () {
    function Interface(scene) {
        var appInterface = this;
        this.InitializeDataHandler(scene);
        this.InitializeMenu();
        this.InitializeRenderers(scene);
        window.onresize = function () {
            appInterface.Refresh();
        };
        this.Refresh();
    }
    Interface.prototype.InitializeDataHandler = function (scene) {
        var self = this;
        this.dataHandler = new DataHandler(scene, this);
        document.body.appendChild(self.dataHandler.GetElement());
    };
    Interface.prototype.InitializeMenu = function () {
        var self = this;
        this.menu = new Menu(this);
        document.body.appendChild(self.menu.GetElement());
    };
    Interface.prototype.InitializeRenderers = function (scene) {
        //Create the scene rendering component
        this.sceneRenderer = new Renderer('SceneRendering');
        document.body.appendChild(this.sceneRenderer.GetElement());
        //Create the coordinates axes to be rendered
        this.coordinatesSystem = new CoordinatesSystem(this);
        document.body.appendChild(this.coordinatesSystem.GetElement());
        //Create the default controler (camera controler)
        this.currentControler = new CameraControler(this, scene);
        this.sceneRenderer.Draw(scene);
        this.coordinatesSystem.Refresh();
    };
    Interface.prototype.UpdateSelectedElement = function (selectedItem) {
        this.dataHandler.currentItem = selectedItem;
        this.Refresh();
    };
    Interface.prototype.Refresh = function () {
        this.dataHandler.Resize(window.innerWidth, window.innerHeight);
        this.dataHandler.RefreshContent();
        this.menu.RefreshSize();
        this.RefreshRendering();
    };
    Interface.prototype.TemporaryHideHideables = function () {
        this.dataHandler.TemporaryHide();
        this.menu.TemporaryHide();
    };
    Interface.prototype.RestoreHideables = function () {
        this.dataHandler.RestoreVisibility();
        this.menu.RestoreVisibility();
    };
    Interface.prototype.RefreshRendering = function () {
        this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
        this.sceneRenderer.Draw(this.dataHandler.scene);
        this.coordinatesSystem.Refresh();
    };
    Interface.prototype.UseCameraControler = function () {
        this.currentControler = new CameraControler(this, this.dataHandler.scene);
    };
    Interface.prototype.UseTransformationControler = function () {
        this.currentControler = new TransformControler(this, this.dataHandler.scene);
    };
    Interface.prototype.UseLightControler = function () {
        this.currentControler = new LightControler(this);
    };
    return Interface;
}());
var Menu = /** @class */ (function (_super) {
    __extends(Menu, _super);
    function Menu(ownerView) {
        var _this = _super.call(this, 'MenuToolbar', HandlePosition.Bottom) || this;
        _this.ownerView = ownerView;
        _this.toolbar = new Toolbar();
        _this.container.AddControl(_this.toolbar);
        var dataHandler = ownerView.dataHandler;
        var scene = dataHandler.scene;
        _this.toolbar.AddControl(new FileOpener('[Icon:file-o] Open', function (createdObject) {
            if (createdObject != null) {
                scene.Contents.Add(createdObject);
                scene.Select(createdObject);
                dataHandler.currentItem = createdObject;
                dataHandler.NotifyChange();
            }
        }, 'Load data from a file'));
        var center = new CenterCameraAction(scene, ownerView);
        _this.toolbar.AddControl(new Button('[Icon:video-camera] Center', function () {
            center.Run();
        }, center.hintMessage));
        _this.toolbar.AddControl(new SelectDrop('[Icon:desktop] Mode', [
            new CameraModeAction(ownerView),
            new TransformModeAction(ownerView),
            new LightModeAction(ownerView)
        ], 0, 'Change the current working mode (changes the mouse input '));
        _this.toolbar.AddControl(new Button('[Icon:question-circle] Help', function () {
            window.open('help.html', '_blank');
        }));
        return _this;
    }
    Menu.prototype.Clear = function () {
        this.toolbar.Clear();
    };
    return Menu;
}(HideablePannel));
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
var FileOpener = /** @class */ (function () {
    function FileOpener(label, filehandler, hintMessage) {
        this.label = label;
        this.filehandler = filehandler;
        this.hintMessage = hintMessage;
    }
    FileOpener.prototype.LoadFile = function (file) {
        if (file) {
            var self_3 = this;
            var progress_1 = new ProgressBar();
            var reader = new FileReader();
            reader.onloadend = function () {
                progress_1.Delete();
                self_3.LoadFromContent(file.name, this.result);
            };
            reader.onprogress = function (event) {
                progress_1.Update(event.loaded, event.total);
            };
            progress_1.Show();
            progress_1.SetMessage('Loading file : ' + file.name);
            reader.readAsArrayBuffer(file);
        }
    };
    FileOpener.prototype.LoadFromContent = function (fileName, fileContent) {
        var extension = fileName.split('.').pop();
        var loader = null;
        switch (extension) {
            case 'ply':
                if (fileContent) {
                    loader = new PlyLoader(fileContent);
                }
                break;
            case 'csv':
                if (fileContent) {
                    loader = new CsvLoader(fileContent);
                }
                break;
            default:
                alert('The file extension \"' + extension + '\" is not handled.');
                break;
        }
        if (loader) {
            var self_4 = this;
            loader.Load(function () { return self_4.filehandler(loader.result); });
        }
    };
    FileOpener.prototype.GetElement = function () {
        var self = this;
        var input = document.createElement('input');
        input.type = 'File';
        input.className = 'FileOpener';
        input.multiple = false;
        input.onchange = function () {
            self.LoadFile(input.files[0]);
        };
        var combo = new ComboBox(this.label, [
            new SimpleAction('PLY Mesh', function () {
                input.accept = '.ply';
                input.click();
            }, 'Load a mesh object from a PLY file. Find more about the ply file format on http://paulbourke.net/dataformats/ply/'),
            new SimpleAction('CSV Point cloud', function () {
                input.accept = '.csv';
                input.click();
            }, 'Load a point cloud from a CSV file (a semi-colon-separated line for each point). The CSV header is mandatory : "x", "y" and "z" specify the points coordinates, while "nx", "ny" and "nz" specify the normals coordinates.')
        ], this.hintMessage);
        var button = combo.GetElement();
        button.appendChild(input);
        return button;
    };
    return FileOpener;
}());
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
var ComboBox = /** @class */ (function () {
    function ComboBox(label, options, hintMessage) {
        var self = this;
        this.button = new Button(label, function () {
            Popup.CreatePopup(self.button, options);
        }, hintMessage);
    }
    ComboBox.prototype.GetElement = function () {
        return this.button.GetElement();
    };
    return ComboBox;
}());
var CoordinatesSystem = /** @class */ (function () {
    function CoordinatesSystem(view) {
        this.view = view;
        //Create the coordinates axes to be rendered
        var axes = [
            new Cylinder(new Vector([.5, .0, .0]), new Vector([1.0, .0, .0]), .1, 1.0),
            new Cylinder(new Vector([.0, .5, .0]), new Vector([.0, 1.0, .0]), .1, 1.0),
            new Cylinder(new Vector([.0, .0, .5]), new Vector([.0, .0, 1.0]), .1, 1.0)
        ];
        this.coordssystem = new Scene();
        for (var index_1 = 0; index_1 < axes.length; index_1++) {
            axes[index_1].material.baseColor = axes[index_1].axis.Flatten();
            this.coordssystem.Contents.Add(axes[index_1]);
        }
        //Refine lighting
        var light = this.coordssystem.Lights.children[0];
        this.coordssystem.Lights.Add(new Light(light.Position.Times(-1.0)));
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
    return CoordinatesSystem;
}());
var DataItem = /** @class */ (function () {
    function DataItem(item, dataHandler, scene) {
        this.item = item;
        this.dataHandler = dataHandler;
        this.scene = scene;
        this.container = document.createElement('div');
        this.container.className = 'TreeItemContainer';
        this.itemContentContainer = document.createElement('div');
        this.itemContentContainer.className = (this.item == this.dataHandler.currentItem) ? 'SelectedSceneItem' : 'SceneItem';
        this.container.appendChild(this.itemContentContainer);
        var itemIcon = document.createElement('i');
        if (this.item instanceof Scene) {
            itemIcon.className = 'ItemIcon fa fa-desktop';
        }
        else if (this.item instanceof CADGroup) {
            itemIcon.className = 'ItemIcon fa fa-folder' + (this.item.folded ? '' : '-open');
            itemIcon.onclick = this.ItemFolded();
            this.itemContentContainer.ondblclick = this.ItemFolded();
        }
        else if (this.item instanceof Light) {
            itemIcon.className = 'ItemIcon fa fa-lightbulb-o';
        }
        else {
            itemIcon.className = 'ItemIcon fa fa-cube';
        }
        this.itemContentContainer.appendChild(itemIcon);
        var visibilityIcon = document.createElement('i');
        visibilityIcon.className = 'ItemAction fa fa-eye' + (this.item.visible ? '' : '-slash');
        this.itemContentContainer.appendChild(visibilityIcon);
        var menuIcon = document.createElement('i');
        menuIcon.className = 'ItemAction fa fa-ellipsis-h';
        this.itemContentContainer.appendChild(menuIcon);
        var deletionIcon = null;
        if (this.item.deletable) {
            deletionIcon = document.createElement('i');
            deletionIcon.className = 'ItemAction fa fa-close';
            this.itemContentContainer.appendChild(deletionIcon);
        }
        var itemNameContainer = document.createElement('span');
        itemNameContainer.className = 'ItemNameContainer';
        var itemContent = document.createTextNode(this.item.name);
        itemNameContainer.appendChild(itemContent);
        this.itemContentContainer.appendChild(itemNameContainer);
        this.itemContentContainer.onclick = this.ItemClicked();
        this.itemContentContainer.oncontextmenu = this.ItemMenu();
        menuIcon.onclick = this.ItemMenu();
        visibilityIcon.onclick = this.ViewClicked();
        if (deletionIcon) {
            deletionIcon.onclick = this.DeletionClicked();
        }
        var children = this.item.GetChildren();
        for (var index = 0; index < children.length; index++) {
            var son = new DataItem(children[index], dataHandler, scene);
            this.container.appendChild(son.GetContainerElement());
        }
    }
    //CAD Group folding management - When clickin a group icon
    DataItem.prototype.ItemFolded = function () {
        var self = this;
        return function (event) {
            var group = self.item;
            group.folded = !group.folded;
            self.dataHandler.NotifyChange();
            self.CancelBubbling(event);
        };
    };
    //When left - clicking an item
    DataItem.prototype.ItemClicked = function () {
        var self = this;
        return function (event) {
            self.dataHandler.currentItem = self.item;
            self.scene.Select(self.item);
            self.dataHandler.NotifyChange();
            self.CancelBubbling(event);
        };
    };
    //When right - clicking an item
    DataItem.prototype.ItemMenu = function () {
        var self = this;
        return function (event) {
            var actions = self.item.GetActions(self.dataHandler, function (createdObject) {
                if (createdObject) {
                    self.dataHandler.AddCreatedObject(self.scene, createdObject);
                }
                else {
                    self.dataHandler.NotifyChange();
                }
                return true;
            });
            Popup.CreatePopup(self, actions);
            self.dataHandler.currentItem = self.item;
            self.scene.Select(self.item);
            self.dataHandler.NotifyChange();
            self.CancelBubbling(event);
            return false;
        };
    };
    //When clicking the visibility icon next to an item
    DataItem.prototype.ViewClicked = function () {
        var self = this;
        return function (event) {
            self.item.visible = !self.item.visible;
            self.dataHandler.NotifyChange();
        };
    };
    //When clickin the deletion icon next to an item
    DataItem.prototype.DeletionClicked = function () {
        var self = this;
        return function (event) {
            event = event || window.event;
            if (confirm('Are you sure you want to delete "' + self.item.name + '" ?')) {
                self.item.owner.Remove(self.item);
                self.dataHandler.currentItem = null;
                self.dataHandler.NotifyChange();
                self.CancelBubbling(event);
            }
        };
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
        return this.itemContentContainer;
    };
    DataItem.prototype.GetContainerElement = function () {
        return this.container;
    };
    return DataItem;
}());
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
var Hint = /** @class */ (function () {
    function Hint(owner, message) {
        this.owner = owner;
        this.container = document.createElement('div');
        this.container.className = 'Hint';
        this.container.appendChild(document.createTextNode(message));
        var element = this.owner.GetElement();
        var self = this;
        element.onmouseenter = function (ev) { self.Show(); };
        element.onmouseleave = function (ev) { self.Hide(); };
    }
    Hint.prototype.Show = function () {
        if (!this.container.parentElement) {
            document.body.appendChild(this.container);
        }
    };
    Hint.prototype.Hide = function () {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    };
    Hint.prototype.GetElement = function () {
        return this.container;
    };
    return Hint;
}());
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
var Popup = /** @class */ (function () {
    function Popup(owner, actions) {
        this.owner = owner;
        this.actions = actions;
        this.popupContainer = document.createElement('div');
        this.popupContainer.className = 'Popup';
        this.popupContainer.id = 'Popup';
        var rect = owner.GetElement().getBoundingClientRect();
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
            var itemLabel = document.createTextNode(action.label);
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
var ProgressBar = /** @class */ (function () {
    function ProgressBar() {
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
        this.lastupdate = null;
        this.refreshtime = 10;
        this.updatestep = 500;
    }
    ProgressBar.prototype.SetMessage = function (message) {
        this.message.innerHTML = '';
        this.message.appendChild(document.createTextNode(message));
    };
    ProgressBar.prototype.Show = function () {
        document.body.appendChild(this.control);
    };
    ProgressBar.prototype.Delete = function () {
        if (this.control.parentNode) {
            this.control.parentNode.removeChild(this.control);
        }
    };
    ProgressBar.prototype.Update = function (current, total) {
        var now = (new Date()).getTime();
        if (this.lastupdate == null || (now - this.lastupdate) > this.updatestep) {
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
var SelectDrop = /** @class */ (function () {
    function SelectDrop(label, options, selected, hintMessage) {
        var self = this;
        this.button = new Button(label, function () {
            var selectOptions = [];
            for (var index = 0; index < options.length; index++) {
                if (options[index].label !== self.button.GetLabel()) {
                    selectOptions.push(new SelectOption(self, options[index]));
                }
            }
            Popup.CreatePopup(self.button, selectOptions);
        }, hintMessage);
        this.SetCurrent(options[selected].label);
    }
    SelectDrop.prototype.GetElement = function () {
        return this.button.GetElement();
    };
    SelectDrop.prototype.SetCurrent = function (current) {
        this.button.SetLabel(current);
    };
    return SelectDrop;
}());
var SelectOption = /** @class */ (function (_super) {
    __extends(SelectOption, _super);
    function SelectOption(select, innerAction) {
        var _this = _super.call(this, innerAction.label, innerAction.hintMessage) || this;
        _this.select = select;
        _this.innerAction = innerAction;
        return _this;
    }
    SelectOption.prototype.Run = function () {
        this.select.SetCurrent(this.label);
        this.innerAction.Run();
    };
    SelectOption.prototype.Enabled = function () {
        return this.innerAction.Enabled();
    };
    return SelectOption;
}(Action));
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
var BooleanProperty = /** @class */ (function (_super) {
    __extends(BooleanProperty, _super);
    function BooleanProperty(name, value, handler) {
        var _this = _super.call(this, name, 'checkbox', value.toString(), handler) || this;
        _this.input.checked = value;
        return _this;
    }
    BooleanProperty.prototype.GetValue = function () {
        return this.input.checked;
    };
    return BooleanProperty;
}(PropertyWithValue));
var ColorProperty = /** @class */ (function (_super) {
    __extends(ColorProperty, _super);
    function ColorProperty(name, value, handler) {
        return _super.call(this, name, 'color', ColorProperty.RGBToStr(value), handler) || this;
    }
    ColorProperty.RGBToStr = function (rgb) {
        var result = '#' +
            StringUtils.LeftPad((rgb[0] * 255).toString(16), '0', 2) +
            StringUtils.LeftPad((rgb[1] * 255).toString(16), '0', 2) +
            StringUtils.LeftPad((rgb[2] * 255).toString(16), '0', 2);
        return result;
    };
    ColorProperty.StrToRGB = function (str) {
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
    ColorProperty.prototype.GetValue = function () {
        return ColorProperty.StrToRGB(this.input.value);
    };
    return ColorProperty;
}(PropertyWithValue));
var NumberInRangeProperty = /** @class */ (function (_super) {
    __extends(NumberInRangeProperty, _super);
    function NumberInRangeProperty(name, value, min, max, step, handler) {
        var _this = _super.call(this, name, 'range', value.toString(), handler) || this;
        _this.min = min;
        _this.max = max;
        _this.step = step;
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
var NumberProperty = /** @class */ (function (_super) {
    __extends(NumberProperty, _super);
    function NumberProperty(name, value, handler) {
        return _super.call(this, name, 'text', value.toString(), handler) || this;
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
var Properties = /** @class */ (function () {
    function Properties(properties) {
        if (properties === void 0) { properties = []; }
        this.properties = properties;
    }
    Properties.prototype.Push = function (property) {
        this.properties.push(property);
        property.owner = this;
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
        var table = document.createElement('table');
        table.className = 'Properties';
        for (var index = 0; index < this.properties.length; index++) {
            var property = this.properties[index];
            var row = document.createElement('tr');
            row.className = 'Property';
            table.appendChild(row);
            var leftCol = document.createElement('td');
            leftCol.className = 'PropertyName';
            var leftColContent = document.createTextNode(property.name);
            leftCol.appendChild(leftColContent);
            row.appendChild(leftCol);
            if (property instanceof PropertyGroup) {
                leftCol.colSpan = 2;
                var row_1 = document.createElement('tr');
                row_1.className = 'Property';
                table.appendChild(row_1);
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
        }
        return table;
    };
    return Properties;
}());
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
var PropertyWithValue = /** @class */ (function (_super) {
    __extends(PropertyWithValue, _super);
    function PropertyWithValue(name, inputType, value, changeHandler) {
        var _this = _super.call(this, name, changeHandler) || this;
        var self = _this;
        _this.container = document.createElement('div');
        _this.input = document.createElement('input');
        _this.input.type = inputType;
        _this.input.width = 20;
        _this.input.className = 'PropertyValue';
        _this.input.value = value;
        _this.input.onchange = function (ev) { return self.NotifyChange(); };
        _this.container.appendChild(_this.input);
        return _this;
    }
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
var VectorProperty = /** @class */ (function (_super) {
    __extends(VectorProperty, _super);
    function VectorProperty(name, vector, normalize, handler) {
        if (normalize === void 0) { normalize = false; }
        if (handler === void 0) { handler = null; }
        var _this = _super.call(this, name, null, handler) || this;
        _this.vector = vector;
        _this.normalize = normalize;
        var self = _this;
        _this.Add(new NumberProperty('X', vector.Get(0), function (x) { return self.UpdateValue(0, x); }));
        _this.Add(new NumberProperty('Y', vector.Get(1), function (y) { return self.UpdateValue(1, y); }));
        _this.Add(new NumberProperty('Z', vector.Get(2), function (z) { return self.UpdateValue(2, z); }));
        return _this;
    }
    VectorProperty.prototype.UpdateValue = function (index, value) {
        this.vector.Set(index, value);
        if (this.normalize) {
            this.vector.Normalize();
        }
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
        context.gl.uniformMatrix4fv(context.modelview, false, new Float32Array(modelview.values));
        //Projection
        var projection = this.GetProjectionMatrix();
        context.gl.uniformMatrix4fv(context.projection, false, new Float32Array(projection.values));
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
        p = Matrix.ToVector(rotation.Multiply(Matrix.FromPoint(p)));
        this.at = this.to.Plus(p);
        this.up = Matrix.ToVector(rotation.Multiply(Matrix.FromVector(this.up)));
    };
    Camera.prototype.Zoom = function (d) {
        this.Distance *= Math.pow(0.9, d);
    };
    Camera.prototype.ComputeProjection = function (v, applyViewPort) {
        var u;
        if (v.Dimension() == 3)
            u = new Matrix(1, 4, v.Flatten().concat([1.0]));
        else
            u = new Matrix(1, 4, v.Flatten());
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
var DrawingContext = /** @class */ (function () {
    function DrawingContext(renderingArea) {
        this.renderingArea = renderingArea;
        this.sampling = 30;
        this.rendering = new RenderingType();
        console.log('Initializing gl context');
        this.gl = (this.renderingArea.getContext("webgl") || this.renderingArea.getContext("experimental-webgl"));
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.useuint = this.gl.getExtension('OES_element_index_uint') ||
            this.gl.getExtension('MOZ_OES_element_index_uint') ||
            this.gl.getExtension('WEBKIT_OES_element_index_uint');
        console.log('Inititalizing gl sharders');
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
        console.log('   Inititalizing vertex positions attribute');
        this.vertices = this.gl.getAttribLocation(this.shaders, "VertexPosition");
        this.gl.enableVertexAttribArray(this.vertices);
        console.log('   Inititalizing normals attribute');
        this.normals = this.gl.getAttribLocation(this.shaders, "NormalVector");
        this.EnableNormals(true);
        console.log('   Inititalizing matrices');
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
    DrawingContext.prototype.GetIntType = function () {
        if (this.useuint) {
            return this.gl.UNSIGNED_INT;
        }
        return this.gl.UNSIGNED_SHORT;
    };
    DrawingContext.prototype.GetIntArray = function (content) {
        if (this.useuint) {
            return new Uint32Array(content);
        }
        return new Uint16Array(content);
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
        properties.Push(new ColorProperty('Color', self.baseColor, function (value) { return self.baseColor = value; }));
        properties.Push(new NumberInRangeProperty('Ambiant', self.ambiant * 100.0, 0, 100, 1, function (value) { return self.ambiant = value / 100.0; }));
        properties.Push(new NumberInRangeProperty('Diffuse', self.diffuse * 100.0, 0, 100, 1, function (value) { return self.diffuse = value / 100.0; }));
        properties.Push(new NumberInRangeProperty('Specular', self.specular * 100.0, 0, 100, 1, function (value) { return self.specular = value / 100.0; }));
        properties.Push(new NumberInRangeProperty('Glossy', self.glossy, 0, 100, 1, function (value) { return self.glossy = value; }));
        return properties;
    };
    return Material;
}());
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
                this.drawingcontext.gl.uniform3fv(this.drawingcontext.lightpositions[nbLights], new Float32Array(light.Position.coordinates));
                this.drawingcontext.gl.uniform3fv(this.drawingcontext.lightcolors[nbLights], new Float32Array(light.Color));
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
    Renderer.prototype.ScanFromCurrentViewPoint = function (group, hsampling, vsampling, resultHandler) {
        var scanner = new SceneScanner(this, group, hsampling, vsampling);
        scanner.SetNext(function (s) { return resultHandler(s.cloud); });
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
    Geometry.DegreeToRadian = function (a) {
        return Math.PI * a / 180.0;
    };
    Geometry.RadianToDegree = function (a) {
        return a / Math.PI * 180;
    };
    return Geometry;
}());
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
var Matrix = /** @class */ (function () {
    function Matrix(width, height, values) {
        this.width = width;
        this.height = height;
        this.values = new Array(values.length);
        for (var index = 0; index < values.length; index++) {
            this.values[index] = values[index];
        }
    }
    //Common matrix Builders
    Matrix.Null = function (width, height) {
        var values = new Array(width * height);
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
    Matrix.FromVector = function (v) {
        return new Matrix(1, v.Dimension() + 1, v.Flatten().concat(0));
    };
    Matrix.FromPoint = function (p) {
        return new Matrix(1, p.Dimension() + 1, p.Flatten().concat(1));
    };
    Matrix.ToVector = function (m) {
        var s = m.height - 1;
        var c = new Array(s);
        for (var index = 0; index < s; index++) {
            c[index] = m.GetValue(index, 0);
        }
        return new Vector(c);
    };
    Matrix.prototype.FlatIndex = function (row, col) {
        //Column-Major flat storage
        return row + col * this.width;
    };
    Matrix.prototype.SetValue = function (row, col, value) {
        this.values[this.FlatIndex(row, col)] = value;
    };
    Matrix.prototype.GetValue = function (row, col) {
        return this.values[this.FlatIndex(row, col)];
    };
    Matrix.prototype.Clone = function () {
        return new Matrix(this.width, this.height, this.values);
    };
    Matrix.prototype.Times = function (s) {
        var result = new Array(this.width * this.height);
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
var BoundingBox = /** @class */ (function () {
    function BoundingBox(min, max) {
        if (min === void 0) { min = null; }
        if (max === void 0) { max = null; }
        this.min = min;
        this.max = max;
    }
    BoundingBox.InititalizeGL = function (glContext) {
        if (this.pointsBuffer === null) {
            var points = [
                -0.5, -0.5, -0.5,
                -0.5, 0.5, -0.5,
                0.5, 0.5, -0.5,
                0.5, -0.5, -0.5,
                -0.5, -0.5, 0.5,
                -0.5, 0.5, 0.5,
                0.5, 0.5, 0.5,
                0.5, -0.5, 0.5
            ];
            var indices = [
                0, 1, 2, 3,
                4, 5, 6, 7,
                0, 4,
                1, 5,
                2, 6,
                3, 7
            ];
            this.drawnElements = [
                new GLBufferElement(0, 4, glContext.LINE_LOOP),
                new GLBufferElement(4, 4, glContext.LINE_LOOP),
                new GLBufferElement(8, 2, glContext.LINES),
                new GLBufferElement(10, 2, glContext.LINES),
                new GLBufferElement(12, 2, glContext.LINES),
                new GLBufferElement(14, 2, glContext.LINES)
            ];
            //Create webgl buffers
            this.pointsBuffer = glContext.createBuffer();
            glContext.bindBuffer(glContext.ARRAY_BUFFER, this.pointsBuffer);
            glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(points), glContext.STATIC_DRAW);
            //indices buffer
            this.indexBuffer = glContext.createBuffer();
            glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), glContext.STATIC_DRAW);
        }
    };
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
    BoundingBox.prototype.Draw = function (drawingContext) {
        if (this.IsValid()) {
            drawingContext.EnableNormals(false);
            BoundingBox.InititalizeGL(drawingContext.gl);
            var material = new Material([1.0, 1.0, 0.0]);
            material.InitializeLightingModel(drawingContext);
            var size = this.GetSize();
            var center = this.GetCenter();
            var shapetransform = Matrix.Identity(4);
            for (var index_2 = 0; index_2 < 3; index_2++) {
                shapetransform.SetValue(index_2, index_2, size.Get(index_2));
                shapetransform.SetValue(index_2, 3, center.Get(index_2));
            }
            drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));
            drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, BoundingBox.pointsBuffer);
            drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
            drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, BoundingBox.indexBuffer);
            var sizeOfUnisgnedShort = 2;
            for (var index = 0; index < BoundingBox.drawnElements.length; index++) {
                var element = BoundingBox.drawnElements[index];
                drawingContext.gl.drawElements(element.type, element.count, drawingContext.gl.UNSIGNED_SHORT, sizeOfUnisgnedShort * element.from);
            }
        }
    };
    BoundingBox.pointsBuffer = null;
    BoundingBox.indexBuffer = null;
    return BoundingBox;
}());
var GLBufferElement = /** @class */ (function () {
    function GLBufferElement(from, count, type) {
        this.from = from;
        this.count = count;
        this.type = type;
    }
    return GLBufferElement;
}());
var CADGroup = /** @class */ (function (_super) {
    __extends(CADGroup, _super);
    function CADGroup(name, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, name, owner) || this;
        _this.children = [];
        _this.folded = false;
        return _this;
    }
    CADGroup.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index].Draw(drawingContext);
            }
            if (this.selected) {
                var box = this.GetBoundingBox();
                box.Draw(drawingContext);
            }
        }
    };
    CADGroup.prototype.RayIntersection = function (ray) {
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
    CADGroup.prototype.Add = function (son) {
        if (son.owner) {
            son.owner.Remove(son);
        }
        son.owner = this;
        this.children.push(son);
    };
    CADGroup.prototype.Remove = function (son) {
        var position = -1;
        for (var index = 0; position < 0 && index < this.children.length; index++) {
            if (this.children[index] === son) {
                position = index;
            }
        }
        if (position >= 0) {
            son.owner = null;
            this.children.splice(position, 1);
        }
    };
    CADGroup.prototype.GetBoundingBox = function () {
        this.boundingbox = new BoundingBox();
        for (var index = 0; index < this.children.length; index++) {
            var bb = this.children[index].GetBoundingBox();
            if (bb.IsValid()) {
                this.boundingbox.Add(bb.min);
                this.boundingbox.Add(bb.max);
            }
        }
        return this.boundingbox;
    };
    CADGroup.prototype.Apply = function (proc) {
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
    CADGroup.prototype.GetChildren = function () {
        if (!this.folded) {
            return this.children;
        }
        return [];
    };
    CADGroup.prototype.GetActions = function (dataHandler, onDone) {
        var self = this;
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        if (this.folded) {
            result.push(new SimpleAction('Unfold', function () {
                self.folded = false;
                return onDone(null);
            }));
        }
        else {
            result.push(new SimpleAction('Fold', function () {
                self.folded = true;
                return onDone(null);
            }));
        }
        return result;
    };
    CADGroup.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        var children = new NumberProperty('Children', this.children.length, null);
        children.SetReadonly();
        properties.Push(children);
        return properties;
    };
    return CADGroup;
}(CADNode));
var CADNode = /** @class */ (function () {
    function CADNode(name, owner) {
        if (owner === void 0) { owner = null; }
        this.name = name;
        this.visible = true;
        this.selected = false;
        this.deletable = true;
        this.boundingbox = null;
        this.owner = null;
        if (owner) {
            owner.Add(this);
        }
    }
    CADNode.prototype.GetBoundingBox = function () {
        return this.boundingbox;
    };
    CADNode.prototype.GetProperties = function () {
        var self = this;
        var properties = new Properties();
        properties.Push(new StringProperty('Name', this.name, function (newName) { return self.name = newName; }));
        properties.Push(new BooleanProperty('Visible', this.visible, function (newVilibility) { return self.visible = newVilibility; }));
        return properties;
    };
    CADNode.prototype.GetActions = function (dataHandler, onDone) {
        var self = this;
        var result = [];
        if (this.deletable) {
            result.push(new SimpleAction('Remove', function () { self.owner.Remove(self); return onDone(null); }));
        }
        if (this.visible) {
            result.push(new SimpleAction('Hide', function () { self.visible = false; return onDone(null); }));
        }
        else {
            result.push(new SimpleAction('Show', function () { self.visible = true; return onDone(null); }));
        }
        return result;
    };
    CADNode.prototype.GetChildren = function () {
        return [];
    };
    CADNode.prototype.Apply = function (proc) {
        return proc(this);
    };
    return CADNode;
}());
var CADPrimitive = /** @class */ (function (_super) {
    __extends(CADPrimitive, _super);
    function CADPrimitive(name, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, name, owner) || this;
        _this.name = name;
        _this.material = new Material([0.0, 1.0, 0.0]);
        return _this;
    }
    CADPrimitive.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        properties.Push(new PropertyGroup('Material', this.material.GetProperties()));
        return properties;
    };
    return CADPrimitive;
}(CADNode));
var CADPrimitivesContainer = /** @class */ (function (_super) {
    __extends(CADPrimitivesContainer, _super);
    function CADPrimitivesContainer(name, owner) {
        if (owner === void 0) { owner = null; }
        return _super.call(this, name || NameProvider.GetName('Group'), owner) || this;
    }
    CADPrimitivesContainer.prototype.GetActions = function (dataHandler, onDone) {
        var self = this;
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        result.push(new SimpleAction('New group', function () { return onDone(new CADPrimitivesContainer(NameProvider.GetName('Group'), self)); }, 'A group is a hiearchical item that can be used to organize objects.'));
        result.push(new SimpleAction('New plane', this.GetShapeCreator(function () { return new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, self); }, dataHandler, onDone)));
        result.push(new SimpleAction('New sphere', this.GetShapeCreator(function () { return new Sphere(new Vector([0, 0, 0]), 1, self); }, dataHandler, onDone)));
        result.push(new SimpleAction('New cylinder', this.GetShapeCreator(function () { return new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1, self); }, dataHandler, onDone)));
        result.push(new SimpleAction('New cone', this.GetShapeCreator(function () { return new Cone(new Vector([0, 0, 0]), new Vector([0, 0, 1]), Math.PI / 6.0, 1, self); }, dataHandler, onDone)));
        result.push(new SimpleAction('New torus', this.GetShapeCreator(function () { return new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1, self); }, dataHandler, onDone)));
        result.push(new ScanFromCurrentViewPointAction(this, dataHandler, onDone));
        return result;
    };
    CADPrimitivesContainer.prototype.GetShapeCreator = function (creator, dataHandler, onDone) {
        return function () {
            var shape = creator();
            shape.PrepareForDrawing(dataHandler.GetSceneRenderer().drawingcontext);
            onDone(shape);
        };
    };
    CADPrimitivesContainer.prototype.IsScannable = function () {
        return !this.Apply(function (p) { return !(p instanceof Shape || p instanceof Mesh); });
    };
    return CADPrimitivesContainer;
}(CADGroup));
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
var Light = /** @class */ (function (_super) {
    __extends(Light, _super);
    function Light(center, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName("Light"), owner) || this;
        _this.sphere = new Sphere(center, 0.01);
        _this.sphere.material.baseColor = [1.0, 1.0, 1.0];
        return _this;
    }
    Object.defineProperty(Light.prototype, "Position", {
        get: function () {
            return this.sphere.center;
        },
        set: function (p) {
            this.sphere.center = p;
            this.sphere.Invalidate();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Light.prototype, "Color", {
        get: function () {
            return this.sphere.material.baseColor;
        },
        set: function (c) {
            this.sphere.material.baseColor = c;
        },
        enumerable: true,
        configurable: true
    });
    Light.prototype.Draw = function (drawingContext) {
        this.sphere.Draw(drawingContext);
    };
    Light.prototype.RayIntersection = function (ray) {
        return this.sphere.RayIntersection(ray);
    };
    Light.prototype.GetProperties = function () {
        var self = this;
        var properties = _super.prototype.GetProperties.call(this);
        properties.Push(new VectorProperty('Position', this.Position, false, function (newPosition) { return self.Position = newPosition; }));
        properties.Push(new ColorProperty('Color', this.Color, function (newColor) { return self.Color = newColor; }));
        return properties;
    };
    return Light;
}(CADNode));
var LightsContainer = /** @class */ (function (_super) {
    __extends(LightsContainer, _super);
    function LightsContainer(name, owner) {
        if (owner === void 0) { owner = null; }
        return _super.call(this, name || NameProvider.GetName('Lights'), owner) || this;
    }
    LightsContainer.prototype.GetActions = function (dataHandler, onDone) {
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        result.push(new NewLightAction(this, onDone));
        return result;
    };
    return LightsContainer;
}(CADGroup));
var NewLightAction = /** @class */ (function (_super) {
    __extends(NewLightAction, _super);
    function NewLightAction(container, onDone) {
        var _this = _super.call(this, 'New light', 'Add up to ' + DrawingContext.NbMaxLights + ' light sources') || this;
        _this.container = container;
        _this.onDone = onDone;
        return _this;
    }
    NewLightAction.prototype.Run = function () {
        this.onDone(new Light(new Vector([100.0, 100.0, 100.0]), this.container));
    };
    NewLightAction.prototype.Enabled = function () {
        return this.container.children.length < DrawingContext.NbMaxLights;
    };
    return NewLightAction;
}(Action));
//import './meshface.ts';
var Mesh = /** @class */ (function (_super) {
    __extends(Mesh, _super);
    function Mesh(pointcloud) {
        var _this = _super.call(this, NameProvider.GetName('Mesh')) || this;
        _this.pointcloud = pointcloud;
        _this.faces = [];
        _this.size = 0;
        return _this;
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
        if (!this.octree) {
            var self_5 = this;
            self_5.octree = new Octree(this);
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
            var ncomputer = new MeshProcessing.NormalsComputer(this);
            ncomputer.SetNext(function () { if (onDone)
                onDone(_this); });
            ncomputer.Start();
        }
    };
    Mesh.prototype.GetBoundingBox = function () {
        return this.pointcloud.GetBoundingBox();
    };
    Mesh.prototype.PrepareRendering = function (drawingContext) {
        this.pointcloud.PrepareRendering(drawingContext);
        if (!this.glIndexBuffer) {
            this.glIndexBuffer = drawingContext.gl.createBuffer();
            drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
            drawingContext.gl.bufferData(drawingContext.gl.ELEMENT_ARRAY_BUFFER, drawingContext.GetIntArray(this.faces), drawingContext.gl.STATIC_DRAW);
        }
        drawingContext.gl.bindBuffer(drawingContext.gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
    };
    Mesh.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            this.material.InitializeLightingModel(drawingContext);
            this.PrepareRendering(drawingContext);
            //Points-based rendering
            if (drawingContext.rendering.Point()) {
                this.pointcloud.Draw(drawingContext);
            }
            //Surface rendering
            if (drawingContext.rendering.Surface()) {
                drawingContext.gl.drawElements(drawingContext.gl.TRIANGLES, this.size, drawingContext.GetIntType(), 0);
            }
            //Wire rendering
            if (drawingContext.rendering.Wire()) {
                drawingContext.gl.drawElements(drawingContext.gl.LINES, this.size, drawingContext.GetIntType(), 0);
            }
            if (this.selected) {
                this.GetBoundingBox().Draw(drawingContext);
            }
        }
    };
    Mesh.prototype.RayIntersection = function (ray) {
        if (this.octree) {
            return this.octree.RayIntersection(ray);
        }
        var result = new Picking(this);
        for (var ii = 0; ii < this.Size(); ii++) {
            var tt = this.GetFace(ii).LineFaceIntersection(ray);
            if (tt !== null) {
                result.Add(tt);
            }
        }
        return result;
    };
    Mesh.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        var points = new NumberProperty('Points', this.pointcloud.Size(), null);
        points.SetReadonly();
        var faces = new NumberProperty('Faces', this.Size(), null);
        faces.SetReadonly();
        properties.Push(points);
        properties.Push(faces);
        return properties;
    };
    return Mesh;
}(CADPrimitive));
var MeshProcessing;
(function (MeshProcessing) {
    var NormalsComputer = /** @class */ (function (_super) {
        __extends(NormalsComputer, _super);
        function NormalsComputer(mesh) {
            var _this = _super.call(this, mesh.Size(), 'Computing normals') || this;
            _this.mesh = mesh;
            return _this;
        }
        NormalsComputer.prototype.Initialize = function () {
            this.normals = new Array(this.mesh.pointcloud.Size());
            for (var index = 0; index < this.normals.length; index++) {
                this.normals[index] = new Vector([0, 0, 0]);
            }
        };
        NormalsComputer.prototype.Iterate = function (step) {
            var face = this.mesh.GetFace(step);
            for (var index = 0; index < face.indices.length; index++) {
                var nindex = face.indices[index];
                this.normals[nindex] = this.normals[nindex].Plus(face.Normal);
            }
        };
        NormalsComputer.prototype.Finalize = function () {
            var cloud = this.mesh.pointcloud;
            cloud.ClearNormals();
            var nbPoints = cloud.Size();
            for (var index = 0; index < nbPoints; index++) {
                cloud.PushNormal(this.normals[index].Normalized());
            }
        };
        return NormalsComputer;
    }(IterativeLongProcess));
    MeshProcessing.NormalsComputer = NormalsComputer;
    ;
})(MeshProcessing || (MeshProcessing = {}));
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
        //Check the point is inside the triangle
        for (var ii = 0; ii < 3; ii++) {
            var test = point.Minus(this.points[ii]).Cross(this.points[(ii + 1) % 3].Minus(this.points[ii]));
            if (test.Dot(this.Normal) > 0) {
                return null;
            }
        }
        return tt;
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
    return MeshFace;
}());
var Neighbourhood = /** @class */ (function () {
    function Neighbourhood() {
    }
    Neighbourhood.prototype.Initialize = function (cloud, queryPoint) {
        this.cloud = cloud;
        this.queryPoint = queryPoint;
        this.neighbours = [];
    };
    Neighbourhood.prototype.GetPointData = function (pointIndex) {
        var distance = this.queryPoint.Minus(this.cloud.GetPoint(pointIndex)).SqrNorm();
        return new Neighbour(distance, pointIndex);
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
    function Neighbour(distance, index) {
        this.distance = distance;
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
        while (cursor > 0 && data.distance < this.neighbours[cursor - 1].distance) {
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
        return this.neighbours[this.neighbours.length - 1].distance;
    };
    return KNearestNeighbours;
}(Neighbourhood));
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
    Octree.prototype.RayIntersection = function (ray) {
        var result = new Picking(this.mesh);
        if (this.root) {
            this.root.RayIntersection(ray, result);
        }
        return result;
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
            for (var index_3 = 0; index_3 < size; index_3++) {
                candidates[index_3] = index_3;
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
                for (var index_4 = 0; index_4 < nbsons; index_4++) {
                    this.sons[index_4].RayIntersection(ray, result);
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
    return OctreeCell;
}());
var PointCloud = /** @class */ (function (_super) {
    __extends(PointCloud, _super);
    function PointCloud() {
        var _this = _super.call(this, NameProvider.GetName('PointCloud')) || this;
        _this.tree = null;
        _this.KNearestNeighbours = function (queryPoint, k) {
            if (!this.tree) {
                console.log('Computing KD-Tree for point cloud "' + this.name + '"');
                this.tree = new KDTree(this);
            }
            var knn = new KNearestNeighbours(k);
            this.tree.FindNearestNeighbours(queryPoint, knn);
            return knn.Neighbours();
        };
        _this.points = [];
        _this.pointssize = 0;
        _this.normals = [];
        _this.normalssize = 0;
        _this.boundingbox = new BoundingBox();
        _this.glPointsBuffer = null;
        _this.glNormalsBuffer = null;
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
        var points = new Array(3 * capacity);
        for (var index = 0; index < this.pointssize; index++) {
            points[index] = this.points[index];
        }
        this.points = points;
        var normals = new Array(3 * capacity);
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
    PointCloud.prototype.GetPointCoordinate = function (i, j) {
        return this.points[3 * i + j];
    };
    PointCloud.prototype.Size = function () {
        return this.pointssize / 3;
    };
    PointCloud.prototype.PushNormal = function (n) {
        if (this.normalssize + n.Dimension() > this.normals.length) {
            //Not optimal (Reserve should be called before callin PushPoint)
            this.Reserve(this.normals.length + n.Dimension());
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
    PointCloud.prototype.PrepareRendering = function (drawingContext) {
        var shapetransform = Matrix.Identity(4);
        drawingContext.gl.uniformMatrix4fv(drawingContext.shapetransform, false, new Float32Array(shapetransform.values));
        if (!this.glPointsBuffer) {
            this.glPointsBuffer = drawingContext.gl.createBuffer();
            drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
            drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.points), drawingContext.gl.STATIC_DRAW);
        }
        drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glPointsBuffer);
        drawingContext.gl.vertexAttribPointer(drawingContext.vertices, 3, drawingContext.gl.FLOAT, false, 0, 0);
        if (this.HasNormals()) {
            drawingContext.EnableNormals(true);
            if (!this.glNormalsBuffer) {
                this.glNormalsBuffer = drawingContext.gl.createBuffer();
                drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glNormalsBuffer);
                drawingContext.gl.bufferData(drawingContext.gl.ARRAY_BUFFER, new Float32Array(this.normals), drawingContext.gl.STATIC_DRAW);
            }
            drawingContext.gl.bindBuffer(drawingContext.gl.ARRAY_BUFFER, this.glNormalsBuffer);
            drawingContext.gl.vertexAttribPointer(drawingContext.normals, 3, drawingContext.gl.FLOAT, false, 0, 0);
        }
        else {
            drawingContext.EnableNormals(false);
        }
    };
    PointCloud.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            this.material.InitializeLightingModel(drawingContext);
            this.PrepareRendering(drawingContext);
            drawingContext.gl.drawArrays(drawingContext.gl.POINTS, 0, this.Size());
            if (this.selected && this.pointssize > 0) {
                this.boundingbox.Draw(drawingContext);
            }
        }
    };
    PointCloud.prototype.RayIntersection = function (ray) {
        return new Picking(this);
    };
    PointCloud.prototype.ComputeNormal = function (index, k) {
        //Get the K-nearest neighbours (including the query point)
        var point = this.GetPoint(index);
        var knn = this.KNearestNeighbours(point, k + 1);
        //Compute the covariance matrix
        var covariance = Matrix.Null(3, 3);
        var center = new Vector([0, 0, 0]);
        for (var ii = 0; ii < knn.length; ii++) {
            if (knn[ii].index != index) {
                center = center.Plus(this.GetPoint(knn[ii].index));
            }
        }
        center = center.Times(1 / (knn.length - 1));
        for (var kk = 0; kk < knn.length; kk++) {
            if (knn[kk].index != index) {
                var vec = this.GetPoint(knn[kk].index).Minus(center);
                for (var ii = 0; ii < 3; ii++) {
                    for (var jj = 0; jj < 3; jj++) {
                        covariance.SetValue(ii, jj, covariance.GetValue(ii, jj) + (vec.Get(ii) * vec.Get(jj)));
                    }
                }
            }
        }
        //The normal is the eigenvector having the smallest eigenvalue in the covariance matrix
        for (var ii = 0; ii < 3; ii++) {
            //Check no column is null in the covariance matrix
            if (covariance.GetColumnVector(ii).SqrNorm() <= 1.0e-12) {
                var result = new Vector([0, 0, 0]);
                result.Set(ii, 1);
                return result;
            }
        }
        var eigen = new EigenDecomposition(covariance);
        if (eigen) {
            return eigen[0].eigenVector.Normalized();
        }
        return null;
    };
    PointCloud.prototype.ComputeConnectedComponents = function (k, onDone) {
        k = k || 30;
        var builder = new PCDProcessing.ConnecterComponentsBuilder(this, k);
        builder.SetNext(function (b) { return onDone(b.result); });
        builder.Start();
    };
    PointCloud.prototype.ComputeNormals = function (k, ondone) {
        k = k || 30;
        var ncomputer = new PCDProcessing.NormalsComputer(this, k);
        var nharmonizer = new PCDProcessing.NormalsHarmonizer(this, k);
        ncomputer.SetNext(nharmonizer).SetNext(function () { return ondone(); });
        ncomputer.Start();
    };
    PointCloud.prototype.GaussianSphere = function () {
        var gsphere = new PointCloud();
        gsphere.Reserve(this.Size());
        for (var index = 0; index < this.Size(); index++) {
            gsphere.PushPoint(this.GetNormal(index));
        }
        return gsphere;
    };
    PointCloud.prototype.GetCSVData = function () {
        var result = 'x;y;z';
        if (this.HasNormals()) {
            result += ';nx;ny;nz';
        }
        result += '\n';
        for (var index = 0; index < this.Size(); index++) {
            var point = this.GetPoint(index);
            result += point.Get(0) + ';' +
                point.Get(1) + ';' +
                point.Get(2);
            if (this.HasNormals()) {
                var normal = this.GetNormal(index);
                result += ';' + normal.Get(0) + ';' +
                    normal.Get(1) + ';' +
                    normal.Get(2);
            }
            result += '\n';
        }
        return result;
    };
    PointCloud.prototype.GetActions = function (dataHandler, onDone) {
        var cloud = this;
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        if (this.HasNormals()) {
            result.push(new ClearNormalsAction(cloud, onDone));
        }
        else {
            result.push(new ComputeNormalsAction(cloud, onDone));
        }
        result.push(new GaussianSphereAction(cloud, onDone));
        result.push(null);
        if (cloud.ransac) {
            result.push(new ResetDetectionAction(cloud, onDone));
        }
        if (!(cloud.ransac && cloud.ransac.IsDone())) {
            result.push(new RansacDetectionAction(cloud, onDone));
        }
        result.push(new ConnectedComponentsAction(cloud, onDone));
        result.push(new ExportPointCloudFileAction(cloud, onDone));
        return result;
    };
    PointCloud.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        var points = new NumberProperty('Points', this.Size(), null);
        points.SetReadonly();
        properties.Push(points);
        return properties;
    };
    return PointCloud;
}(CADPrimitive));
var PCDProcessing;
(function (PCDProcessing) {
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
                this.cloud.normals = new Array(this.cloud.points.length);
            }
            this.cloud.ClearNormals();
        };
        NormalsComputer.prototype.Iterate = function (step) {
            var normal = this.cloud.ComputeNormal(step, this.k);
            this.cloud.PushNormal(normal);
        };
        return NormalsComputer;
    }(IterativeLongProcess));
    PCDProcessing.NormalsComputer = NormalsComputer;
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
    PCDProcessing.NormalsHarmonizer = NormalsHarmonizer;
    ;
    var ConnecterComponentsBuilder = /** @class */ (function (_super) {
        __extends(ConnecterComponentsBuilder, _super);
        function ConnecterComponentsBuilder(cloud, k) {
            var _this = _super.call(this, cloud, k, 'Computing connected components') || this;
            _this.result = new CADGroup(cloud.name + ' - ' + k + '-connected components');
            return _this;
        }
        ConnecterComponentsBuilder.prototype.ProcessPoint = function (cloud, index, knn, region) {
            if (region >= this.result.children.length)
                this.result.Add(new PointCloud());
            var component = this.result.children[region];
            component.PushPoint(cloud.GetPoint(index));
            if (cloud.HasNormals())
                component.PushNormal(cloud.GetNormal(index));
        };
        return ConnecterComponentsBuilder;
    }(RegionGrowthProcess));
    PCDProcessing.ConnecterComponentsBuilder = ConnecterComponentsBuilder;
})(PCDProcessing || (PCDProcessing = {}));
var Ransac = /** @class */ (function () {
    function Ransac(cloud, generators) {
        if (generators === void 0) { generators = null; }
        this.cloud = cloud;
        this.generators = generators;
        this.ComputeShapeScore = function (shape) {
            var score = {
                score: 0,
                points: []
            };
            for (var ii = 0; ii < this.cloud.Size(); ii++) {
                if (!this.ignore[ii]) {
                    var dist = shape.Distance(this.cloud.GetPoint(ii));
                    if (dist > this.noise) {
                        dist = this.noise;
                    }
                    else {
                        score.points.push(ii);
                    }
                    score.score += dist * dist;
                }
            }
            return score;
        };
        this.nbPoints = 3;
        this.nbFailure = 100;
        this.noise = 0.1;
        this.ignore = new Array(this.cloud.Size());
        for (var ii = 0; ii < this.cloud.Size(); ii++) {
            this.ignore[ii] = false;
        }
    }
    Ransac.prototype.SetGenerators = function (generators) {
        this.generators = generators;
    };
    Ransac.prototype.IsDone = function () {
        for (var ii = 0; ii < this.ignore.length; ii++) {
            if (!this.ignore[ii]) {
                return false;
            }
        }
        return true;
    };
    Ransac.prototype.FindBestFittingShape = function (onDone) {
        var step = new RansacStepProcessor(this);
        step.SetNext(function (s) { return onDone(s.best.shape); });
        step.Start();
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
                candidates.push(shape);
            }
        }
        //Compute scores and keep the best candidate
        var candidate = null;
        for (var ii = 0; ii < candidates.length; ii++) {
            var score = this.ComputeShapeScore(candidates[ii]);
            if (candidate == null || candidate.score > score.score) {
                candidate = {
                    score: score.score,
                    points: score.points,
                    shape: candidates[ii]
                };
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
        var result = new Sphere(center, radius);
        return result;
    };
    Ransac.RansacCylinder = function (points) {
        var r1 = new Ray(points[0].point, points[0].normal);
        var r2 = new Ray(points[1].point, points[1].normal);
        var center = Geometry.LinesIntersection(r1, r2);
        var axis = r1.dir.Cross(r2.dir);
        var radius = 0.5 * (r1.from.Minus(center).Norm() + r2.from.Minus(center).Norm());
        var result = new Cylinder(center, axis, radius, 1.0);
        return result;
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
    function Candidate(score, points, shape) {
        this.score = score;
        this.points = points;
        this.shape = shape;
    }
    return Candidate;
}());
var RansacStepProcessor = /** @class */ (function (_super) {
    __extends(RansacStepProcessor, _super);
    function RansacStepProcessor(ransac) {
        var _this = _super.call(this, 'Searching for a shape') || this;
        _this.ransac = ransac;
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
        this.best.shape.ComputeBounds(this.best.points, this.ransac.cloud);
        for (var index = 0; index < this.best.points.length; index++) {
            this.ransac.ignore[this.best.points[index]] = true;
        }
    };
    return RansacStepProcessor;
}(LongProcess));
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
        this.currentNeighborhood = this.cloud.KNearestNeighbours(this.cloud.GetPoint(this.currentIndex), this.k);
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
var Scene = /** @class */ (function (_super) {
    __extends(Scene, _super);
    function Scene() {
        var _this = _super.call(this, "Scene") || this;
        _this.deletable = false;
        _this.children = [null, null];
        _this.Contents = new CADPrimitivesContainer("Objects");
        _this.Contents.deletable = false;
        _this.Lights = new LightsContainer("Lights");
        _this.Lights.deletable = false;
        _this.Lights.visible = false;
        _this.Lights.folded = true;
        var defaultLight = new Light(new Vector([10.0, 10.0, 10.0]), _this.Lights);
        defaultLight.deletable = false;
        return _this;
    }
    Object.defineProperty(Scene.prototype, "Contents", {
        get: function () {
            return this.children[1];
        },
        set: function (c) {
            this.children[1] = c;
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
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.Select = function (item) {
        this.Contents.Apply(function (p) {
            p.selected = (p === item);
            return true;
        });
    };
    Scene.prototype.GetSelected = function () {
        var selected = [];
        this.Contents.Apply(function (p) {
            if (p.selected) {
                selected.push(p);
            }
            return true;
        });
        return selected;
    };
    Scene.prototype.GetSelectionBoundingBox = function () {
        var result = new BoundingBox();
        this.Contents.Apply(function (p) {
            if (p.selected) {
                result.AddBoundingBox(p.GetBoundingBox());
            }
            return true;
        });
        return result;
    };
    return Scene;
}(CADGroup));
var Cone = /** @class */ (function (_super) {
    __extends(Cone, _super);
    function Cone(apex, axis, angle, height, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Cone'), owner) || this;
        _this.apex = apex;
        _this.axis = axis;
        _this.angle = angle;
        _this.height = height;
        return _this;
    }
    Cone.prototype.GetGeometry = function () {
        var _this = this;
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Apex', this.apex, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', this.axis, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Angle', Geometry.RadianToDegree(this.angle), self.GeometryChangeHandler(function (value) { return _this.angle = Geometry.DegreeToRadian(value); })));
        geometry.Push(new NumberProperty('Height', this.height, self.GeometryChangeHandler(function (value) { return _this.height = value; })));
        return geometry;
    };
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
    Cone.prototype.Rotate = function (rotation) {
        var c = this.apex.Plus(this.axis.Times(this.height * 0.5));
        var a = rotation.Multiply(Matrix.FromVector(this.axis));
        this.axis = Matrix.ToVector(a);
        this.apex = c.Minus(this.axis.Times(this.height * 0.5));
        this.Invalidate();
    };
    Cone.prototype.Translate = function (translation) {
        this.apex = this.apex.Plus(translation);
        this.Invalidate();
    };
    Cone.prototype.Scale = function (scale) {
        this.height *= scale;
        this.Invalidate();
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
    Cone.prototype.ComputeMesh = function (sampling) {
        var points = new PointCloud();
        points.Reserve(1 + 3 * sampling);
        var xx = this.axis.GetOrthogonnal();
        var yy = this.axis.Cross(xx).Normalized();
        var radials = [];
        for (var ii = 0; ii < sampling; ii++) {
            var phi = 2.0 * ii * Math.PI / sampling;
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var radial = xx.Times(c).Plus(yy.Times(s));
            radials.push(radial.Times(this.angle));
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
        var self = this;
        mesh.ComputeNormals();
        return mesh;
    };
    Cone.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = Matrix.ToVector(worldToBase.Multiply(Matrix.FromPoint(ray.from)));
        var innerDir = Matrix.ToVector(worldToBase.Multiply(Matrix.FromVector(ray.dir)));
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
        var result = new Picking(this);
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
        return 0.0;
    };
    Cone.prototype.ComputeBounds = function (points, cloud) {
        var min = 0;
        var max = 0;
        for (var ii = 0; ii < points.length; ii++) {
            var d = cloud.GetPoint(points[ii]).Minus(this.apex).Dot(this.axis);
            if (ii == 0 || d > max) {
                max = d;
            }
        }
        this.height = max;
    };
    return Cone;
}(Shape));
var Cylinder = /** @class */ (function (_super) {
    __extends(Cylinder, _super);
    function Cylinder(center, axis, radius, height, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Cylinder'), owner) || this;
        _this.center = center;
        _this.axis = axis;
        _this.radius = radius;
        _this.height = height;
        return _this;
    }
    Cylinder.prototype.GetGeometry = function () {
        var _this = this;
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', this.center, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', this.axis, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Radius', this.radius, self.GeometryChangeHandler(function (value) { return _this.radius = value; })));
        geometry.Push(new NumberProperty('Height', this.height, self.GeometryChangeHandler(function (value) { return _this.height = value; })));
        return geometry;
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
    Cylinder.prototype.Rotate = function (rotation) {
        var a = rotation.Multiply(Matrix.FromVector(this.axis));
        this.axis = Matrix.ToVector(a);
        this.Invalidate();
    };
    Cylinder.prototype.Translate = function (translation) {
        this.center = this.center.Plus(translation);
        this.Invalidate();
    };
    Cylinder.prototype.Scale = function (scale) {
        this.radius *= scale;
        this.height *= scale;
        this.Invalidate();
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
    Cylinder.prototype.ComputeMesh = function (sampling) {
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
        var self = this;
        mesh.ComputeNormals();
        return mesh;
    };
    Cylinder.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
        var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
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
        var result = new Picking(this);
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
    Cylinder.prototype.ComputeBounds = function (points, cloud) {
        var min = 0;
        var max = 0;
        for (var ii = 0; ii < points.length; ii++) {
            var d_1 = cloud.GetPoint(points[ii]).Minus(this.center).Dot(this.axis);
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
    return Cylinder;
}(Shape));
var Plane = /** @class */ (function (_super) {
    __extends(Plane, _super);
    function Plane(center, normal, patchRadius, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Plane'), owner) || this;
        _this.center = center;
        _this.normal = normal;
        _this.patchRadius = patchRadius;
        return _this;
    }
    Plane.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', this.center, false, self.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Normal', this.normal, true, self.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Patch Radius', this.patchRadius, self.GeometryChangeHandler(function (value) { return self.patchRadius = value; })));
        return geometry;
    };
    Plane.prototype.ComputeMesh = function (sampling) {
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
        var self = this;
        mesh.ComputeNormals();
        return mesh;
    };
    Plane.prototype.Distance = function (point) {
        return Math.abs(point.Minus(this.center).Dot(this.normal));
    };
    Plane.prototype.Rotate = function (rotation) {
        var a = rotation.Multiply(Matrix.FromVector(this.normal));
        this.normal = Matrix.ToVector(a);
        this.Invalidate();
    };
    Plane.prototype.Translate = function (translation) {
        this.center = this.center.Plus(translation);
        this.Invalidate();
    };
    Plane.prototype.Scale = function (scale) {
        this.patchRadius *= scale;
        this.Invalidate();
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
    Plane.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
        var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
        //solve [t] : p[t].z = 0
        var result = new Picking(this);
        var tt = -innerFrom.GetValue(2, 0) / innerDir.GetValue(2, 0);
        var point = new Vector(innerFrom.values).Plus(new Vector(innerDir.values).Times(tt));
        if (point.Get(0) * point.Get(0) + point.Get(1) * point.Get(1) <= (this.patchRadius * this.patchRadius)) {
            result.Add(tt);
        }
        return result;
    };
    Plane.prototype.ComputeBounds = function (points, cloud) {
        this.center = new Vector([0, 0, 0]);
        for (var ii = 0; ii < points.length; ii++) {
            this.center = this.center.Plus(cloud.GetPoint(points[ii]));
        }
        this.center = this.center.Times(1.0 / points.length);
        this.patchRadius = 0;
        for (var ii = 0; ii < points.length; ii++) {
            var d = cloud.GetPoint(points[ii]).Minus(this.center).SqrNorm();
            if (d > this.patchRadius) {
                this.patchRadius = d;
            }
        }
        this.patchRadius = Math.sqrt(this.patchRadius);
    };
    return Plane;
}(Shape));
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape(name, owner) {
        var _this = _super.call(this, name, owner) || this;
        _this.mesh = null;
        return _this;
    }
    Shape.prototype.GetBoundingBox = function () {
        if (!this.boundingbox) {
            this.boundingbox = this.ComputeBoundingBox();
        }
        return this.boundingbox;
    };
    Shape.prototype.ComputeBounds = function (points, cloud) {
    };
    Shape.prototype.PrepareForDrawing = function (drawingContext) {
        if (!this.mesh) {
            this.mesh = this.ComputeMesh(drawingContext.sampling);
        }
    };
    Shape.prototype.Draw = function (drawingContext) {
        if (this.visible) {
            this.PrepareForDrawing(drawingContext);
            this.mesh.material = this.material;
            this.mesh.Draw(drawingContext);
            if (this.selected) {
                var box = this.GetBoundingBox();
                box.Draw(drawingContext);
            }
        }
    };
    Shape.prototype.GetProperties = function () {
        var properties = _super.prototype.GetProperties.call(this);
        properties.Push(new PropertyGroup('Geometry', this.GetGeometry()));
        return properties;
    };
    Shape.prototype.GetActions = function (dataHandler, onDone) {
        var result = _super.prototype.GetActions.call(this, dataHandler, onDone);
        result.push(null);
        result.push(new CreateShapeMeshAction(this, dataHandler, onDone));
        return result;
    };
    Shape.prototype.Invalidate = function () {
        this.mesh = null;
        this.boundingbox = null;
    };
    Shape.prototype.GeometryChangeHandler = function (update) {
        var self = this;
        return function (value) {
            if (update) {
                update(value);
            }
            self.Invalidate();
        };
    };
    return Shape;
}(CADPrimitive));
var CreateShapeMeshAction = /** @class */ (function (_super) {
    __extends(CreateShapeMeshAction, _super);
    function CreateShapeMeshAction(shape, dataHandler, onDone) {
        var _this = _super.call(this, 'Create shape mesh', 'Builds the mesh sampling this shape') || this;
        _this.shape = shape;
        _this.dataHandler = dataHandler;
        _this.onDone = onDone;
        return _this;
    }
    CreateShapeMeshAction.prototype.Enabled = function () {
        return true;
    };
    CreateShapeMeshAction.prototype.Run = function () {
        var self = this;
        var dialog = new Dialog(
        //Ok has been clicked
        function (properties) {
            return self.CreateMesh(properties);
        }, 
        //Cancel has been clicked
        function () { return true; });
        dialog.InsertValue('Sampling', this.dataHandler.GetSceneRenderer().drawingcontext.sampling);
    };
    CreateShapeMeshAction.prototype.CreateMesh = function (properties) {
        var sampling = parseInt(properties.GetValue('Sampling'));
        var mesh = this.shape.ComputeMesh(sampling);
        var self = this;
        mesh.ComputeOctree(function () { if (self.onDone) {
            self.onDone(mesh);
        } });
        return true;
    };
    return CreateShapeMeshAction;
}(Action));
var Sphere = /** @class */ (function (_super) {
    __extends(Sphere, _super);
    function Sphere(center, radius, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Sphere'), owner) || this;
        _this.center = center;
        _this.radius = radius;
        return _this;
    }
    Sphere.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', this.center, false, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Radius', this.radius, this.GeometryChangeHandler(function (value) { return self.radius = value; })));
        return geometry;
    };
    ;
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
    Sphere.prototype.ComputeMesh = function (sampling) {
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
        var self = this;
        mesh.ComputeNormals();
        return mesh;
    };
    Sphere.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFrom = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
        var innerDir = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
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
        var result = new Picking(this);
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
    Sphere.prototype.Rotate = function (rotation) {
    };
    Sphere.prototype.Translate = function (translation) {
        this.center = this.center.Plus(translation);
        this.Invalidate();
    };
    Sphere.prototype.Scale = function (scale) {
        this.radius *= scale;
        this.Invalidate();
    };
    return Sphere;
}(Shape));
var Torus = /** @class */ (function (_super) {
    __extends(Torus, _super);
    function Torus(center, axis, greatRadius, smallRadius, owner) {
        if (owner === void 0) { owner = null; }
        var _this = _super.call(this, NameProvider.GetName('Torus'), owner) || this;
        _this.center = center;
        _this.axis = axis;
        _this.greatRadius = greatRadius;
        _this.smallRadius = smallRadius;
        return _this;
    }
    Torus.prototype.GetGeometry = function () {
        var self = this;
        var geometry = new Properties();
        geometry.Push(new VectorProperty('Center', this.center, false, this.GeometryChangeHandler()));
        geometry.Push(new VectorProperty('Axis', this.axis, true, this.GeometryChangeHandler()));
        geometry.Push(new NumberProperty('Great Radius', this.greatRadius, this.GeometryChangeHandler(function (value) { return self.greatRadius = value; })));
        geometry.Push(new NumberProperty('Small Radius', this.smallRadius, this.GeometryChangeHandler(function (value) { return self.smallRadius = value; })));
        return geometry;
    };
    Torus.prototype.ComputeMesh = function (sampling) {
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
        var self = this;
        mesh.ComputeNormals();
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
    Torus.prototype.RayIntersection = function (ray) {
        var worldToBase = this.GetWorldToInnerBaseMatrix();
        var innerFromMatrix = worldToBase.Multiply(new Matrix(1, 4, ray.from.Flatten().concat([1])));
        var innerDirMatrix = worldToBase.Multiply(new Matrix(1, 4, ray.dir.Flatten().concat([0])));
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
        var result = new Picking(this);
        for (var index = 0; index < roots.length; index++) {
            result.Add(roots[index]);
        }
        return result;
    };
    Torus.prototype.Distance = function (point) {
        //TODO
        return 0;
    };
    Torus.prototype.Rotate = function (rotation) {
        var a = rotation.Multiply(Matrix.FromVector(this.axis));
        this.axis = Matrix.ToVector(a);
        this.Invalidate();
    };
    Torus.prototype.Translate = function (translation) {
        this.center = this.center.Plus(translation);
        this.Invalidate();
    };
    Torus.prototype.Scale = function (scale) {
        this.greatRadius *= scale;
        this.smallRadius *= scale;
        this.Invalidate();
    };
    return Torus;
}(Shape));
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
    function LongProcess(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    Object.defineProperty(LongProcess.prototype, "Done", {
        get: function () {
            return this.Target <= this.Current;
        },
        enumerable: true,
        configurable: true
    });
    LongProcess.prototype.Run = function (ondone) {
        var progress = null;
        if (this.message) {
            progress = new ProgressBar();
            progress.SetMessage(this.message);
            progress.Show();
        }
        var self = this;
        function RunInternal() {
            while (!self.Done) {
                self.Step();
                if (progress && progress.Update(self.Current, self.Target)) {
                    setTimeout(RunInternal, progress.refreshtime);
                    return false;
                }
            }
            if (progress) {
                progress.Delete();
            }
            if (ondone) {
                ondone();
            }
            return true;
        }
        if (progress) {
            setTimeout(RunInternal, progress.refreshtime);
        }
        else {
            RunInternal();
        }
    };
    return LongProcess;
}(Process));
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
    return StringUtils;
}());
//# sourceMappingURL=PointCloudLab.js.map