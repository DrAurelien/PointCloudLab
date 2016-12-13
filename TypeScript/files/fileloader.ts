abstract class FileLoader {
	public result: CADPrimitive;

	constructor() {
	}

	abstract Load(onDone : Function) : void;
}