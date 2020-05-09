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

		this.toolbar.AddControl(new FileOpener('[Icon:file-o] Open', function (createdObject) {
			if (createdObject != null) {
				scene.Contents.Add(createdObject);
				scene.Select(createdObject);
				dataHandler.currentItem = createdObject;
				dataHandler.NotifyChange();
			}
		}, 'Load data from a file'));

		this.toolbar.AddControl(new Button('[Icon:video-camera] Center', () => {
			ownerView.FocusOnCurrentItem();
		},
			'Foxus current viewpoint on the selected item'));

		this.toolbar.AddControl(new SelectDrop('[Icon:desktop] Mode', [
			new CameraModeAction(ownerView),
			new TransformModeAction(ownerView),
			new LightModeAction(ownerView)
		],
			0,
			'Change the current working mode (changes the mouse input '
		));

		this.toolbar.AddControl(new Button('[Icon:question-circle] Help', function () {
			window.open('help.html', '_blank');
		}));
	}

	Clear() {
		this.toolbar.Clear();
	}
}