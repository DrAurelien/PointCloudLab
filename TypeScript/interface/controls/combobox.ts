class ComboBox implements Control {
    private button: Button;

    constructor(label: string, options: any) {
        var self = this;
        this.button = new Button(label, function () {
            Popup.CreatePopup(self.button, options);
        });
    }

    GetElement(): HTMLElement {
        return this.button.GetElement();
    }
}