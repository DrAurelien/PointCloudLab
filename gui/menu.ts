/// <reference path="controls/hideablepannel.ts" />
/// <reference path="controls/toolbar.ts" />
/// <reference path="controls/fileopener.ts" />
/// <reference path="controls/button.ts" />
/// <reference path="controls/selectdrop.ts" />
/// <reference path="app.ts" />
/// <reference path="../controler/actions/cameracenter.ts" />
/// <reference path="../controler/actions/controlerchoice.ts" />


class Menu extends HideablePannel implements ActionsProvider, SelectionChangeHandler {
	toolbar: Toolbar;
	selectionActions: ComboBox;
	focusSelection: Button;

	constructor(private application: PCLApp) {
		super('MenuToolbar', HandlePosition.Bottom);

		this.toolbar = new Toolbar();
		this.container.AddControl(this.toolbar);

		let dataHandler = application.dataHandler;

		// ================================
		// Open a file
		this.toolbar.AddControl(new FileOpener(
			'[Icon:file-o]',
			function (createdObject: PCLNode) {
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
			},
			'Load data from a file'
		));

		// ================================
		// Save the current state
		this.toolbar.AddControl(new Button(new SimpleAction(
			'[Icon:save]',
			() => {
				application.SaveCurrentScene();
			},
			'Save the scene data to your browser storage (data will be automatically retrieved on next launch)'
		)));


		// ================================
		// Action for the current selection
		this.selectionActions = this.toolbar.AddControl(new ComboBox(
			'[Icon:bars]',
			this,
			() => {
				return application.dataHandler.selection && application.dataHandler.selection.Size() > 0;
			},
			'Contextual menu : list of actions available for the current selection.'
		)) as ComboBox;

		// ================================
		// Focus on the current selection
		this.focusSelection = this.toolbar.AddControl(new Button(new ActivableAction(
			'[Icon:crosshairs]',
			() => {
				application.FocusOnCurrentSelection();
			},
			() => {
				return application.CanFocus();
			},
			'Focus current viewpoint on the selected item'
		))) as Button;

		// ================================
		// Change the current mode
		this.toolbar.AddControl(new SelectDrop(
			'[Icon:desktop] Mode',
			[
				application.RegisterShortCut(new CameraModeAction(application)),
				application.RegisterShortCut(new TransformModeAction(application)),
				application.RegisterShortCut(new LightModeAction(application))
			],
			0,
			'Change the current working mode (how the mouse/keyboard are considered to interact with the scene)'
		));

		// ================================
		// Help menu
		this.toolbar.AddControl(new Button(new SimpleAction('[Icon:question-circle]', function () {
			window.open('help.html', '_blank');
		})));
	}

	Clear() {
		this.toolbar.Clear();
	}

	GetActions(): Action[] {
		return this.application.dataHandler.selection.GetActions(this.application);
	}

	OnSelectionChange(selection: SelectionList) {
		this.focusSelection.UpdateEnabledState();
		this.selectionActions.UpdateEnabledState();
	}
}