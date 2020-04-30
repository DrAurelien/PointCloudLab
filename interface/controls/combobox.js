function ComboBox(label, options)
{
	var button = new Button(label, function() {
			Popup(button, options);
		}
	);
	
	return button;
}