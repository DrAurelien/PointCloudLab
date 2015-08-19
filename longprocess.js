function LongProcess(message, iteration, ondone)
{
	var progress = new ProgressBar();
	progress.SetMessage(message);
	progress.Show();
	
	function RunInternal()
	{
		var state;
		while((state = iteration()) != null)
		{
			if(progress.Update(state.current, state.total))
			{
				setTimeout(RunInternal, progress.refreshtime);
				return false;
			}
		}
		
		if(ondone)
		{
			setTimeout(ondone, progress.refreshtime);
		}
		progress.Delete();
		return true;
	}
	
	setTimeout(RunInternal, progress.refreshtime);
}