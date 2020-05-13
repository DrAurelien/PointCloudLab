/// <reference path="control.ts" />
/// <reference path="pannel.ts" />


enum HandlePosition {
	None,
	Left,
	Top,
	Right,
	Bottom
};

class Handle implements Control {
	handle: HTMLDivElement;

	constructor(private owner: HideablePannel, public position: HandlePosition) {
		let self = this;

		this.handle = document.createElement('div');
		this.handle.className = 'HideablePannelHandle';
		this.handle.setAttribute("Position", HandlePosition[position]);
		this.handle.onclick = (event) => {
			if (!self.owner.pinned)
				self.owner.SwitchVisibility();
		};

		this.UpdateCursor();
	}

	GetElement(): HTMLElement {
		return this.handle;
	}

	RefreshSize() {
		switch (this.position) {
			case HandlePosition.Left:
			case HandlePosition.Right:
				this.handle.style.height = this.owner.GetElement().clientHeight + 'px';
				break;
			case HandlePosition.Top:
			case HandlePosition.Bottom:
				this.handle.style.width = this.owner.GetElement().clientWidth + 'px';
			default:
				break;
		}
	}

	UpdateCursor() {
		let orientation = '';
		let visible = this.owner.visible;

		switch (this.position) {
			case HandlePosition.Left:
				orientation = visible ? 'e' : 'w';
				break;
			case HandlePosition.Right:
				orientation = visible ? 'w' : 'e';
				break;
			case HandlePosition.Top:
				orientation = visible ? 's' : 'n';
				break;
			case HandlePosition.Bottom:
				orientation = visible ? 'n' : 's';
				break;
			default: break;
		}
		this.handle.style.cursor = orientation + '-resize';
	}
}

class HideablePannel extends Pannel {
	protected handle: Handle;
	protected container: Pannel;
	protected originalvisibility: boolean;
	visible: boolean;
	pinned: boolean;
	private originalWidth: number;
	private originalHeight: number;

	constructor(classname: string = "", handlePosition: HandlePosition = HandlePosition.None) {
		super(classname);

		this.container = new Pannel('HideablePannelContainer');
		super.AddControl(this.container);
		if (handlePosition !== HandlePosition.None) {
			this.handle = new Handle(this, handlePosition);
			super.AddControl(this.handle);
		}

		this.originalWidth = null;
		this.originalHeight = null;

		this.visible = true;
		this.originalvisibility = true;
		this.pinned = false;
	}

	AddControl(control: Control) {
		this.container.AddControl(control);
	}

	Show() {
		if (!this.visible) {
			let pannel = this.GetElement();
			if (this.originalWidth !== null) {
				pannel.style.width = this.originalWidth + 'px';
			}
			if (this.originalHeight !== null) {
				pannel.style.height = this.originalHeight + 'px';
			}
			this.visible = true;
			this.originalvisibility = true;
			this.RefreshSize();
			if (this.handle) {
				this.handle.UpdateCursor();
			}
		}
	}

	Hide() {
		if (this.visible) {
			let pannel = this.GetElement();
			let handle = this.handle.GetElement();
			switch (this.handle.position) {
				case HandlePosition.Left:
				case HandlePosition.Right:
					this.originalWidth = pannel.clientWidth;
					pannel.style.width = handle.clientWidth + 'px';
					break;
				case HandlePosition.Top:
				case HandlePosition.Bottom:
					this.originalHeight = pannel.clientHeight;
					pannel.style.height = handle.clientHeight + 'px';
					break;
				default: break;
			}
			this.visible = false;
			this.originalvisibility = false;
			if (this.handle) {
				this.handle.UpdateCursor();
			}
		}
	}

	TemporaryHide() {
		let visbilityToRestore = this.visible;
		this.Hide();
		this.originalvisibility = visbilityToRestore;
	}

	RestoreVisibility() {
		if (this.originalvisibility) {
			this.Show();
		}
		else {
			this.Hide();
		}
	}

	SwitchVisibility() {
		if (this.visible) {
			this.Hide();
		}
		else {
			this.Show();
		}
	}

	RefreshSize() {
		switch (this.handle.position) {
			case HandlePosition.Left:
			case HandlePosition.Right:
				this.GetElement().style.width = this.container.GetElement().clientWidth +
					this.handle.GetElement().clientWidth + 'px';
				break;
			case HandlePosition.Top:
			case HandlePosition.Bottom:
				this.GetElement().style.height = this.container.GetElement().clientHeight +
					this.handle.GetElement().clientHeight + 'px';
				break;
			default: break;
		}
		if (this.handle) {
			this.handle.RefreshSize();
		}
	}
}