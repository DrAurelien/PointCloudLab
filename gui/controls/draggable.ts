enum DraggingType {
	Vertical	= 0x000001,
	Horizontal	= 0x000002,
	Both		= 0x000003
}


abstract class Draggable implements Control {
	private mousemovebackup: any;
	private mouseupbackup: any;
	private dragged: boolean;
	private tracker: MouseTracker;

	constructor(private draggingtype: DraggingType = DraggingType.Both) {
	}

	protected MakeDraggable() {
		let element = this.GetElement();
		let self = this;

		element.onmousedown = (event: MouseEvent) => {
			self.InitializeDragging(event);
		};
	}

	InitializeDragging(event: MouseEvent) {
		event = event || window.event as MouseEvent;
		this.tracker = new MouseTracker(event);
		this.dragged = false;

		let self = this;
		this.mousemovebackup = document.onmousemove;
		document.onmousemove = (event: MouseEvent) => {
			self.UpdateDragging(event);
		};

		this.mouseupbackup = document.onmouseup;
		document.onmouseup = (event: MouseEvent) => {
			self.Finalize(event);
		};
	}

	UpdateDragging(event: MouseEvent) {
		let element = this.GetElement();

		let delta = this.tracker.UpdatePosition(event);
		let dx = this.draggingtype & DraggingType.Horizontal ? delta.dx : 0;
		let dy = this.draggingtype & DraggingType.Vertical ? delta.dy : 0;

		if (this.Authorized(dx, dy)) {
			if (dx) {
				if (element.style.left) {
					element.style.left = this.GetModifiedPosition(element.style.left, dx);
				}
				else if (element.style.right) {
					element.style.right = this.GetModifiedPosition(element.style.right, -dx);
				}
				else {
					throw 'Dragging only applies to positioned elements';
				}
				this.dragged = true;
			}
			if (dy) {
				if (element.style.top) {
					element.style.top = this.GetModifiedPosition(element.style.top, dy);
				}
				else if (element.style.bottom) {
					element.style.bottom = this.GetModifiedPosition(element.style.bottom, -dy);
				}
				else {
					throw 'Dragging only applies to positioned elements';
				}
				this.dragged = true;
				this.OnMove();
			}
		}
	}

	protected GetModifiedPosition(pos: string, delta: number) {
		let value = parseInt(pos, 10);
		let suffix = pos.replace(value.toString(), '');
		let result = (value + delta) + suffix;
		return result;
	}

	Finalize(event: MouseEvent) {
		document.onmousemove = this.mousemovebackup;
		document.onmouseup = this.mouseupbackup;

		if (this.dragged) {
			this.OnDrop(event);
		}
		else {
			this.OnClick();
		}
	}

	abstract GetElement(): HTMLElement;
	protected abstract OnDrop(event: MouseEvent);

	OnClick() {
	}

	OnMove() {
	}

	protected Authorized(dx: number, dy: number): boolean {
		return true;
	}
}