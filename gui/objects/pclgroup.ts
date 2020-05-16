/// <reference path="pclnode.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../../tools/picking.ts" />
/// <reference path="../../model/boundingbox.ts" />
/// <reference path="pclshape.ts" />
/// <reference path="pclplane.ts" />
/// <reference path="pclsphere.ts" />
/// <reference path="pclcylinder.ts" />
/// <reference path="pclcone.ts" />
/// <reference path="pcltorus.ts" />
/// <reference path="../../controler/actions/action.ts" />
/// <reference path="../../controler/actions/delegate.ts" />
/// <reference path="../../controler/actions/scanfromcurrentviewpoint.ts" />
/// <reference path="../controls/properties/properties.ts" />
/// <reference path="../controls/properties/numberproperty.ts" />
/// <reference path="../../maths/vector.ts" />
/// <reference path="../../files/pclserializer.ts" />


class PCLGroup extends PCLNode {
	children: PCLNode[];
	folded: boolean;

	constructor(name: string, public supportsPrimitivesCreation: boolean = true) {
		super(name);
		this.children = [];
		this.folded = false;
	}

	ToggleFolding() {
		this.folded = !this.folded;
		this.NotifyChange(this, ChangeType.Folding);
	}

	DrawNode(drawingContext: DrawingContext): void {
		if (this.visible) {
			for (var index = 0; index < this.children.length; index++) {
				this.children[index].Draw(drawingContext);
			}
		}
	}

	RayIntersection(ray: Ray): Picking {
		let picked: Picking = null;
		for (var index = 0; index < this.children.length; index++) {
			if (this.children[index].visible) {
				let intersection = this.children[index].RayIntersection(ray);
				if (picked == null || (intersection && intersection.Compare(picked) < 0)) {
					picked = intersection;
				}
			}
		}
		return picked;
	}

	Add(son: PCLNode): void {
		if (son.owner) {
			son.owner.Remove(son);
		}
		son.owner = this;
		this.children.push(son);
		this.NotifyChange(this, ChangeType.Children | ChangeType.Properties);
	}

	Remove(son: PCLNode): void {
		let position = -1;
		for (var index = 0; position < 0 && index < this.children.length; index++) {
			if (this.children[index] === son) {
				position = index;
			}
		}

		if (position >= 0) {
			son.owner = null;
			this.children.splice(position, 1);
			this.NotifyChange(this, ChangeType.Children | ChangeType.Display | ChangeType.Properties);
		}
	}

	GetBoundingBox(): BoundingBox {
		let boundingbox = new BoundingBox();
		for (var index = 0; index < this.children.length; index++) {
			let bb = this.children[index].GetBoundingBox();
			if (bb && bb.IsValid()) {
				boundingbox.Add(bb.min);
				boundingbox.Add(bb.max);
			}
		}
		return boundingbox;
	}

	Apply(proc: PCLNodeHandler): boolean {
		if (!super.Apply(proc)) {
			return false;
		}
		for (var index = 0; index < this.children.length; index++) {
			if (this.children[index].Apply(proc) === false) {
				return false;
			}
		}
		return true;
	}

	GetChildren(): PCLNode[] {
		return this.children;
	}

	GetActions(delegate: ActionDelegate): Action[] {
		let self = this;
		let result: Action[] = super.GetActions(delegate);

		result.push(null);

		if (this.folded) {
			result.push(new SimpleAction('Unfold', () => {
				self.folded = false;
				self.NotifyChange(self, ChangeType.Folding);
			}));
		}
		else {
			result.push(new SimpleAction('Fold', () => {
				self.folded = true;
				self.NotifyChange(self, ChangeType.Folding);
			}));
		}

		if (this.supportsPrimitivesCreation) {
			result.push(null);

			result.push(new SimpleAction('New group', this.WrapNodeCreator(this.GetGroupCreator()), 'A group is a hiearchical item that can be used to organize objects.'));
			result.push(new SimpleAction('New plane', this.WrapNodeCreator(this.GetPlaneCreator())));
			result.push(new SimpleAction('New sphere', this.WrapNodeCreator(this.GetSphereCreator())));
			result.push(new SimpleAction('New cylinder', this.WrapNodeCreator(this.GetCylinderCreator())));
			result.push(new SimpleAction('New cone', this.WrapNodeCreator(this.GetConeCreator())));
			result.push(new SimpleAction('New torus', this.WrapNodeCreator(this.GetTorusCreator())));
			result.push(new ScanFromCurrentViewPointAction(this, delegate));
		}

		return result;
	}

	FillProperties() {
		if (this.properties) {
			let self = this;
			let children = new NumberProperty('Children', () => self.children.length, null);
			children.SetReadonly();
			this.properties.Push(children);
		}
	}

	private WrapNodeCreator(creator: PCLNodeCreator): Function {
		let self = this;
		return () => {
			let shape = creator();
			self.Add(shape);
			shape.Select(true);
		}
	}

	private GetGroupCreator(): PCLNodeCreator {
		return (): PCLGroup => {
			return new PCLGroup(NameProvider.GetName('Group'));
		};
	}

	private GetPlaneCreator(): PCLNodeCreator {
		return (): PCLShape => {
			let plane = new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1);
			return new PCLPlane(plane);
		};
	}

	private GetSphereCreator(): PCLNodeCreator {
		return (): PCLShape => {
			let sphere = new Sphere(new Vector([0, 0, 0]), 1);
			return new PCLSphere(sphere);
		};
	}

	private GetCylinderCreator(): PCLNodeCreator {
		return (): PCLShape => {
			let cylinder = new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1);
			return new PCLCylinder(cylinder);
		};
	}

	private GetConeCreator(): PCLNodeCreator {
		return (): PCLShape => {
			let cone = new Cone(new Vector([0, 0, 0]), new Vector([0, 0, 1]), Math.PI / 6.0, 1);
			return new PCLCone(cone);
		};
	}

	private GetTorusCreator(): PCLNodeCreator {
		return (): PCLShape => {
			let torus = new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1);
			return new PCLTorus(torus);
		};
	}

	IsScannable(): boolean {
		return !this.Apply((p: PCLNode) => !(p instanceof PCLShape || p instanceof PCLMesh));
	}

	GetDisplayIcon(): string {
		return 'fa-folder' + (this.folded ? '' : '-open');
	}


	GetSerializationID(): string {
		return 'GROUP';
	}

	SerializeNode(serializer: PCLSerializer) {
		let self = this;
		if (!this.supportsPrimitivesCreation) {
			serializer.PushParameter('noprimitives');
		}
		serializer.PushParameter('nbchildren', (s) => s.PushInt32(self.children.length));
		serializer.PushParameter('children');
		for (let index = 0; index < this.children.length; index++) {
			this.children[index].Serialize(serializer);
		}
	}
}

interface PCLNodeCreator {
	(): PCLNode;
}