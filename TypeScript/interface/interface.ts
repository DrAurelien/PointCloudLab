class Interface {
    sceneRenderer: Renderer;
    dataHandler: DataHandler;

    constructor(scene: Scene) {
        let appInterface: Interface = this;

        this.InitializeDataHandler(scene);
        this.InitializeRenderer(scene);

        window.onresize = function () {
            appInterface.Refresh(scene);
        }
        this.Refresh(scene);
    }

    private InitializeDataHandler(scene) {
        //Create a div to display the scene
        var dataVewing = document.createElement('div');
        dataVewing.className = 'DataWindow';
        document.body.appendChild(dataVewing);

        var self = this;
        this.dataHandler = new DataHandler(dataVewing, function () { self.Refresh(scene); }, scene);

        this.dataHandler.handle.onclick = function (event) {
            self.dataHandler.SwitchVisibility();
        }
    }

    InitializeRenderer(scene: Scene) {
        //Create a canvas to display the scene
        var sceneRenderingArea = document.createElement('canvas');
        sceneRenderingArea.className = 'SceneRendering';
        document.body.appendChild(sceneRenderingArea);
		
        //Create the scene handler
        let self: Interface = this;
        function Refresh(selectedItems) {
            self.dataHandler.currentItem = selectedItems;
            self.Refresh(scene);
        }
        this.sceneRenderer = new Renderer(sceneRenderingArea, Refresh, scene);
    }

    Refresh(scene: Scene): void {
        this.dataHandler.Resize(window.innerWidth, window.innerHeight);
        this.dataHandler.RefreshContent(scene);

        this.sceneRenderer.Resize(window.innerWidth, window.innerHeight);
        this.sceneRenderer.Draw(scene);
    }
}