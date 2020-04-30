abstract class FileLoader {
	public result: CADNode;

	constructor() {
	}

	abstract Load(onDone : Function) : void;
}