﻿/// <reference path="control.ts" />
/// <reference path="toolbar.ts" />
/// <reference path="button.ts" />


class Dialog implements Control {
	container: HTMLDivElement;

	constructor(onAccept: DialogResultHandler, onCancel: DialogResultHandler) {
		this.container = document.createElement('div');
		this.container.className = 'Dialog';

		var table = document.createElement('table');
		table.className = 'DialogContent';
		this.container.appendChild(table);

		var row = table.insertRow(0);
		var cell = row.insertCell();
		cell.colSpan = 2;

		var dialog = this;
		function ApplyAndClose(callback) {
			return function () {
				if (callback && !callback(dialog)) {
					return false;
				}
				if (dialog.container.parentNode) {
					dialog.container.parentNode.removeChild(dialog.container);
				}
				return true;
			};
		}

		let toolbar = new Toolbar();
		toolbar.AddControl(new Button(new SimpleAction('Ok', ApplyAndClose(onAccept))));
		toolbar.AddControl(new Button(new SimpleAction('Cancel', ApplyAndClose(onCancel))));
		cell.appendChild(toolbar.GetElement());

		document.body.appendChild(this.container);
	}

	InsertItem(title: string, control: HTMLElement = null): HTMLTableRowElement {
		let table: HTMLTableElement = <HTMLTableElement>this.container.childNodes[0];
		var row = table.insertRow(table.rows.length - 1);
		var titleCell = row.insertCell();
		titleCell.appendChild(document.createTextNode(title));
		if (control) {
			var contentCell = row.insertCell();
			contentCell.appendChild(control);
		}
		else {
			titleCell.colSpan = 2;
		}
		return row;
	}

	InsertTitle(title: string) {
		let row = this.InsertItem(title);
		let cell: HTMLTableCellElement = <HTMLTableCellElement>row.cells[0];
		cell.style.fontWeight = 'bold';
		cell.style.textDecoration = 'underline';
		return row;
	}

	InsertValue(title: string, defaultValue: any) {
		let valueControl: HTMLInputElement = document.createElement('input');
		valueControl.type = 'text';
		valueControl.width = 20;
		valueControl.value = defaultValue;
		return this.InsertItem(title, valueControl);
	}

	InsertCheckBox(title: string, defaultValue: boolean = null) {
		let valueControl: HTMLInputElement = document.createElement('input');
		valueControl.type = 'checkbox';
		valueControl.checked = defaultValue ? true : false;
		return this.InsertItem(title, valueControl);
	}

	GetValue(title: string): any {
		let table: HTMLTableElement = <HTMLTableElement>this.container.childNodes[0];
		for (var index = 0; index < table.rows.length; index++) {
			let row: HTMLTableRowElement = <HTMLTableRowElement>table.rows[index];
			let rowTitle = (<HTMLTableCellElement>(row.cells[0])).innerText;
			if (rowTitle == title) {
				let valueInput: HTMLInputElement = <HTMLInputElement>row.cells[1].childNodes[0]
				if (valueInput.type == 'text') {
					return valueInput.value;
				}
				else if (valueInput.type == 'checkbox') {
					return valueInput.checked;
				}
			}
		}
		return null;
	}

	GetElement(): HTMLElement {
		return this.container;
	}
}

interface DialogResultHandler {
	(dialog: Dialog): boolean;
}