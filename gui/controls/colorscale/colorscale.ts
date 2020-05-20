/// <reference path="scalebounds.ts" />
/// <reference path="scalerenderer.ts" />
/// <reference path="histogramviewer.ts" />
/// <reference path="../pannel.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />


class ColorScale extends Pannel {
	renderer: ColorScaleRenderer;
	bounds: ColorScaleBoundsContainer;
	histo: HistogramViewer;

	private static instance: ColorScale;
	private static showHisto: boolean = true;

	constructor(private field: PCLScalarField) {
		super('ColorScale');

		this.renderer = new ColorScaleRenderer();
		this.bounds = new ColorScaleBoundsContainer(this.field);
		this.histo = new HistogramViewer(this.field, (v) => self.GetColor(v));
		this.AddControl(this.bounds);
		this.AddControl(this.renderer);
		this.AddControl(this.histo);

		let self = this;
		this.renderer.GetElement().onclick = () => {
			self.histo.IsCollapsed() ? self.histo.Expand() : self.histo.Collapse();
		}
		this.histo.GetElement().onclick = () => {
			self.histo.Collapse();
		}
	}

	GetColor(value: number): string {
		let ratio = (value - this.field.Min()) / (this.field.Max() - this.field.Min());
		return this.renderer.GetColor(ratio);
	}

	static Show(field: PCLScalarField): ColorScale {
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
