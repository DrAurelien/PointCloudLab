﻿/// <reference path="control.ts" />


class ProgressBar implements Control, ProgressHandler {
	control: HTMLDivElement;
	container: HTMLDivElement;
	message: HTMLDivElement;
	progress: HTMLDivElement;
	nestedcontainer: HTMLDivElement;
	lastupdate: number;
	refreshtime: number;
	updatedelay: number;

	static CurrentProgress: ProgressBar;

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

		this.nestedcontainer = document.createElement('div');
		this.nestedcontainer.className = 'NestedProgressContainer';
		this.control.appendChild(this.nestedcontainer);

		this.lastupdate = null;
		this.refreshtime = 10;
		this.updatedelay = 500;
	}

	Initialize(message: string) {
		this.SetMessage(message);
		this.Show();
	}

	Finalize() {
		this.Delete();
	}

	RefreshDelay(): number {
		return this.refreshtime;
	}

	SetMessage(message: string): void {
		this.message.innerHTML = '';
		this.message.appendChild(document.createTextNode(message));
	}

	Show(): void {
		if (ProgressBar.CurrentProgress) {
			ProgressBar.CurrentProgress.nestedcontainer.appendChild(this.control);
		}
		else {
			document.body.appendChild(this.control);
			ProgressBar.CurrentProgress = this;
		}
	}

	Delete(): void {
		if (this.control.parentNode) {
			this.control.parentNode.removeChild(this.control);
		}
		if (ProgressBar.CurrentProgress === this) {
			ProgressBar.CurrentProgress = null;
		}
	}

	Update(current: number, total: number) {
		let now = (new Date()).getTime();
		if (this.lastupdate == null || (now - this.lastupdate) > this.updatedelay) {
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