abstract class FileLoader {
	public result: PCLNode;

	constructor() {
		this.result = null;
	}

	abstract Load(onDone: Function): void;
}