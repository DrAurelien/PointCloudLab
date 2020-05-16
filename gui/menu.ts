/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/toolbar.ts" />
/// <reference path="controls/fileopener.ts" />
/// <reference path="controls/button.ts" />
/// <reference path="controls/selectdrop.ts" />
/// <reference path="app.ts" />
/// <reference path="../controler/actions/cameracenter.ts" />
/// <reference path="../controler/actions/controlerchoice.ts" />


class Menu extends HideablePannel {
	toolbar: Toolbar;

	constructor(private ownerView: PCLApp) {
		super('MenuToolbar', HandlePosition.Bottom);

		this.toolbar = new Toolbar();
		this.container.AddControl(this.toolbar);

		let dataHandler = ownerView.dataHandler;
		let scene = dataHandler.scene;

		this.toolbar.AddControl(new FileOpener('[Icon:file-o]', function (createdObject: PCLNode) {
			if (createdObject != null) {
				let owner = dataHandler.GetNewItemOwner();
				owner.Add(createdObject);
				createdObject.NotifyChange(createdObject, ChangeType.Creation);

			}
		}, 'Load data from a file'));

		this.toolbar.AddControl(new Button('[Icon:save]', () => {
			let serializer = new PCLSerializer();
			scene.Serialize(serializer);
			FileExporter.ExportFile('Scene.pcld', serializer.GetBuffer(), 'model');
		}, 'Save the scene data to a file'));

		this.toolbar.AddControl(new Button('[Icon:search]', () => {
			ownerView.FocusOnCurrentItem();
		},
			'Focus current viewpoint on the selected item'));

		this.toolbar.AddControl(new SelectDrop('[Icon:desktop] Mode', [
			new CameraModeAction(ownerView),
			new TransformModeAction(ownerView),
			new LightModeAction(ownerView)
		],
			0,
			'Change the current working mode (changes the mouse input '
		));

		this.toolbar.AddControl(new Button('[Icon:question-circle]', function () {
			window.open('help.html', '_blank');
		}));
	}

	Clear() {
		this.toolbar.Clear();
	}
}