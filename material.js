function Material(color)
{
	this.baseColor = color;
	this.diffuse = 1.0;
	this.ambiant = 1.0;
	this.specular = 1.0;
	this.glossy = 8.0;
}

Material.prototype.InitializeLightingModel = function(drawingContext)
{
	drawingContext.gl.uniform3fv(drawingContext.color, new Float32Array(this.baseColor));
	drawingContext.gl.uniform1f(drawingContext.diffuse, this.diffuse);
	drawingContext.gl.uniform1f(drawingContext.ambiant, this.ambiant);
	drawingContext.gl.uniform1f(drawingContext.specular, this.specular);
	drawingContext.gl.uniform1f(drawingContext.glossy, this.glossy);
}