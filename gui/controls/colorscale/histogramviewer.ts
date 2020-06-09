/// <reference path="../control.ts" />
/// <reference path="../../objects/pclscalarfield.ts" />
/// <reference path="../../../model/histogram.ts" />


class HistogramViewer implements Control {
	canvas: HTMLCanvasElement;
	nbrequestedchunks: number;

	private static CollapsedClassName = 'Collapsed';

	constructor(private scalarfield: PCLScalarField, private color: ColorProvider = null) {
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'HistogramViewer';
		this.nbrequestedchunks = 30;

		let self = this;
		this.canvas.onwheel = (event: WheelEvent) => {
			self.nbrequestedchunks += event.deltaY > 0 ? -1 : 1;
			if (self.nbrequestedchunks < 1) {
				self.nbrequestedchunks = 1;
			}
			self.Refresh();
			event.stopPropagation();
		}

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
			ctx.fillRect(
				0,
				height * (1.0 - chunck.GetNormalizedEndingValue()),
				chunck.GetMaxNormalizedCount() * width,
				chunck.GetNormalizedWidth() * height
			);
		}
	}

	IsCollapsed() {
		return this.canvas.classList.contains(HistogramViewer.CollapsedClassName);
	}

	Collapse() {
		if (!this.IsCollapsed()) {
			this.canvas.classList.add(HistogramViewer.CollapsedClassName)
		}
	}

	Expand() {
		if (this.IsCollapsed()) {
			this.canvas.classList.remove(HistogramViewer.CollapsedClassName);
		}
	}

	GetElement(): HTMLElement {
		return this.canvas;
	}
}

interface ColorProvider {
	(v: number): string;
}