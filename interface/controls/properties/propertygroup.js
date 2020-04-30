var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PropertyGroup = (function (_super) {
    __extends(PropertyGroup, _super);
    function PropertyGroup(name, properties, handler) {
        var _this = this;
        if (handler === void 0) { handler = null; }
        _super.call(this, name, handler);
        //Forward change notifications
        this.properties = properties || new Properties();
        this.properties.onChange = function () { return _this.NotifyChange(); };
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