/// <reference path="../../gui/controls/dialog.ts" />


class SetupFilter extends Action {
	static EDL = 'Eye Dome Lighting (EDL)';
	static NoFilter = 'None';
	static EDLNoColor = 'No color';
	static EDLFlatColor = 'Flat color';
	static EDLShadedColor = 'Shaded color';

	constructor(private application: PCLApp) {
		super("[Icon:flash] Visual effect", "Setup visual effects for the scene rendering.");
	}

	protected Trigger() {
		let filter : DialogItems.Choice;
		let selectionSettingsTitle : DialogItems.Title;
		let edlSettingsTitle : DialogItems.Title;
		let showSelectionBox : DialogItems.CheckBox;
		let useGlowFilter : DialogItems.CheckBox;
		let edlColors : DialogItems.Choice;
		let expFactor : DialogItems.NumericValue;
		let nbhDist : DialogItems.NumericValue;
		let app = this.application;
		let initialFilter = app.GetCurrentRenderingFilter();
		let initialState ={
			filter : initialFilter ? initialFilter.Clone() : null,
			showSelectionBox : app.sceneRenderer.drawingcontext.showselectionbbox
		};
		let edlFilter = initialState.filter instanceof EDLFilter ? initialState.filter as EDLFilter : null;
		let glowFilter = initialState.filter instanceof GlowFilter ? initialState.filter as GlowFilter : null;

		function ApplyCurrentSettings()
		{
			let filterToUse = filter.GetValue();
			if(filterToUse == SetupFilter.EDL)
			{
				app.ChangeRenderingFilter(ctx => { 
					ctx.showselectionbbox = showSelectionBox.GetValue();
					let colorOption = edlColors.GetValue();
					let edlUseColors = colorOption != SetupFilter.EDLNoColor;
					let edlUseShading = colorOption == SetupFilter.EDLShadedColor;
					return new EDLFilter(ctx, edlUseColors, edlUseShading, expFactor.GetValue(), nbhDist.GetValue());
				});
			}
			else
			{
				app.ChangeRenderingFilter(ctx => {
					ctx.showselectionbbox = showSelectionBox.GetValue();
					return useGlowFilter.GetValue() ? new GlowFilter(ctx) : null;
				});
			}
		};

		function UpdateFieldsVisibility()
		{
			usesEDL = filter.GetValue() == SetupFilter.EDL;
			useGlowFilter.Show(!usesEDL);
			edlSettingsTitle.Show(usesEDL);
			edlColors.Show(usesEDL);
			expFactor.Show(usesEDL);
			nbhDist.Show(usesEDL);
		}

		let dialog = new Dialog((dlg : Dialog) => {
			ApplyCurrentSettings();
			return true;
		},
		(dlg : Dialog) =>{
			app.ChangeRenderingFilter(ctx => {
				ctx.showselectionbbox = initialState.showSelectionBox;
				return initialState.filter;
			});
			return true;
		});

		let usesEDL : boolean = !!edlFilter;
		let usesGlow :boolean = !!glowFilter;
		filter = dialog.InsertChoice("Filter",  [SetupFilter.NoFilter, SetupFilter.EDL], edlFilter ? 1 : 0);

		selectionSettingsTitle = dialog.InsertTitle("Selection display settings");
		showSelectionBox = dialog.InsertCheckBox("Show selection bounding box", initialState.showSelectionBox);
		useGlowFilter = dialog.InsertCheckBox("Glow selection", usesGlow);

		let currentEDLColor = 0;
		if(edlFilter)
		{
			if(edlFilter.withShading)
				currentEDLColor = 2;
			else if(edlFilter.withColors)
				currentEDLColor = 1;
		}
		edlSettingsTitle = dialog.InsertTitle("Eye Dome Lighting settings");
		edlColors = dialog.InsertChoice("Use colors", [SetupFilter.EDLNoColor, SetupFilter.EDLFlatColor, SetupFilter.EDLShadedColor], currentEDLColor);
		expFactor = dialog.InsertNumericValue("Exponential decay", edlFilter ? edlFilter.expFactor : 6);
		nbhDist = dialog.InsertNumericValue("Neighbors distance", edlFilter ? edlFilter.neighborDist : 0.15);
		UpdateFieldsVisibility();

		let settings : DialogItems.IDialogValue[]= [
			filter,
			showSelectionBox,
			useGlowFilter,
			edlColors,
			expFactor,
			nbhDist];
		for(let index=0; index<settings.length; index++)
		{
			settings[index].OnValueChange((item:DialogItems.DialogItem) => {
				UpdateFieldsVisibility();
				ApplyCurrentSettings()
			});
		}
		
	}

	Enabled(): boolean {
		return true;
	}
}