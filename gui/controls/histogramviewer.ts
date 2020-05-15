/// <reference path="control.ts" />
/// <reference path="../../model/histogram.ts" />


class HistogramViewer implements Control {
	canvas: HTMLCanvasElement;
	nbrequestedchunks: number;

	expandedWidth: number;
	expandedHeight: number;

	constructor() {
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'HistogramViewer';
		this.nbrequestedchunks = 30;
		this.expandedWidth = this.canvas.clientWidth;
		this.expandedHeight = this.canvas.clientHeight;
	}

	Refresh(values: ArrayLike<number>) {
		let histogram = new Histogram(values, this.nbrequestedchunks);
		let ctx = this.canvas.getContext('2d');
		let width = this.canvas.width;
		let height = this.canvas.height;

		ctx.fillStyle = 'white';
		ctx.clearRect(0, 0, width, height);
		for (var index = 0; index < histogram.Size(); index++) {
			let chunck = histogram.GetChunk(index);

			//BottomtoTop
			ctx.fillRect(
				0,
				height * (1.0 - chunck.GetNormalizedEndingValue()),
				chunck.GetMaxNormalizedCount() * width,
				chunck.GetNormalizedWidth() * height
			);
		}

		ctx.fillRect(0, 0, 50, 50);
	}

	Resize(width: number, height: number) {
		this.expandedWidth = width;
		this.expandedHeight = height;
		if (!this.IsCollapsed()) {
			this.canvas.style.width = width + 'px';
			this.canvas.style.height = height + 'px';
		}
	}

	IsCollapsed() {
		return this.canvas.clientHeight === 0 || this.canvas.clientWidth === 0;
	}

	Collapse() {
		this.canvas.style.height = 0 + 'px';
		this.canvas.style.width = 0 + 'px';
	}

	Expand() {
		this.canvas.style.height = this.expandedHeight + 'px';
		this.canvas.style.width = this.expandedWidth + 'px';
	}

	GetElement(): HTMLElement {
		return this.canvas;
	}
}