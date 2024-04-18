/// <reference path="../../gui/controls/dialog.ts" />


class SetupFilter extends Action {
	static EDL = 'Eye Dome Lighting (EDL)';
	static NoFilter = 'None';

	constructor(private application: PCLApp) {
		super("[Icon:flash] Visual effect", "Setup visual effects for the scene rendering.");
	}

	protected Trigger() {
		let filter : DialogItems.Choice;
		let edlTitle : DialogItems.Title;
		let useColors : DialogItems.CheckBox;
		let expFactor : DialogItems.NumericValue;
		let nbhDist : DialogItems.NumericValue;
		let app = this.application;
		let currentFilter = app.GetCurrentRenderingFilter();
		let edlFilter = currentFilter as EDLFilter;

		let dialog = new Dialog((dlg : Dialog) => {
			let filterToUse = filter.GetValue();
			if(filterToUse == SetupFilter.EDL)
				app.ChangeRenderingFilter(ctx => { return new EDLFilter(ctx, useColors.GetValue(), expFactor.GetValue(), nbhDist.GetValue());});
			else
				app.ChangeRenderingFilter(null);
			return true;
		},
		(dialog) =>{
			return true;
		});

		function UpdateFieldsVisibility()
		{
			usesEDL = filter.GetValue() == SetupFilter.EDL;
			edlTitle.Show(usesEDL);
			useColors.Show(usesEDL);
			expFactor.Show(usesEDL);
			nbhDist.Show(usesEDL);
		}

		// -------------------------------------
		// EDL
		let usesEDL : boolean = !!edlFilter;
		filter = dialog.InsertChoice("Filter",  [SetupFilter.NoFilter, SetupFilter.EDL], edlFilter ? 1 : 0);
		edlTitle = dialog.InsertTitle("Eye Dome Lighting settings")
		useColors = dialog.InsertCheckBox("Use colors", edlFilter ? edlFilter.withColors : true);
		expFactor = dialog.InsertNumericValue("Exponential decay", edlFilter ? edlFilter.expFactor : 4);
		nbhDist = dialog.InsertNumericValue("Neighbors distance", edlFilter ? edlFilter.neighborDist : 0.25);
		UpdateFieldsVisibility();

		filter.OnValueChange(UpdateFieldsVisibility);
		
	}

	Enabled(): boolean {
		return true;
	}
}