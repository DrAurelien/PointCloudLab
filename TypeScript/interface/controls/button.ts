class Button implements Control {
    button: HTMLDivElement;

    constructor(label: string, callback: Function) {
        this.button = document.createElement('div');
        this.button.className = 'Button';
        let buttonLabel = document.createTextNode(label);
        this.button.appendChild(buttonLabel);

        if (callback) {
            this.button.onclick = function (event) { callback() };
        }
    }

    GetElement(): HTMLElement {
        return this.button;
    }
}