interface FileLoaderResultHandler {
	(node: PCLNode);
}

interface FileLoaderErrorHandler {
	(error: string);
}

abstract class FileLoader {
	constructor() {
	}

	abstract Load(onDone: FileLoaderResultHandler, onError: FileLoaderErrorHandler): void;
}