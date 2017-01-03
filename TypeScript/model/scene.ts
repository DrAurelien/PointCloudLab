class Scene {
    items: CADPrimitive[];

    constructor() {
        this.items = [];
    }

    Select(item: CADPrimitive): void {
		for (let index = 0; index < this.items.length; index++) {
			this.items[index].selected = (this.items[index] == item);
		}
    }

    Draw(drawingContext: DrawingContext): void {
		for (let index = 0; index < this.items.length; index++) {
			if (this.items[index].visible) {
				this.items[index].Draw(drawingContext);
			}
		}
    }

    Remove(item: CADPrimitive): void {
		let index = this.GetIndex(item);
		if (index >= 0) {
			this.items.splice(index, 1);
		}
    }

	private GetIndex(item: CADPrimitive): number {
		for (let index = 0; index < this.items.length; index++) {
			if (this.items[index] === item)
				return index;
		}
		return -1;
	}
}