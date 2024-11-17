/// <reference path="fileloader.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="binarywriter.ts" />
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
			let meshes : PCLMesh[];
			if(this.IsASCII())
				meshes = this.LoadASCII();
			else
				meshes = [this.LoadBinary()];
			if(meshes.length > 1)
				throw "Multiple solids not supported in STL files import";
			else if(meshes.length == 0)
				throw 'No meshes loaded from STL file';

			let result = meshes[0];
			result.mesh.ComputeOctree(onloaded(result));
		}
		catch (error) {
			onerror(error);
		}
	}

	IsASCII() : boolean
	{
		let firstWord = this.reader.GetNextAsciiStr(5, false) || '';
		return firstWord.toLowerCase() === 'solid';
	}

	LoadASCII() : PCLMesh[] 
	{
		let meshes : PCLMesh[] = [];
		while(!this.reader.Eof())
		{
			let mesh = this.ParseNextSolidASCII();
			if(mesh)
				meshes.push(mesh);
		}
		return meshes;
	}

	GetBinaryVector() : Vector {
		return new Vector([this.reader.GetNextFloat32(), this.reader.GetNextFloat32(), this.reader.GetNextFloat32()]);
	}

	LoadBinary() : PCLMesh 
	{
		this.reader.IgnoreBytes(80);

		let vertices = new PointCloud;
		let mesh = new Mesh(vertices);
		let pclMesh = new PCLMesh(mesh);

		let nbtriangles = this.reader.GetNextInt32();
		for(let index=0; index<nbtriangles; index++)
		{
			let normal = this.GetBinaryVector();
			normal.Normalize();
			for(let vertex=0; vertex < 3; vertex++)
			{
				vertices.PushPoint(this.GetBinaryVector());
				vertices.PushNormal(normal);
			}
			mesh.PushFace([3*index, 3*index+1, 3*index+2]);
			this.reader.IgnoreBytes(2);
		}

		return pclMesh;
	}

	private ParseNextSolidASCII() : PCLMesh
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

			this.ParseNextFacetASCII(mesh);
		}

		throw 'STL architecture error : endsolid has not been called.'
	}

	private ParseNextFacetASCII(mesh : Mesh)
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


class StlSerializer
{
	private writer : BinaryWriter;

	constructor(mesh : Mesh)
	{
		const bufferSize = StlSerializer.EvalBufferSize(mesh);
		this.writer = new BinaryWriter(bufferSize);
		let header = "PointCloudLab generated mesh";
		while(header.length < 80)
			header += ' ';
		this.writer.PushString(header);
		const nbTriangles = mesh.Size();
		this.writer.PushInt32(nbTriangles);
		for(let index=0; index<nbTriangles; index++)
		{
			let face = mesh.GetFace(index);
			this.WriteCoordsinates(face.Normal);
			for(let cursor=0; cursor<face.points.length; cursor++)
				this.WriteCoordsinates(face.points[cursor]);
			this.writer.PushUInt8(0);
			this.writer.PushUInt8(0);
		}
	}

	GetBuffer() : ArrayBuffer
	{
		return this.writer.buffer;
	}

	private WriteCoordsinates(coords: Vector)
	{
		for(let index=0; index<coords.Dimension(); index++)
			this.writer.PushFloat32(coords.Get(index));
	}

	private static EvalBufferSize(mesh: Mesh)
	{
		const nbTriangles = mesh.Size();
		return 80 // Stl header
			+ 4 // Number of Triangles
			+ nbTriangles * 50; // Normal (3*4 bytes) + 3 vertices (3*4 bytes each) + 2 bytes
	}
}