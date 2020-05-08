class SelectDrop implements Control {
    private button: Button;

    constructor(label: string, options: Action[], selected: number, hintMessage? : string) {
        let self = this;

        this.button = new Button(label, function () {
            let selectOptions = [];
            for (let index = 0; index < options.length; index++) {
                if (options[index].label !== self.button.GetLabel()) {
                    selectOptions.push(new SelectOption(self, options[index]));
                }
            }
            Popup.CreatePopup(self.button, selectOptions);
        }, hintMessage);

        this.SetCurrent(options[selected].label);
    }

    GetElement(): HTMLElement {
        return this.button.GetElement();
    }

    SetCurrent(current: string) {
        this.button.SetLabel(current);
    }
}

class SelectOption extends Action {
    constructor(private select: SelectDrop, private innerAction: Action) {
        super(innerAction.label, innerAction.hintMessage);
    }

    Run() {
        this.select.SetCurrent(this.label);
        this.innerAction.Run();
    }

    Enabled(): boolean {
        return this.innerAction.Enabled();
    }
}