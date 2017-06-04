abstract class MouseControler {
	mousetracker: MouseTracker;
	private datahandlervisibility: boolean;
	private targetElement: HTMLElement;
	private cursor: Cursor;

	constructor(protected view: Interface) {
		this.targetElement = view.sceneRenderer.GetElement();
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

				self.view.dataHandler.Hide();
			}
			return true;
		};

		this.targetElement.onmousewheel = function (event: MouseWheelEvent) {
			event = <MouseWheelEvent>(event || window.event);
			self.HandleWheel(event.wheelDelta);
		};

		document.onkeypress = function (event: KeyboardEvent) {
			event = <KeyboardEvent>(event || window.event);
			let key :number = event.key ? event.key.charCodeAt(0) : event.keyCode;
			self.HandleKey(key);
		};
	}

	private Start(event: MouseEvent) {
		this.mousetracker = new MouseTracker(event);

		this.datahandlervisibility = this.view.dataHandler.visibility.visible;
		this.StartMouseEvent();
	}

	private End() {
		if (this.mousetracker != null && this.mousetracker.IsQuickEvent()) {
			this.HandleClick(this.mousetracker);
		}
		this.mousetracker = null;

		if (this.datahandlervisibility) {
			this.view.dataHandler.Show();
		}
		this.cursor.Restore(this.targetElement);
		this.EndMouseEvent();
	}

	protected abstract HandleMouseMove(displacement: MouseDisplacement): boolean;
	protected abstract HandleClick(tracker: MouseTracker): boolean;
	protected abstract HandleWheel(delta: number): boolean;
	protected abstract HandleKey(key: number): boolean;

	protected StartMouseEvent() {
	}

	protected EndMouseEvent() {
	}
	
	protected set Cursor(iconCode: string) {
		this.cursor.Icon = iconCode;
		this.cursor.Apply(this.targetElement);
	}
}