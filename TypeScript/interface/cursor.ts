class Cursor {
	private original: string;
	private currentURL: string;
	private currentIcon: string;
	static FontSize: number = 16;
	static Separator = '|';

	constructor(iconCode?: string) {
		this.original = null;
		this.currentIcon = '';
		this.Icon = iconCode;
	}

	Apply(element: HTMLElement) {
		if (this.original === null) {
			this.original = element.style.cursor;
		}
		element.style.cursor = this.currentURL;
	}

	Restore(element: HTMLElement) {
		if (this.original !== null) {
			element.style.cursor = this.original || 'auto';
			this.original = null;
		}
	}

	set Icon(code: string) {
		if (this.currentIcon != code) {
			this.currentIcon = code;

			if (code) {
				let codes = code.split(Cursor.Separator);

				let canvas = document.createElement('canvas');
				canvas.width = Cursor.FontSize * codes.length;
				canvas.height = Cursor.FontSize;

				let context = canvas.getContext('2d');
				context.strokeStyle = '#ffffff';
				context.font = '' + Cursor.FontSize + 'px FontAwesome';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				for (var index = 0; index < codes.length; index++) {
					context.strokeText(codes[index] || '', (Cursor.FontSize / 2) + (Cursor.FontSize * index), Cursor.FontSize / 2);
				}

				this.currentURL = 'url(' + canvas.toDataURL() + '), auto'
			}
			else {
				this.currentURL = 'auto';
			}
		}
	}

	static Combine(iconCodes: string[]) {
		return iconCodes.join(Cursor.Separator);
	}

	static Rotate = '\uf01e'; //fa-rotate-right
	static Translate = '\uf047'; //fa-arrows
	static Scale = '\uf002'; //fa-search
	static Edit = '\uf040'; //fa-pencil
	static Light = '\uf0eb'; //fa-lightbulb-o
}