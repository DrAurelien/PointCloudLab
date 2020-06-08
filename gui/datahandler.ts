/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/pannel.ts" />
/// <reference path="controls/dataitem.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="objects/pclgroup.ts" />
/// <reference path="objects/selectionlist.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="app.ts" />
/// <reference path="opengl/renderer.ts" />
/// <reference path="../controler/actions/delegate.ts" />


class DataHandler extends HideablePannel implements SelectionChangeHandler {
	dataArea: Pannel;
	propertiesArea: Pannel;
	selection: SelectionList;
	currentProperties: Properties;

	constructor(public scene: Scene, private ownerView: PCLApp) {
		super('DataWindow', HandlePosition.Right);

		this.selection = new SelectionList(this);
		this.dataArea = new Pannel('DataArea');
		this.propertiesArea = new Pannel('PropertiesArea');

		this.AddControl(this.dataArea);
		this.dataArea.AddControl(new DataItem(scene, this));

		this.AddControl(this.propertiesArea);
	}

	ReplaceScene(scene: Scene) {
		this.scene = scene;
		this.propertiesArea.Clear();
		this.dataArea.Clear();
		this.dataArea.AddControl(new DataItem(scene, this));
		this.AskRendering();
	}

	Resize(width: number, height: number): void {
		let pannel = this.GetElement();
		pannel.style.height = (height - 2 * pannel.offsetTop) + 'px';
		this.RefreshSize();

		this.HandlePropertiesWindowVisibility();
	}

	HandlePropertiesWindowVisibility(): void {
		let pannel = this.GetElement();
		let dataArea = this.dataArea.GetElement();
		let propertiesArea = this.propertiesArea.GetElement();
		if (this.selection.GetProperties()) {
			let height: number = pannel.clientHeight / 2;
			dataArea.style.height = height + 'px';
			var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
			height -= delta;
			dataArea.style.height = height + 'px';
			propertiesArea.style.height = dataArea.style.height;
			dataArea.style.borderBottom = '1px solid lightGray';
			propertiesArea.style.borderTop = '1px solid darkGray';
		}
		else {
			let height: number = pannel.clientHeight;
			dataArea.style.height = height + 'px';
			var delta = dataArea.getBoundingClientRect().height - height; //because of margins and padding
			height -= delta;
			dataArea.style.height = height + 'px';
			propertiesArea.style.height = "0px";
			dataArea.style.borderBottom = '';
			propertiesArea.style.borderTop = '';
		}
	}

	DeclareNewItem(item: PCLNode) {
		this.selection.RegisterListenableItem(item);
	}

	OnSelectionChange(selection: SelectionList) {
		this.UpdateProperties();
		this.ownerView.RefreshRendering();
		this.RefreshColorScale();
	}

	FocusOnItem(item: PCLNode) {
		this.selection.SingleSelect(item);
		this.ownerView.FocusOnCurrentSelection();
	}

	UpdateProperties() {
		let properties = this.selection.GetProperties();
		if (this.currentProperties !== properties) {
			this.currentProperties = properties;
			this.propertiesArea.Clear();
			if (properties) {
				this.propertiesArea.AddControl(properties);
			}
		}
		if(properties) {
			properties.Refresh();
		}
		this.HandlePropertiesWindowVisibility();
	}

	RefreshColorScale() {
		let item = this.selection.GetSingleSelection();
		if (item && (item instanceof PCLPointCloud)) {
			let cloud = item as PCLPointCloud;
			let field = cloud.GetCurrentField();
			if (field)
				ColorScale.Show(field).Refresh();
			else
				ColorScale.Hide();
		}
		else
			ColorScale.Hide();
	}

	GetNewItemOwner(): PCLContainer {
		let item = this.selection.GetSingleSelection();
		let owner = (item && item.owner && !(item instanceof LightsContainer)) ?
			item :
			this.scene.Contents;
		if (owner instanceof PCLGroup)
			return owner as PCLGroup;
		return owner.owner;
	}

	GetSceneRenderer(): Renderer {
		return this.ownerView.sceneRenderer;
	}

	public GetActionsDelegate(): ActionDelegate {
		return this.ownerView;
	}

	AskRendering() {
		this.ownerView.RefreshRendering();
	}
}