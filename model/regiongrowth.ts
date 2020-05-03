enum RegionGrowthStatus {
	unprocessed,
	enqueued,
	processed
}

class RegionGrowthIterator {
	private queue: Queue<number>;
	private lastUnprocessed: number;
	private regionIndex: number;
	public status: RegionGrowthStatus[];
	public currentRegion: number;
	public currentIndex: number;
	public currentNeighborhood: Neighbour[];

	constructor(private cloud: PointCloud, private k: number) {
		this.status = new Array<number>(this.Size());
		this.queue = new Queue<number>();
	}

	Reset() {
		let size = this.Size();
		for (let index = 0; index < size; index++) {
			this.status[index] = RegionGrowthStatus.unprocessed;
		}
		this.lastUnprocessed = 0;
		this.currentIndex = null;
		this.currentRegion = null;
		this.currentNeighborhood = null;
		this.regionIndex = 0;
		this.Enqueue(this.lastUnprocessed);
	}

	Size(): number {
		return this.cloud.Size()
	}

	End(): boolean {
		return this.lastUnprocessed >= this.Size();
	}

	LoadAndSpread() {
		this.currentRegion = this.regionIndex;
		this.currentIndex = this.queue.Dequeue();
		this.status[this.currentIndex] = RegionGrowthStatus.processed;

		//Enqueue current point neighbourhood
		this.currentNeighborhood = this.cloud.KNearestNeighbours(this.cloud.GetPoint(this.currentIndex), this.k);
		for (let ii = 0; ii < this.currentNeighborhood.length; ii++) {
			let nbhindex = this.currentNeighborhood[ii].index;
			if (this.status[nbhindex] == RegionGrowthStatus.unprocessed)
				this.Enqueue(nbhindex);
		}

		//If the queue is empty, enqueue the next point that has not been processed yet
		if (this.queue.Empty()) {
			this.regionIndex++;
			while (!this.End() && this.status[this.lastUnprocessed] !== RegionGrowthStatus.unprocessed)
				this.lastUnprocessed++;
			if (!this.End())
				this.Enqueue(this.lastUnprocessed);
		}
	}

	private Enqueue(index: number) {
		this.queue.Enqueue(index);
		this.status[index] = RegionGrowthStatus.enqueued;
	}
}


abstract class RegionGrowthProcess extends IterativeLongProcess {
	iterator: RegionGrowthIterator;

	constructor(private cloud: PointCloud, k: number, message: string) {
		super(cloud.Size(), message);
		this.iterator = new RegionGrowthIterator(cloud, k);
	}

	Initialize() {
		this.iterator.Reset();
	}

	get Done(): boolean {
		return this.iterator.End();
	}

	Iterate() {
		this.iterator.LoadAndSpread();
		this.ProcessPoint(this.cloud, this.iterator.currentIndex, this.iterator.currentNeighborhood, this.iterator.currentRegion);
	}

	Status(index: number): RegionGrowthStatus {
		return this.iterator.status[index];
	}

	abstract ProcessPoint(cloud: PointCloud, index: number, nbh: Neighbour[], region: number);
}