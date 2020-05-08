class ProgressBar implements Control {
	control: HTMLDivElement;
	container: HTMLDivElement;
	message: HTMLDivElement;
	progress: HTMLDivElement;
	lastupdate: number;
	refreshtime: number;
	updatestep: number;


	constructor() {
		this.control = document.createElement('div');
		this.control.className = 'ProgressControl';

		this.message = document.createElement('div');
		this.message.className = 'ProgressMessage';
		this.control.appendChild(this.message);

		this.container = document.createElement('div');
		this.container.className = 'ProgressContainer';
		this.control.appendChild(this.container);

		this.progress = document.createElement('div');
		this.progress.className = 'ProgressBar';
		this.container.appendChild(this.progress);

		this.lastupdate = null;
		this.refreshtime = 10;
		this.updatestep = 500;
	}

	SetMessage(message: string): void {
		this.message.innerHTML = '';
		this.message.appendChild(document.createTextNode(message));
	}

	Show(): void {
		document.body.appendChild(this.control);
	}

	Delete(): void {
		if (this.control.parentNode) {
			this.control.parentNode.removeChild(this.control);
		}
	}

	Update(current: number, total: number) {
		let now = (new Date()).getTime();
		if (this.lastupdate == null || (now - this.lastupdate) > this.updatestep) {
			this.progress.style.width = ((current / total) * this.container.scrollWidth) + 'px';
			this.lastupdate = now;
			return true;
		}

		return false;
	}

	GetElement(): HTMLElement {
		return this.control;
	}
}