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
//# sourceMappingURL=materials.js.map