class AxisLabel implements Control {
	container: HTMLDivElement;
	depth: number;

	constructor(public label: string, public axis: Vector, private system: CoordinatesSystem) {
		let color = axis.Normalized().Times(160).Flatten();
		this.container = document.createElement('div');
		this.container.className = 'AxisLabel';
		this.container.style.color = 'rgb(' + color.join(',') + ')';
		this.container.appendChild(document.createTextNode(label));
		
		this.container.onclick = (event: MouseEvent) => {
			system.ChangeViewAxis(axis);
		}
	}

	GetElement(): HTMLElement {
		return this.container;
	}

	Refresh() {
		let camera = this.system.renderer.camera;
		let projection = camera.ComputeProjection(this.axis, true);
		let ownerRect = this.system.GetElement().getBoundingClientRect();
		this.container.style.left = (ownerRect.left + projection.Get(0)) + 'px';
		this.container.style.top = (ownerRect.bottom - projection.Get(1)) + 'px';
		this.depth = projection.Get(2);
	}

	UpdateDepth(axes: AxisLabel[]) {
		let order = 0;
		for (var index = 0; index < axes.length; index++) {
			if (this.depth < axes[index].depth) {
				order++;
			}
		}
		this.container.style.zIndex = '' + (2 + order);
	}
}