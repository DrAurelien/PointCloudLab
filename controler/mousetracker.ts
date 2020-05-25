class MouseTracker {
	x: number;
	y: number;
	public button: number;
	date: Date;
	ctrlKey: boolean;
	private static quickeventdelay: number = 200;

	constructor(event: MouseEvent) {
		this.x = event.clientX;
		this.y = event.clientY;
		this.button = event.which;
		this.date = new Date();
		this.ctrlKey = event.ctrlKey;
	}

	IsQuickEvent(): boolean {
		var now = new Date();
		return (now.getTime() - this.date.getTime() < MouseTracker.quickeventdelay);
	}

	UpdatePosition(event: MouseEvent): MouseDisplacement {
		let delta = new MouseDisplacement(event.clientX - this.x, event.clientY - this.y, this.button);
		this.x = event.clientX;
		this.y = event.clientY;
		return delta;
	}
}

class MouseDisplacement {
	constructor(public dx: number, public dy: number, public button: number) {
	}

	IsNull(): boolean {
		return (this.dx == 0 && this.dy == 0);
	}
}