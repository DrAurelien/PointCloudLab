/// <reference path="control.ts" />
/// <reference path="toolbar.ts" />
/// <reference path="button.ts" />

namespace DialogItems
{
	export interface IValueChangeListener
	{
		(item:DialogItem);
	};
	
	//============================================================
	export abstract class DialogItem  implements Control
	{
		private container : HTMLTableRowElement;

		constructor(public title: string)
		{
			this.container = null;	
		}

		Show(isVisible: boolean) 
		{
			if(this.container)
				this.container.hidden = !isVisible;
		}
		
		AddToLayout(table : HTMLTableElement, index:number) : HTMLTableRowElement
		{
			if(!this.container)
			{
				this.container = table.insertRow(index);
				if(this.title)
				{
					let titleCell = this.container.insertCell();
					titleCell.innerText = this.title;
				}
				let control = this.GetElement();
				var contentCell = this.container.insertCell();
				contentCell.appendChild(control);
				if(!this.title)
					contentCell.colSpan = 2;
			}
			return this.container;
		};

		abstract GetElement();
	};

	//============================================================
	export abstract class IDialogValue extends DialogItem
	{
		abstract OnValueChange(listener: IValueChangeListener);
	}

	//============================================================
	export abstract class DialogValue<ValueType> extends IDialogValue
	{
		abstract GetValue() : ValueType;
		abstract GetElement();
	};

	//============================================================
	export class Title extends DialogItem
	{
		private span : HTMLSpanElement;
		constructor(contents:string)
		{
			super(null);
			this.span = document.createElement('span');
			if(contents)
			{
				this.span.innerText = contents;
				this.span.style.fontWeight = 'bold';
				this.span.style.textDecoration = 'underline';
			}
		}

		GetElement(): HTMLElement
		{
			return this.span;
		}
	};

	//============================================================
	export class Spacer extends Title
	{
		constructor()
		{
			super(null);
		}

		GetElement(): HTMLElement
		{
			return null;
		}
	};

	//============================================================
	export class CheckBox extends DialogValue<boolean>
	{
		private input : HTMLInputElement;
		constructor(title: string, defaultValue : boolean)
		{
			super(title);
			this.input = document.createElement('input');
			this.input.type = 'checkbox';
			this.input.checked = defaultValue ? true : false;
		}

		GetElement(): HTMLElement
		{
			return this.input;
		}
		
		GetValue() : boolean
		{
			return this.input.checked;
		}
		
		OnValueChange(listener: IValueChangeListener)
		{
			let self = this;
			this.input.addEventListener('change', (evt) =>{listener(self);})
		}
	};

	//============================================================
	export class StringValue extends DialogValue<string>
	{
		private input : HTMLInputElement;
		constructor(title: string, defaultValue : string)
		{
			super(title);
			this.input = document.createElement('input');
			this.input.type = 'text';
			this.input.width = 20;
			this.input.value = defaultValue;
		}

		GetElement(): HTMLElement
		{
			return this.input;
		}
		
		GetValue() : string
		{
			return this.input.value;
		}

		OnValueChange(listener: IValueChangeListener)
		{
			let self = this;
			this.input.addEventListener('change', (evt) =>{listener(self);})
		}
	};

	//============================================================
	export class NumericValue extends DialogValue<number>
	{
		private input : HTMLInputElement;
		constructor(title: string, defaultValue : number)
		{
			super(title);
			this.input = document.createElement('input');
			this.input.type = 'number';
			this.input.width = 20;
			this.input.value = '' + defaultValue;
		}

		GetElement(): HTMLElement
		{
			return this.input;
		}
		
		GetValue() : number
		{
			return parseFloat(this.input.value);
		}
		
		OnValueChange(listener: IValueChangeListener)
		{
			let self = this;
			this.input.addEventListener('change', (evt) =>{listener(self);})
		}
	};

	//============================================================
	export class Choice extends DialogValue<string>
	{
		private select : HTMLSelectElement;
		constructor(title: string, choices : string[], defaultValue : number)
		{
			super(title);
			this.select = document.createElement('select');

			for(let index=0; index<choices.length; index++)
			{
				let option : HTMLOptionElement = document.createElement('option');
				option.value = choices[index];
				option.innerText = choices[index];
				this.select.options.add(option);
			}
			this.select.selectedIndex = defaultValue;
		}

		GetElement(): HTMLElement
		{
			return this.select;
		}
		
		GetValue() : string
		{
			let index = this.select.selectedIndex;
			return this.select.options[index].value;
		}

		OnValueChange(listener: IValueChangeListener)
		{
			let self = this;
			this.select.addEventListener('change', (evt) =>{listener(self);})
		}
	};
}

//============================================================
class Dialog implements Control {
	container: HTMLDivElement;
	items : Map<string, DialogItems.DialogItem>;

	constructor(onAccept: DialogResultHandler, onCancel: DialogResultHandler) {
		this.items = new Map<string, DialogItems.DialogItem>();

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

	InsertItem(item: DialogItems.DialogItem): HTMLTableRowElement {
		let title = item.title;
		this.items[title] = item;

		let table: HTMLTableElement = <HTMLTableElement>this.container.childNodes[0];
		return item.AddToLayout(table, table.rows.length - 1);
	}

	InsertTitle(contents: string) : DialogItems.Title {
		let title = new DialogItems.Title(contents);
		this.InsertItem(title);
		return title;
	}

	InsertStringValue(title: string, defaultValue: string) : DialogItems.StringValue {
		let stringValue =  new DialogItems.StringValue(title, defaultValue);
		this.InsertItem(stringValue);
		return stringValue;
	}
	
	InsertNumericValue(title: string, defaultValue: number) : DialogItems.NumericValue {
		let numericValue =  new DialogItems.NumericValue(title, defaultValue);
		this.InsertItem(numericValue);
		return numericValue;
	}

	InsertCheckBox(title: string, defaultValue: boolean = null) : DialogItems.CheckBox {
		let checkBox =  new DialogItems.CheckBox(title, defaultValue);
		this.InsertItem(checkBox);
		return checkBox;
	}

	InsertChoice(title: string, choices: string[], defaultValue: number=0) : DialogItems.Choice
	{
		let choice =  new DialogItems.Choice(title, choices, defaultValue);
		this.InsertItem(choice);
		return choice;
	}

	GetValue<ValueType>(title: string): any {
		let item = this.items[title] as DialogItems.DialogValue<ValueType>;
		if(item)
			return item.GetValue();
		return null;
	}

	GetElement(): HTMLElement {
		return this.container;
	}
}

interface DialogResultHandler {
	(dialog: Dialog): boolean;
}