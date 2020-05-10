/// <reference path="pclnode.ts" />
/// <reference path="pclgroup.ts" />
/// <reference path="light.ts" />
/// <reference path="lightscontainer.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />


class Scene extends PCLGroup {
	constructor(private notifhandler: Notifiable) {
		super("Scene");
		this.deletable = false;

		this.children = [null, null];

		this.Contents = new PCLGroup("Objects");
		this.Contents.deletable = false;

		this.Lights = new LightsContainer("Lights");
		this.Lights.deletable = false;
		this.Lights.visible = false;
		this.Lights.folded = true;

		let defaultLight = new Light(new Vector([10.0, 10.0, 10.0]), this.Lights);
		defaultLight.deletable = false;
	}

	get Contents(): PCLGroup {
		return <PCLGroup>this.children[1];
	}
	set Contents(c: PCLGroup) {
		this.children[1] = c;
		c.owner = this;
	}

	get Lights(): LightsContainer {
		return <LightsContainer>this.children[0];
	}
	set Lights(l: LightsContainer) {
		this.children[0] = l;
		l.owner = this;
	}

	Select(item: Pickable): void {
		this.Contents.Apply(p => {
			p.selected = (p === item);
			return true;
		});
	}

	GetSelected(): PCLNode[] {
		let selected: PCLNode[] = [];
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

	GetDisplayIcon(): string {
		return 'fa-desktop';
	}

	NotifyChange(source: PCLNode) {
		if (this.notifhandler) {
			this.notifhandler.NotifyChange(source);
		}
	}
}