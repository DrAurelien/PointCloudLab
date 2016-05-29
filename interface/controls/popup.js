function Popup(owner, options)
{
	function GetPopup(owner)
	{
		var popup = document.getElementById('Popup');
		if(popup)
		{
			if(popup.owner === owner)
			{
				popup.parentNode.removeChild(popup);
				return null;
			}
			while(popup.firstChild)
			{
				popup.removeChild(popup.firstChild);
			}
		}
		else
		{
			var popup = document.createElement('div');
			popup.className = 'Popup';
			popup.id = 'Popup';
			document.body.appendChild(popup);
		}
		
		var rect = owner.getBoundingClientRect();
		popup.style.top = rect.bottom;
		popup.style.left = rect.left;
		popup.owner = owner;
		
		return popup;
	}
	
	function FillPopupList(popup)
	{
		for(var index=0; index<options.length; index++)
		{
			var item = document.createElement('div');
			item.className = 'PopupOption';
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
		}
		
		return popup;
	}
	
	
	var popup = GetPopup(owner);
	if(popup)
	{
		FillPopupList(popup);
	};
}