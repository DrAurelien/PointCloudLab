class LightsContainer extends CADGroup {
    constructor(name?: string, owner: CADGroup = null) {
        super(name || NameProvider.GetName('Lights'), owner);
    }

	GetActions(dataHandler: DataHandler, onDone: CADNodeHandler): Action[] {
		let self = this;
		let result: Action[] = super.GetActions(dataHandler, onDone);

		result.push(null);
		result.push(new Action('New light', this.GetShapeCreator(() => new Light(new Vector([0, 0, 0]), self), dataHandler, onDone)));
		
		return result;
    }

	private GetShapeCreator(creator: ShapeCreator, dataHandler: DataHandler, onDone: CADNodeHandler): Function {
		return function () {
			let shape = creator();
			shape.PrepareForDrawing(dataHandler.GetSceneRenderer().drawingcontext);
			onDone(shape);
		}
	}
}