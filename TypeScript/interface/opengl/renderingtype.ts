class RenderingType{
    value: number = 0;

    constructor() {
        this.Surface(true);
    }

    Point(activate?: boolean): boolean {
        return this.Set(activate, 1);
    }

    Wire(activate?: boolean) : boolean {
        return this.Set(activate, 2);
    }

    Surface(activate?: boolean) : boolean {
        return this.Set(activate, 4);
    }

    private Set(activate: boolean, base : number): boolean {
        if (activate === true) {
            this.value = this.value | base;
        }
        else if (activate === false) {
            this.value = this.value ^ base;
        }
        return ((this.value & base) != 0);
    }
}