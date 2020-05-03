class QueueCell<T> {
	next: QueueCell<T>;

	constructor(public data: T) {
	}
}

class Queue<T> {
	head: QueueCell<T>;
	tail: QueueCell<T>;
	constructor() {
		this.head = null;
		this.tail = null;
	}

	Dequeue(): T {
		let result = this.head.data;
		this.head = this.head.next;
		if (!this.head)
			this.tail = null;
		return result;
	}

	Enqueue(data: T) {
		let cell = new QueueCell<T>(data);
		if (this.tail)
			this.tail.next = cell;
		else
			this.head = cell;
		this.tail = cell;
	}

	Empty(): boolean {
		return !this.head;
	}

	Clear() {
		this.head = null;
		this.tail = null;
	}
}