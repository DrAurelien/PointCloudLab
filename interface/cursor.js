var Cursor = (function () {
    function Cursor(iconCode) {
        this.original = null;
        this.currentIcon = '';
        this.Icon = iconCode;
    }
    Cursor.prototype.Apply = function (element) {
        if (this.original === null) {
            this.original = element.style.cursor;
        }
        element.style.cursor = this.currentURL;
    };
    Cursor.prototype.Restore = function (element) {
        if (this.original !== null) {
            element.style.cursor = this.original || 'auto';
            this.original = null;
        }
    };
    Object.defineProperty(Cursor.prototype, "Icon", {
        set: function (code) {
            if (this.currentIcon != code) {
                this.currentIcon = code;
                if (code) {
                    var codes = code.split(Cursor.Separator);
                    var canvas = document.createElement('canvas');
                    canvas.width = Cursor.FontSize * codes.length;
                    canvas.height = Cursor.FontSize;
                    var context = canvas.getContext('2d');
                    context.strokeStyle = '#ffffff';
                    context.font = '' + Cursor.FontSize + 'px FontAwesome';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    for (var index = 0; index < codes.length; index++) {
                        context.strokeText(codes[index] || '', (Cursor.FontSize / 2) + (Cursor.FontSize * index), Cursor.FontSize / 2);
                    }
                    this.currentURL = 'url(' + canvas.toDataURL() + '), auto';
                }
                else {
                    this.currentURL = 'auto';
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Cursor.Combine = function (iconCodes) {
        return iconCodes.join(Cursor.Separator);
    };
    Cursor.FontSize = 16;
    Cursor.Separator = '|';
    Cursor.Rotate = '\uf01e'; //fa-rotate-right
    Cursor.Translate = '\uf047'; //fa-arrows
    Cursor.Scale = '\uf002'; //fa-search
    Cursor.Edit = '\uf040'; //fa-pencil
    Cursor.Light = '\uf0eb'; //fa-lightbulb-o
    return Cursor;
}());
//# sourceMappingURL=cursor.js.map