class Octree {
	private root: OctreeCell;
	private facescache: MeshFace[];

	constructor(private mesh: Mesh, public maxdepth = 10, public facespercell = 30) {
		let size = mesh.Size();
		this.facescache = new Array(size);
		for (let index = 0; index < size; index++) {
			this.facescache[index] = mesh.GetFace(index);
		}

		this.root = new OctreeCell(this, null, mesh.GetBoundingBox());
		this.root.Split();
	}

    RayIntersection(ray: Ray): Picking {
		let result = new Picking(this.mesh);
		if (this.root) {
			this.root.RayIntersection(ray, result);
		}
		return result;
	}

	GetFace(index: number): MeshFace {
		return this.facescache[index];
	}

	get NbFaces(): number {
		return this.facescache.length;
	}
}

class OctreeCell{
	depth : number;
	faces: number[];
	sons: OctreeCell[];

	constructor(public octree: Octree, public parent : OctreeCell, public boundingbox: BoundingBox)
	{
		let candidates: number[];
		if (parent) {
			this.depth = parent.depth + 1;
			candidates = parent.faces;
		}
		else {
			this.depth = 0;
			let size = octree.NbFaces;
			candidates = new Array(size);
			for (let index = 0; index < size; index++) {
				candidates[index] = index;
			}
		}

		this.faces = new Array(candidates.length);
		let nbfaces = 0;
		for (var index = 0; index < candidates.length; index++) {
			let face = octree.GetFace(candidates[index]);
			if (face.IntersectBox(this.boundingbox)) {
				this.faces[nbfaces] = candidates[index];
				nbfaces++;
			}
		}
		this.faces = this.faces.splice(nbfaces);

		this.sons = [];
	}

	Split(): boolean {
		if (this.depth >= this.octree.maxdepth || this.faces.length <= this.octree.facespercell) {
			return false;
		}
		let center = this.boundingbox.GetCenter();
		let min = this.boundingbox.min;
		let max = this.boundingbox.max;

		let boxes: BoundingBox[] = [];
		boxes.push(new BoundingBox(new Vector([min.Get(0), min.Get(1), min.Get(2)]), new Vector([center.Get(0), center.Get(1), center.Get(2)])));
		boxes.push(new BoundingBox(new Vector([center.Get(0), min.Get(1), min.Get(2)]), new Vector([max.Get(0), center.Get(1), center.Get(2)])));
		boxes.push(new BoundingBox(new Vector([min.Get(0), center.Get(1), min.Get(2)]), new Vector([center.Get(0), max.Get(1), center.Get(2)])));
		boxes.push(new BoundingBox(new Vector([min.Get(0), min.Get(1), center.Get(2)]), new Vector([center.Get(0), center.Get(1), max.Get(2)])));
		boxes.push(new BoundingBox(new Vector([center.Get(0), center.Get(1), min.Get(2)]), new Vector([max.Get(0), max.Get(1), center.Get(2)])));
		boxes.push(new BoundingBox(new Vector([min.Get(0), center.Get(1), center.Get(2)]), new Vector([center.Get(0), max.Get(1), max.Get(2)])));
		boxes.push(new BoundingBox(new Vector([center.Get(0), min.Get(1), center.Get(2)]), new Vector([max.Get(0), center.Get(1), max.Get(2)])));
		boxes.push(new BoundingBox(new Vector([center.Get(0), center.Get(1), center.Get(2)]), new Vector([max.Get(0), max.Get(1), max.Get(2)])));

		for (let index = 0; index < boxes.length; index++)
		{
			let son = new OctreeCell(this.octree, this, boxes[index]);
			son.Split();
			this.sons.push(son);
		}

		return true;
	}

    RayIntersection(ray: Ray, result: Picking) {
		let boxintersection = this.boundingbox.RayIntersection(ray);
		if (boxintersection.HasIntersection() && boxintersection.Compare(result) < 0) {
			let nbsons = this.sons.length;
			if (nbsons > 0) {
				for (let index = 0; index < nbsons; index++) {
					this.sons[index].RayIntersection(ray, result);
				}
			}
			else {
				for (var index = 0; index < this.faces.length; index++) {
					let face = this.octree.GetFace(this.faces[index]);
					let tt = face.LineFaceIntersection(ray);
					if (tt != null) {
						result.Add(tt);
					}
				}
			}
		}
	}
}