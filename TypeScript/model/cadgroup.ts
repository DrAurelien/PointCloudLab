class CADGroup extends CADNode {
    children: CADNode[];
    folded: boolean;

    constructor(name?: string, owner: CADGroup = null) {
        super(name || NameProvider.GetName('Group'), owner);
		this.children = [];
		this.folded = false;
    }

    Draw(drawingContext: DrawingContext): void {
		if (this.visible) {
			for (var index = 0; index < this.children.length; index++) {
				this.children[index].Draw(drawingContext);
			}

			if (this.selected) {
				var box = this.GetBoundingBox();
				box.Draw(drawingContext);
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

    Add(son: CADNode): void {
        if (son.owner) {
            son.owner.Remove(son);
        }
        son.owner = this;
        this.children.push(son);
    }

    Remove(son: CADNode): void {
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
        this.boundingbox = new BoundingBox();
        for (var index = 0; index < this.children.length; index++) {
			let bb = this.children[index].GetBoundingBox();
			if (bb.IsValid()) {
				this.boundingbox.Add(bb.min);
				this.boundingbox.Add(bb.max);
			}
        }
        return this.boundingbox;
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

	GetChildren(): CADNode[] {
		if (!this.folded) {
			return this.children;
		}
		return [];
	}

	IsScannable(): boolean {
		return !this.Apply(p => !(p instanceof Shape || p instanceof Mesh));
	}

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let self = this;
		let result: Action[] = super.GetActions(dataHandler, onDone);

		result.push(null);

		if (this.folded) {
			result.push(new Action('Unfold', () => {
				self.folded = false;
				return onDone(null);
			}));
		}
		else {
			result.push(new Action('Fold', () => {
				self.folded = true;
				return onDone(null);
			}));
		}

		result.push(null);
		result.push(new Action('New group', () => onDone(new CADGroup(NameProvider.GetName('Group'), self)), 'A group is a hiearchical item that can be used to organize objects.'));
		result.push(new Action('New plane', this.GetShapeCreator(() => new Plane(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, self), dataHandler, onDone)));
		result.push(new Action('New sphere', this.GetShapeCreator(() => new Sphere(new Vector([0, 0, 0]), 1, self), dataHandler, onDone)));
		result.push(new Action('New cylinder', this.GetShapeCreator(() => new Cylinder(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 1, 1, self), dataHandler, onDone)));
		result.push(new Action('New torus', this.GetShapeCreator(() => new Torus(new Vector([0, 0, 0]), new Vector([0, 0, 1]), 2, 1, self), dataHandler, onDone)));
		result.push(new ScanFromCurrentViewPointAction(this, dataHandler, onDone));
		
		return result;
    }

	private GetShapeCreator(creator: ShapeCreator, dataHandler: DataHandler, onDone: CADNodeHandler): Function {
		return function () {
			let shape = creator();
			shape.PrepareForDrawing(dataHandler.GetSceneRenderer().drawingcontext);
			onDone(shape);
		}
	}

	GetProperties(): Properties {
		let properties = super.GetProperties();

		let children = new NumberProperty('Children', this.children.length, null);
		children.SetReadonly();
		properties.Push(children);

		return properties;
	}
}