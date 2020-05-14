﻿/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/pannel.ts" />
/// <reference path="controls/dataitem.ts" />
/// <reference path="objects/pclnode.ts" />
/// <reference path="objects/pclgroup.ts" />
/// <reference path="objects/scene.ts" />
/// <reference path="app.ts" />
/// <reference path="opengl/renderer.ts" />
/// <reference path="../controler/actions/delegate.ts" />


class DataHandler extends HideablePannel {
	dataArea: Pannel;
	propertiesArea: Pannel;
	private currentItem: PCLNode;

	constructor(public scene: Scene, private ownerView: PCLApp) {
		super('DataWindow', HandlePosition.Right);

		//Data visualization
		this.dataArea = new Pannel('DataArea');
		this.AddControl(this.dataArea);
		this.dataArea.AddControl(new DataItem(this.scene, this));

		//Properties visualization
		this.propertiesArea = new Pannel('PropertiesArea');
		this.AddControl(this.propertiesArea);
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
		if (this.currentItem != null) {
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

	SetCurrentItem(item: PCLNode, focus: boolean = false) {
		this.HandlePropertiesWindowVisibility();
		if (item != this.currentItem) {
			if (this.currentItem) {
				this.propertiesArea.Clear();
				this.currentItem.ClearProperties();
				this.currentItem.Select(false);
			}

			this.currentItem = item;
			if (this.currentItem != null) {
				this.currentItem.Select(true);
				let currentProperties = this.currentItem.GetProperties();
				this.propertiesArea.AddControl(currentProperties);
			}
			this.HandlePropertiesWindowVisibility();
			if (focus) {
				this.ownerView.FocusOnCurrentItem();
			}
			else {
				this.ownerView.RefreshRendering();
			}
			this.RefreshColorScale(this.currentItem);
		}
	}

	RefreshColorScale(item: PCLNode) {
		if (item && (item instanceof PCLPointCloud)) {
			let cloud = item as PCLPointCloud;
			let field = cloud.GetCurrentField();
			if (field)
				ColorScale.Show().Refresh(field.Min(), field.Max());
			else
				ColorScale.Hide();
		}
		else
			ColorScale.Hide();
	}

	GetCurrentItem(): PCLNode {
		return this.currentItem;
	}

	GetNewItemOwner(): PCLContainer {
		let owner = (this.currentItem && this.currentItem.owner && !(this.currentItem instanceof LightsContainer)) ?
			this.currentItem :
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