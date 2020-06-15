class Random {
	static Uniform(start: number = 0, end: number = 1): number {
		let r = Math.random();
		return start + r * (end - start);
	}

	static Gaussian(mean: number = 0, sigma: number = 1): number {
		let x, y, u;
		//Box-muller transform
		do {
			x = Random.Uniform(-1, 1);
			y = Random.Uniform(-1, 1);
			u = x ** 2 + y ** 2;
		} while (u == 0 || u > 1);
		let r = x * Math.sqrt(-2 * Math.log(u) / u);
		return mean + r * sigma;
	}
}