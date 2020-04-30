var Dialog = (function () {
    function Dialog(onAccept, onCancel) {
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
        var toolbar = new Toolbar();
        toolbar.AddControl(new Button('Ok', ApplyAndClose(onAccept)));
        toolbar.AddControl(new Button('Cancel', ApplyAndClose(onCancel)));
        cell.appendChild(toolbar.GetElement());
        document.body.appendChild(this.container);
    }
    Dialog.prototype.InsertItem = function (title, control) {
        if (control === void 0) { control = null; }
        var table = this.container.childNodes[0];
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
    };
    Dialog.prototype.InsertTitle = function (title) {
        var row = this.InsertItem(title);
        var cell = row.cells[0];
        cell.style.fontWeight = 'bold';
        cell.style.textDecoration = 'underline';
        return row;
    };
    Dialog.prototype.InsertValue = function (title, defaultValue) {
        var valueControl = document.createElement('input');
        valueControl.type = 'text';
        valueControl.width = '20';
        valueControl.value = defaultValue;
        return this.InsertItem(title, valueControl);
    };
    Dialog.prototype.InsertCheckBox = function (title, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var valueControl = document.createElement('input');
        valueControl.type = 'checkbox';
        valueControl.checked = defaultValue ? true : false;
        return this.InsertItem(title, valueControl);
    };
    Dialog.prototype.GetValue = function (title) {
        var table = this.container.childNodes[0];
        for (var index = 0; index < table.rows.length; index++) {
            var row = table.rows[index];
            var rowTitle = (row.cells[0]).innerText;
            if (rowTitle == title) {
                var valueInput = row.cells[1].childNodes[0];
                if (valueInput.type == 'text') {
                    return valueInput.value;
                }
                else if (valueInput.type == 'checkbox') {
                    return valueInput.checked;
                }
            }
        }
        return null;
    };
    Dialog.prototype.GetElement = function () {
        return this.container;
    };
    return Dialog;
}());
//# sourceMappingURL=dialog.js.map