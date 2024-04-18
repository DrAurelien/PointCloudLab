/// <reference path="mousetracker.ts" />
/// <reference path="controler.ts" />
/// <reference path="cursor.ts" />


abstract class MouseControler implements Controler {
	protected mousetracker: MouseTracker;
	private targetElement: HTMLElement;
	private cursor: Cursor;

	constructor(protected target: Controlable) {
		this.targetElement = target.GetRengeringArea();
		this.cursor = new Cursor();

		let self = this;

		this.targetElement.oncontextmenu = function (event: Event) {
			event = event || window.event;
			event.preventDefault();
			return false;
		};

		this.targetElement.onmousedown = function (event: MouseEvent) {
			event = <MouseEvent>(event || window.event);
			self.Start(event);
		};

		this.targetElement.onmouseup = function (event: MouseEvent) {
			self.End();
		};

		this.targetElement.onmouseout = function (event: MouseEvent) {
			self.End();
		};

		this.targetElement.onmousemove = function (event: MouseEvent) {
			event = <MouseEvent>(event || window.event);

			if (self.mousetracker) {
				let delta = self.mousetracker.UpdatePosition(event);
				self.HandleMouseMove(delta);
				self.target.NotifyPendingControl();
			}
			return true;
		};

		this.targetElement.onwheel = function (event: WheelEvent) {
			event = <WheelEvent>(event || window.event);
			self.StartMouseEvent();
			self.HandleWheel(event.deltaY);
			self.EndMouseEvent();
		};

		document.onkeypress = function (event: KeyboardEvent) {
			event = <KeyboardEvent>(event || window.event);
			let key: number = event.key ? event.key.charCodeAt(0) : event.keyCode;
			self.HandleKey(key);
		};
	}

	private Start(event: MouseEvent) {
		this.mousetracker = new MouseTracker(event);

		this.target.NotifyControlStart();
		this.StartMouseEvent();
	}

	private End() {
		if (this.mousetracker != null && this.mousetracker.IsQuickEvent()) {
			this.HandleClick(this.mousetracker);
		}
		this.mousetracker = null;

		this.target.NotifyControlEnd();
		this.cursor.Restore(this.targetElement);
		this.EndMouseEvent();
	}

	protected abstract HandleMouseMove(displacement: MouseDisplacement): boolean;
	protected abstract HandleClick(tracker: MouseTracker): boolean;
	protected abstract HandleWheel(delta: number): boolean;
	protected HandleKey(key: number): boolean {
		let strkey = String.fromCharCode(key);
		switch (strkey) {
			case 'p':
				this.target.ToggleRendering(RenderingMode.Point);
				break;
			case 'w':
				this.target.ToggleRendering(RenderingMode.Wire);
				break;
			case 's':
				this.target.ToggleRendering(RenderingMode.Surface);
				break;
			default:
				this.target.HandleShortcut(strkey);
				break;
		}
		return true;
	}

	protected StartMouseEvent() {
	}

	protected EndMouseEvent() {
	}

	protected set Cursor(iconCode: string) {
		this.cursor.Icon = iconCode;
		this.cursor.Apply(this.targetElement);
	}

	GetSelectionColor(): number[] {
		return [1, 1, 0];
	}
}