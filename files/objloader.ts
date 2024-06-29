/// <reference path="fileloader.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="../model/pointcloud.ts" />
/// <reference path="../model/mesh.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />
/// <reference path="../gui/objects/pclmesh.ts" />

enum OBJTokenType {
	Vertex,
	Face,
	Comment,
	Unknown
}

//////////////////////////////////////////
// PLY File Loader
//////////////////////////////////////////
class ObjLoader extends FileLoader {
	private reader: BinaryReader;
	private mesh : Mesh;
	private vertices : PointCloud;

	static tokenmap : Map<string, OBJTokenType>;

	constructor(content: ArrayBuffer) {
		super();
		this.reader = new BinaryReader(content);
		this.vertices = new PointCloud();
		this.mesh = new Mesh(this.vertices);
	}

	private static GetTokenMap() {
		if (!ObjLoader.tokenmap) {
			ObjLoader.tokenmap = new Map<string, OBJTokenType>();
			ObjLoader.tokenmap["v"] = OBJTokenType.Vertex;
			ObjLoader.tokenmap["f"] = OBJTokenType.Face;
			ObjLoader.tokenmap["#"] = OBJTokenType.Comment;
		}
		return ObjLoader.tokenmap;
	}

	private GetNextToken() : OBJTokenType
	{
		this.reader.IgnoreWhiteSpaces();
		let keyword = this.reader.GetAsciiWord(false);
		if(keyword === '')
			return null;
		let tokens = ObjLoader.GetTokenMap();
		if(!(keyword in tokens))
			return OBJTokenType.Unknown;
		return tokens[keyword];
	}

	private GetNextInt() : number
	{
		let valuestr = this.reader.GetAsciiWord(true);
		if(valuestr === '')
			return null;
		return parseInt(valuestr, 10);
	}

	private GetNextFloat() : number
	{
		let valuestr = this.reader.GetAsciiWord(true);
		if(valuestr === '')
			return null;
		return parseFloat(valuestr);
	}

	Load(onloaded: FileLoaderResultHandler, onerror: FileLoaderErrorHandler) {
		try {
			let token : OBJTokenType;
			while((token = this.GetNextToken()) !== null)
			{
				switch(token)
				{
					case OBJTokenType.Vertex:
						this.PushNewVertex();
						break;
					case OBJTokenType.Face:
						this.PushNewFace();
						break;
					case OBJTokenType.Comment:
					default:
						this.reader.GetAsciiLine();
						break;
				}
			}

			this.mesh.ComputeNormals((m: Mesh) => {
				m.ComputeOctree(onloaded(new PCLMesh(m)));
				return true;
			});
		}
		catch (error) {
			onerror(error);
		}
	}

	private PushNewVertex()
	{
		let coordinates : number[] = [];
		let coord = null;
		while((coord = this.GetNextFloat()) !== null)
			coordinates.push(coord);

		if(coordinates.length == 4)
		{
			let w = coordinates[3];
			if(w === 0)
				throw "Unexpected null homogeneous coordinate."
			for(let index=0; index<3; index++)
				coordinates[index] /= w;
			coordinates = coordinates.slice(0, 3);
		}
		if(coordinates.length < 3)
			throw "Expected 3 coordinates, got " + coordinates.length;

		return this.vertices.PushPoint(new Vector(coordinates));
	}

	private PushNewFace()
	{
		let indices : number[] = [];
		let index = null;
		while((index = this.GetNextInt()) !== null)
			indices.push(index - 1);
		return this.mesh.PushFace(indices);
	}
}