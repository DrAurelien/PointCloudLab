class Menu extends HideablePannel {
	toolbar: Toolbar;

	constructor(private ownerView : Interface)
	{
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

		let center = new CenterCameraAction(scene, ownerView);
		this.toolbar.AddControl(new Button('[Icon:video-camera] Center', () => {
			center.Run();
		},
		center.hintMessage));

		this.toolbar.AddControl(new SelectDrop('[Icon:desktop] Mode', [
				new CameraModeAction(ownerView),
				new TransformModeAction(ownerView),
				new LightModeAction(ownerView)
			],
			0,
			'Change the current working mode'
		));

		this.toolbar.AddControl(new Button('[Icon:question-circle] Help', function () {
			window.open('help.html', '_blank');
		}));
	}

	Clear() {
		this.toolbar.Clear();
	}
}