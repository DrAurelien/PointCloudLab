/// <reference path="fileloader.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="../model/pointcloud.ts" />
/// <reference path="../model/mesh.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />
/// <reference path="../gui/objects/pclmesh.ts" />
/// <reference path="../gui/objects/pclgroup.ts" />

enum STLTokenType {
	Solid,
	Vertex,
	Normal,
	Facet,
	Outer,
	EndFacet,
	Loop,
	EndLoop,
	EndSolid,
	Unknown
}

//////////////////////////////////////////
// PLY File Loader
//////////////////////////////////////////
class StlLoader extends FileLoader {
	private reader: BinaryReader;

	static tokenmap : Map<string, STLTokenType>;

	constructor(content: ArrayBuffer) {
		super();
		this.reader = new BinaryReader(content);
	}

	private static GetTokenMap() {
		if (!StlLoader.tokenmap) {
			StlLoader.tokenmap = new Map<string, STLTokenType>();
			StlLoader.tokenmap["solid"] = STLTokenType.Solid;
			StlLoader.tokenmap["facet"] = STLTokenType.Facet;
			StlLoader.tokenmap["normal"] = STLTokenType.Normal;
			StlLoader.tokenmap["outer"] = STLTokenType.Outer;
			StlLoader.tokenmap["loop"] = STLTokenType.Loop;
			StlLoader.tokenmap["vertex"] = STLTokenType.Vertex;
			StlLoader.tokenmap["endloop"] = STLTokenType.EndLoop;
			StlLoader.tokenmap["endfacet"] = STLTokenType.EndFacet;
			StlLoader.tokenmap["endsolid"] = STLTokenType.EndSolid;
		}
		return StlLoader.tokenmap;
	}

	private GetNextToken() : STLTokenType
	{
		this.reader.IgnoreWhiteSpaces();
		let keyword = this.reader.GetAsciiWord(false);
		if(keyword === '')
			return null;
		let tokens = StlLoader.GetTokenMap();
		if(!(keyword in tokens))
			return STLTokenType.Unknown;
		return tokens[keyword];
	}

	private GetNextName() : string
	{
		return this.reader.GetAsciiWord(true);
	}

	private GetNextFloat() : number
	{
		let valuestr = this.reader.GetAsciiWord(true);
		if(valuestr === '')
			return null;
		return parseFloat(valuestr);
	}

	private GetNextCoords() : number[]
	{
		let coordinates : number[] = [];
		let coord = null;
		while((coord = this.GetNextFloat()) !== null)
			coordinates.push(coord);
		return coordinates;
	}

	Load(onloaded: FileLoaderResultHandler, onerror: FileLoaderErrorHandler) {
		try {
			let meshes : PCLMesh[] = [];
			while(!this.reader.Eof())
			{
				let mesh = this.ParseNextSolid();
				if(mesh)
					meshes.push(mesh);
			}
			let result : PCLGroup | PCLMesh;
			if(meshes.length > 0)
			{
				let group = new PCLGroup("STL file");
				for(let index=0; index<meshes.length; index++)
					group.Add(meshes[index]);
				result = group;
			}
			else if(meshes.length == 0)
			{
				result = meshes[0]
			}
			else
				throw 'No meshes loaded from STL file';

			onloaded(result);
		}
		catch (error) {
			onerror(error);
		}
	}

	private ParseNextSolid() : PCLMesh
	{
		let token = this.GetNextToken();
		if(token == null)
			return null;

		if(token !== STLTokenType.Solid)
			throw 'Unexpected STL token while loading STL solid.';

		let vertices = new PointCloud;
		let mesh = new Mesh(vertices);
		let pclMesh = new PCLMesh(mesh);
		pclMesh.name = this.GetNextName();

		while((token = this.GetNextToken()) !== null)
		{
			if(token === STLTokenType.EndSolid)
			{
				if(this.GetNextName() != pclMesh.name)
					throw 'STL architecture error : ending a solid that is not the current solid.';
				return pclMesh;
			}
			if(token !== STLTokenType.Facet)
				throw 'Unexpect STL token while parsing solid facets.';

			this.ParseNextFacet(mesh);
		}

		throw 'STL architecture error : endsolid has not been called.'
	}

	private ParseNextFacet(mesh : Mesh)
	{
		let token = this.GetNextToken();
		if(token !== STLTokenType.Normal)
			throw 'Facet normal is not provided.'
		let coords = this.GetNextCoords();
		if(coords.length != 3)
			throw 'Expected 3 coordinates for the facet normal, got ' + coords.length;
		let normal = new Vector(coords);
		normal.Normalize();

		if(this.GetNextToken() !== STLTokenType.Outer || this.GetNextToken() !== STLTokenType.Loop)
			throw 'Unexpect STL token while parsing facet.';

		let vertices : number[] = []
		while((token = this.GetNextToken()) !== null)
		{
			if(token == STLTokenType.EndLoop)
				break;

			if(token != STLTokenType.Vertex)
				throw 'Unexpect STL token while parsing facet loop.';

			let coords = this.GetNextCoords();
			if(coords.length != 3)
				throw 'Expected 3 coordinates for the facet vertex, got ' + coords.length;

			vertices.push(mesh.pointcloud.Size());
			mesh.pointcloud.PushPoint(new Vector(coords));
			mesh.pointcloud.PushNormal(normal);
		}
		if(this.GetNextToken() !== STLTokenType.EndFacet)
			throw 'STL architecture error : endfacet has not been called.'

		if(vertices.length != 3)
			throw 'Cannot suport non triangular STL meshes (got ' + vertices.length + ' vertices instead of 3)';

		mesh.PushFace(vertices);
	}
}