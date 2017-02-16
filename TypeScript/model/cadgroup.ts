class Group extends CADPrimitive {
    children: CADPrimitive[];
    folded: boolean;

    constructor(name: string) {
        super(name);
		this.children = [];
		this.folded = false;
    }

    Draw(drawingContext: DrawingContext): void {
        for (var index = 0; index < this.children.length; index++) {
            this.children[index].Draw(drawingContext);
        }

		if (this.selected) {
			var box = this.GetBoundingBox();
			box.Draw(drawingContext);
		}
    }

    RayIntersection(ray: Ray): Picking {
        let picked: Picking = null;
        for (var index = 0; index < this.children.length; index++) {
            if (this.children[index].visible) {
                let intersection = this.children[index].RayIntersection(ray);
                if (picked == null || intersection.Compare(picked) < 0) {
                    picked = intersection;
                }
            }
        }
        return picked;
    }

    Add(son: CADPrimitive): void {
        if (son.owner) {
            son.owner.Remove(son);
        }
        son.owner = this;
        this.children.push(son);
    }

    Remove(son: CADPrimitive): void {
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
            this.boundingbox.Add(this.children[index].GetBoundingBox().min);
            this.boundingbox.Add(this.children[index].GetBoundingBox().max);
        }
        return this.boundingbox;
    }

    Apply(proc: CADProcedure): boolean {
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

	GetChildren(): CADPrimitive[] {
		if (!this.folded) {
			return this.children;
		}
	}
}