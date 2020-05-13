interface Container extends Control {
	AddControl(control: Control);
	RemoveControl(control: Control);
	Clear();
}