/// <reference path="fileloader.ts" />
/// <reference path="pclserializer.ts" />
/// <reference path="binaryreader.ts" />
/// <reference path="../tools/longprocess.ts" />
/// <reference path="../gui/objects/pclnode.ts" />
/// <reference path="../gui/objects/pclgroup.ts" />
/// <reference path="../gui/objects/pclpointcloud.ts" />
/// <reference path="../gui/objects/pclmesh.ts" />
/// <reference path="../gui/objects/pclplane.ts" />
/// <reference path="../gui/objects/pclsphere.ts" />
/// <reference path="../gui/objects/pclcylinder.ts" />
/// <reference path="../gui/objects/pclcone.ts" />
/// <reference path="../gui/objects/pcltorus.ts" />
/// <reference path="../gui/opengl/materials.ts" />


class PCLLoader extends FileLoader implements PCLObjectParsingFactory {
	parser: PCLParser;

	constructor(content: ArrayBuffer | string) {
		super();
		this.parser = new PCLParser(content, this);
	}

	Load(ondone: FileLoaderResultHandler, onError: FileLoaderErrorHandler) {
		try {
			this.parser.ProcessHeader();
			let result = this.parser.ProcessNextObject();
			if (!(result instanceof PCLNode)) {
				onError('The file content is not a valid node object.');
			}
			else if (!this.parser.Done()) {
				onError('The file does not contain a single root node.');
			}
			else {
				ondone(result);
			}
		}
		catch (error) {
			onError(error);
		}
	}

	GetHandler(objecttype): PCLObjectParsingHandler {
		if (Scene.SerializationID === objecttype) {
			return new SceneParsingHandler();
		}
		if (PCLGroup.SerializationID === objecttype) {
			return new PCLGroupParsingHandler();
		}
		if (Light.SerializationID === objecttype) {
			return new LightParsingHandler();
		}
		if (LightsContainer.SerializationID === objecttype) {
			return new LightsContainerParsingHandler();
		}
		if (PCLPointCloud.SerializationID === objecttype) {
			return new PCLPointCloudParsingHandler();
		}
		if (PCLMesh.SerializationID === objecttype) {
			return new PCLMeshParsingHandler();
		}
		if (PCLPlane.SerializationID === objecttype) {
			return new PCLPlaneParsingHandler();
		}
		if (PCLSphere.SerializationID === objecttype) {
			return new PCLSphereParsingHandler();
		}
		if (PCLCylinder.SerializationID === objecttype) {
			return new PCLCylinderParsingHandler();
		}
		if (PCLCone.SerializationID === objecttype) {
			return new PCLConeParsingHandler();
		}
		if (PCLTorus.SerializationID === objecttype) {
			return new PCLTorusParsingHandler();
		}
		if (Material.SerializationID === objecttype) {
			return new MaterialParsingHandler();
		}
		return null;
	}
}
