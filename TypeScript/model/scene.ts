class Scene extends CADNode {
    root: CADPrimitivesContainer;
	lights: LightsContainer;

    constructor() {
		super("Scene");
		this.deletable = false;

        this.root = new CADPrimitivesContainer("Objects");
		this.root.deletable = false;

		this.lights = new LightsContainer("Lights");
		this.lights.deletable = false;
		this.lights.visible = false;
		this.lights.folded = true;

		let defaultLight = new Light(new Vector([10.0, 10.0, 10.0]), this.lights);
		defaultLight.deletable = false;
    }

	GetChildren(): CADNode[] {
		return [this.lights, this.root];
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

    RayIntersection(ray: Ray): Picking {
		return this.root.RayIntersection(ray);
	}

}