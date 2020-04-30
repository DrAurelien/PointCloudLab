function ProgressBar()
{	
	this.control = document.createElement('div');
	this.control.className = 'ProgressControl';
	
	this.message = document.createElement('div');
	this.message.className = 'ProgressMessage';
	this.control.appendChild(this.message);
	
	this.container = document.createElement('div');
	this.container.className = 'ProgressContainer';
	this.control.appendChild(this.container);
	
	this.progress = document.createElement('div');
	this.progress.className = 'ProgressBar';
	this.container.appendChild(this.progress);
	
	this.lastupdate = null;
	this.refreshtime = 10;
	this.updatestep = 500;
}

ProgressBar.prototype.SetMessage = function(message)
{
	this.message.innerHTML = '';
	this.message.appendChild(document.createTextNode(message));
}

ProgressBar.prototype.Show = function()
{
	document.body.appendChild(this.control);
}

ProgressBar.prototype.Delete = function()
{
	if(this.control.parentNode)
	{
		this.control.parentNode.removeChild(this.control);
	}
}

ProgressBar.prototype.Update = function(current, total)
{
	var now = (new Date()).getTime();
	if(this.lastupdate == null || (now - this.lastupdate)>this.updatestep)
	{
		this.progress.style.width = (current/total)*this.container.scrollWidth;
		this.lastupdate = now;
		return true;
	}
	
	return false;
}