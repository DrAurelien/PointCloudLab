abstract class MouseControler {
	mousetracker: MouseTracker;
	private datahandlervisibility: boolean;

	constructor(protected view: Interface) {
		let targetElement: HTMLElement = view.sceneRenderer.GetElement();
		let self = this;

        targetElement.oncontextmenu = function (event: Event) {
			event = event || window.event;
			event.preventDefault();
			return false;
		};

		targetElement.onmousedown = function (event: MouseEvent) {
			event = <MouseEvent>(event || window.event);
			self.mousetracker = new MouseTracker(event);

			self.datahandlervisibility = self.view.dataHandler.visibility.visible;
			self.StartMouseEvent();
		};

		targetElement.onmouseup = function (event: MouseEvent) {
			event = <MouseEvent>(event || window.event);
			if (self.mousetracker != null && self.mousetracker.IsQuickEvent()) {
				self.HandleClick(self.mousetracker);
			}
			self.mousetracker = null;

			if (self.datahandlervisibility) {
				self.view.dataHandler.Show();
			}
			self.EndMouseEvent();
		};

		targetElement.onmousemove = function (event: MouseEvent) {
			event = <MouseEvent>(event || window.event);
			
			if (self.mousetracker) {
				let delta = self.mousetracker.UpdatePosition(event);
				self.HandleMouseMove(delta);

				self.view.dataHandler.Hide();
			}
			return true;
		};

		targetElement.onmousewheel = function (event: MouseWheelEvent) {
			event = <MouseWheelEvent>(event || window.event);
			self.HandleWheel(event.wheelDelta);
		};

		targetElement.onkeypress = function (event: KeyboardEvent) {
			event = <KeyboardEvent>(event || window.event);
			let key :number = event.key ? event.key.charCodeAt(0) : event.keyCode;
			self.HandleKey(key);
		};
	}

	protected abstract HandleMouseMove(displacement: MouseDisplacement): boolean;
	protected abstract HandleClick(tracker: MouseTracker): boolean;
	protected abstract HandleWheel(delta: number): boolean;
	protected abstract HandleKey(key: number): boolean;

	protected StartMouseEvent() {}

	protected EndMouseEvent() {}
}