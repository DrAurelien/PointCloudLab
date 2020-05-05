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
//# sourceMappingURL=propertygroup.js.map