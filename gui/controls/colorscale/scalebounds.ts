/// <reference path="../control.ts" />
/// <reference path="../draggable.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
/// <reference path="../../../tools/stringutils.ts" />


class ColorScaleBoundsContainer implements Control {
	container: HTMLDivElement;
	lower: ColorScaleBound;
	upper: ColorScaleBound;

	constructor(public field: PCLScalarField) {
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

	GetHeight(): number {
		return this.container.getBoundingClientRect().height;
	}
}

interface ColorChangeHanlder {
	(c: number[]);
}

abstract class ColorScaleBound extends Draggable {
	container: HTMLDivElement;
	value: Text;
	color: HTMLInputElement;

	constructor(protected owner: ColorScaleBoundsContainer, onColorChange: ColorChangeHanlder) {
		super(DraggingType.Vertical);
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
		}

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

	SetValue(v: number, updatepos: boolean=true) {
		this.value.data = Number(v).toFixed(2);
		let min = this.owner.field.Min();
		let max = this.owner.field.Max();
		let ratio = (v - min) / (max - min);
		this.UpdatePosition(ratio);
	}

	protected abstract UpdatePosition(ratio);

	SetColor(color: number[]) {
		let colorStr = StringUtils.RGBfToStr(color);
		this.color.value = colorStr;
		this.UpdateColor();
	}

	private UpdateColor() {
		this.container.style.color = this.color.value;
	}
}

class ColorScaleLowerBound extends ColorScaleBound {
	constructor(owner: ColorScaleBoundsContainer, onColorChange: ColorChangeHanlder) {
		super(owner, onColorChange);
		this.container.classList.add('Lower');
	}

	Authorized(dx, dy): boolean {
		let top = parseInt(this.container.style.top, 10) + dy;
		let min = this.owner.GetHeight() - parseInt(this.owner.upper.container.style.bottom, 10);
		return min <= top && top <= this.owner.GetHeight();
	}

	protected UpdatePosition(ratio) {
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
	constructor(owner: ColorScaleBoundsContainer, onColorChange: ColorChangeHanlder) {
		super(owner, onColorChange);
		this.container.classList.add('Upper');
	}

	Authorized(dx, dy): boolean {
		let bottom = parseInt(this.container.style.bottom, 10) - dy;
		let min = this.owner.GetHeight() - parseInt(this.owner.lower.container.style.top, 10);
		return min <= bottom && bottom <= this.owner.GetHeight();
	}

	protected UpdatePosition(ratio) {
		this.container.style.bottom = (ratio* this.owner.GetHeight()) + 'px';
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