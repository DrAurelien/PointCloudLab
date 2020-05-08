/// <reference path="pclnode.ts" />
/// <reference path="../opengl/drawingcontext.ts" />
/// <reference path="../../tools/picking.ts" />


class PCLGroup extends PCLNode {
	children: PCLNode[];
	folded: boolean;
	supportsPrimitivesCreation: boolean;

	constructor(name: string, owner: PCLGroup = null, supportPrimitives: boolean = true) {
		super(name, owner);
		this.children = [];
		this.folded = false;
		this.supportsPrimitivesCreation = supportPrimitives;
	}

	DrawNode(drawingContext: DrawingContext): void {
		for (var index = 0; index < this.children.length; index++) {
			this.children[index].Draw(drawingContext);
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
		}
	}

	GetBoundingBox(): BoundingBox {
		let boundingbox = new BoundingBox();
		for (var index = 0; index < this.children.length; index++) {
			let bb = this.children[index].GetBoundingBox();
			if (bb.IsValid()) {
				boundingbox.Add(bb.min);
				boundingbox.Add(bb.max);
			}
		}
		return boundingbox;
	}

	Apply(proc: CADNodeHandler): boolean {
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
		if (!this.folded) {
			return this.children;
		}
		return [];
	}

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let self = this;
		let result: Action[] = super.GetActions(dataHandler, onDone);

		result.push(null);

		if (this.folded) {
			result.push(new SimpleAction('Unfold', () => {
				self.folded = false;
				return onDone(null);
			}));
		}
		else {
			result.push(new SimpleAction('Fold', () => {
				self.folded = true;
				return onDone(null);
			}));
		}

		if (this.supportsPrimitivesCreation) {
			result.push(null);

			result.push(new SimpleAction('New group', () => onDone(new PCLGroup(NameProvider.GetName('Group'), self)), 'A group is a hiearchical item that can be used to organize objects.'));
			result.push(new SimpleAction('New plane', this.GetShapeCreator(this.GetPlaneCreator(), dataHandler, onDone)));
			result.push(new SimpleAction('New sphere', this.GetShapeCreator(this.GetSphereCreator(), dataHandler, onDone)));
			result.push(new SimpleAction('New cylinder', this.GetShapeCreator(this.GetCylinderCreator(), dataHandler, onDone)));
			result.push(new SimpleAction('New cone', this.GetShapeCreator(this.GetConeCreator(), dataHandler, onDone)));
			result.push(new SimpleAction('New torus', this.GetShapeCreator(this.GetTorusCreator(), dataHandler, onDone)));
			result.push(new ScanFromCurrentViewPointAction(this, dataHandler, onDone));
		}

		return result;
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();

		let children = new NumberProperty('Children', this.children.length, null);
		children.SetReadonly();
		properties.Push(children);

		return properties;
	}

	private GetShapeCreator(creator: PCLShapeCreator, dataHandler: DataHandler, onDone: CADNodeHandler): Function {
		return () => {
			let shape = creator();
			shape.PrepareForDrawing(dataHandler.GetSceneRenderer().drawingcontext);
			onDone(shape);
		}
	}

	private GetPlaneCreator(): PCLShapeCreator {
		let self = this;
		return (): PCLShape => {
			let plane = new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1);
			return new PCLPlane(plane, self);
		};
	}
	private GetSphereCreator(): PCLShapeCreator {
		let self = this;
		return (): PCLShape => {
			let sphere = new Sphere(new Vector([0, 0, 0]), 1);
			return new PCLSphere(sphere, self);
		};
	}

	private GetCylinderCreator(): PCLShapeCreator {
		let self = this;
		return (): PCLShape => {
			let cylinder = new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1);
			return new PCLCylinder(cylinder, self);
		};
	}

	private GetConeCreator(): PCLShapeCreator {
		let self = this;
		return (): PCLShape => {
			let cone = new Cone(new Vector([0, 0, 0]), new Vector([0, 0, 1]), Math.PI / 6.0, 1);
			return new PCLCone(cone, self);
		};
	}

	private GetTorusCreator(): PCLShapeCreator {
		let self = this;
		return (): PCLShape => {
			let torus = new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1);
			return new PCLTorus(torus, self);
		};
	}

	IsScannable(): boolean {
		return !this.Apply((p: PCLNode) => !(p instanceof Shape || p instanceof Mesh));
	}
}