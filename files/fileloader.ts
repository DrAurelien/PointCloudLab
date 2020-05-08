abstract class FileLoader {
	public result: PCLNode;

	constructor() {
	}

	abstract Load(onDone : Function) : void;
}