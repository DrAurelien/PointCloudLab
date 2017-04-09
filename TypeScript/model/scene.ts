class Scene {
    root: CADGroup;

    constructor() {
        this.root = new CADGroup("Scene");
    }

    Select(item: CADNode): void {
		this.root.Apply(p => {
			p.selected = (p === item);
			return true;
		} );
    }

	GetSelected(): CADNode[] {
		let selected: CADNode[] = [];
		this.root.Apply(p => {
			if (p.selected) {
				selected.push(p);
			}
			return true;
		});
		return selected;
	}

	GetSelectionBoundingBox(): BoundingBox {
		let result = new BoundingBox();
		this.root.Apply(p => {
			if (p.selected) {
				result.AddBoundingBox(p.GetBoundingBox());
			}
			return true;
		});
		return result;
	}

    Draw(drawingContext: DrawingContext): void {
		this.root.Draw(drawingContext);
    }
}