function ComboBox(label, options)
{
	var button = document.createElement('div');
	button.className = 'ComboButton';
	var buttonLabel = document.createTextNode(label);
	button.appendChild(buttonLabel);
	
	function CreateComboList()
	{
		var popup = document.createElement('div');
		popup.className = 'ComboList';
		var rect = this.getBoundingClientRect();
		popup.style.top = rect.bottom;
		popup.style.left = rect.left;
		for(var index=0; index<options.length; index++)
		{
			var item = document.createElement('div');
			item.className = 'ComboOption';
			var itemLabel = document.createTextNode(options[index].label);
			item.appendChild(itemLabel);
			
			//Javascript closure : create an object to avoid closure issues
			function ItemClicked(popup, callback)
			{
				this.popup = popup;
				this.callbackFunction = callback;
				this.Callback = function()
				{
					var self = this;
					return function()
					{
						//Call the functino
						self.callbackFunction();
						//Close the popup
						if(self.popup.parentNode)
						{
							self.popup.parentNode.removeChild(self.popup);
						}
					}
				}
			}
			
			item.onclick = new ItemClicked(popup, options[index].callback).Callback();
			popup.appendChild(item);
			document.body.appendChild(popup);
		}
		
		//Delete popup when clicking again
		button.onclick = function()
		{
			popup.parentNode.removeChild(popup);
			button.onclick = CreateComboList;
		}
	}
	
	button.onclick = CreateComboList;
	return button;
}