class Scene {
    root: Group;

    constructor() {
        this.root = new Group("Scene");
    }

    Select(item: CADPrimitive): void {
		this.root.Apply(p => {
			p.selected = (p === item);
			return true;
		} );
    }

    Draw(drawingContext: DrawingContext): void {
		this.root.Draw(drawingContext);
    }
}