class CADPrimitivesContainer extends CADGroup {
    constructor(name?: string, owner: CADGroup = null) {
        super(name || NameProvider.GetName('Group'), owner);
    }
	
	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let self = this;
		let result: Action[] = super.GetActions(dataHandler, onDone);

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

	IsScannable(): boolean {
		return !this.Apply(p => !(p instanceof Shape || p instanceof Mesh));
	}
}