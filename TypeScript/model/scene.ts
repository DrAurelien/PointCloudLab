class Scene extends CADGroup {
    constructor() {
		super("Scene");
		this.deletable = false;

		this.children = [null, null];

        this.Contents = new CADPrimitivesContainer("Objects");
		this.Contents.deletable = false;

		this.Lights = new LightsContainer("Lights");
		this.Lights.deletable = false;
		this.Lights.visible = false;
		this.Lights.folded = true;

		let defaultLight = new Light(new Vector([10.0, 10.0, 10.0]), this.Lights);
		defaultLight.deletable = false;
    }

    get Contents(): CADPrimitivesContainer {
		return <CADPrimitivesContainer>this.children[1];
	}
	set Contents(c: CADPrimitivesContainer) {
		this.children[1] = c;
	}

    get Lights(): LightsContainer {
		return <LightsContainer>this.children[0];
	}
	set Lights(l: LightsContainer) {
		this.children[0] = l;
	}

    Select(item: CADNode): void {
		this.Contents.Apply(p => {
			p.selected = (p === item);
			return true;
		} );
    }

	GetSelected(): CADNode[] {
		let selected: CADNode[] = [];
		this.Contents.Apply(p => {
			if (p.selected) {
				selected.push(p);
			}
			return true;
		});
		return selected;
	}

	GetSelectionBoundingBox(): BoundingBox {
		let result = new BoundingBox();
		this.Contents.Apply(p => {
			if (p.selected) {
				result.AddBoundingBox(p.GetBoundingBox());
			}
			return true;
		});
		return result;
	}
}