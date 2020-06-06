/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/toolbar.ts" />
/// <reference path="controls/fileopener.ts" />
/// <reference path="controls/button.ts" />
/// <reference path="controls/selectdrop.ts" />
/// <reference path="app.ts" />
/// <reference path="../controler/actions/cameracenter.ts" />
/// <reference path="../controler/actions/controlerchoice.ts" />


class Menu extends HideablePannel implements ActionsProvider {
	toolbar: Toolbar;

	constructor(private application: PCLApp) {
		super('MenuToolbar', HandlePosition.Bottom);

		this.toolbar = new Toolbar();
		this.container.AddControl(this.toolbar);

		let dataHandler = application.dataHandler;

		this.toolbar.AddControl(new FileOpener('[Icon:file-o]', function (createdObject: PCLNode) {
			if (createdObject != null) {
				if (createdObject instanceof Scene) {
					dataHandler.ReplaceScene(createdObject);
				}
				else {
					let owner = dataHandler.GetNewItemOwner();
					owner.Add(createdObject);
					createdObject.NotifyChange(createdObject, ChangeType.NewItem);
				}

			}
		}, 'Load data from a file'));

		this.toolbar.AddControl(new Button('[Icon:save]', () => {
			application.SaveCurrentScene();
		}, 'Save the scene data to your browser storage (data will be automatically retrieved on next launch)'));

		this.toolbar.AddControl(new ComboBox('[Icon:bars]', this, 'Contextual menu : list of actions available for the current selection.'));

		this.toolbar.AddControl(new Button('[Icon:search]', () => {
			application.FocusOnCurrentSelection();
		},
			'Focus current viewpoint on the selected item'));

		this.toolbar.AddControl(new SelectDrop('[Icon:desktop] Mode', [
			application.RegisterShortCut(new CameraModeAction(application)),
			application.RegisterShortCut(new TransformModeAction(application)),
			application.RegisterShortCut(new LightModeAction(application))
		],
			0,
			'Change the current working mode (how the mouse/keyboard are considered to interact with the scene)'
		));

		this.toolbar.AddControl(new Button('[Icon:question-circle]', function () {
			window.open('help.html', '_blank');
		}));
	}

	Clear() {
		this.toolbar.Clear();
	}

	GetActions(): Action[] {
		return this.application.dataHandler.selection.GetActions(this.application);
	}
}