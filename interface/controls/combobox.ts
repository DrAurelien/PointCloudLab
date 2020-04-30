class ComboBox implements Control {
    private button: Button;

    constructor(label: string, options: any, hintMessage? : string) {
        var self = this;
        this.button = new Button(label, function () {
            Popup.CreatePopup(self.button, options);
        }, hintMessage);
    }

    GetElement(): HTMLElement {
        return this.button.GetElement();
    }
}