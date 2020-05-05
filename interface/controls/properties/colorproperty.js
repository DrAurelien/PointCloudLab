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
//# sourceMappingURL=colorproperty.js.map