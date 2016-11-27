class Toolbar implements Control {
    private toolbar: HTMLElement;

    constructor(controls : Control[]) {
        var container = document.createElement('table');
        container.width = '100%';
        var containerRow = document.createElement('tr');
        container.appendChild(containerRow);

        for (var index = 0; index < controls.length; index++) {
            var containerCell = document.createElement('td');
            containerRow.appendChild(containerCell);
            containerCell.appendChild(controls[index].GetElement());
        }

        this.toolbar = document.createElement('div');
        this.toolbar.appendChild(container);
    }

    GetElement(): HTMLElement {
        return this.toolbar;
    }
}