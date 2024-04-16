interface IRenderingTypeListener
{
	OnRenderingTypeChange(renderingType : RenderingType);
}

class RenderingType {
	value: number = 0;
	listeners : IRenderingTypeListener[];

	constructor() {
		this.listeners = [];
		this.Surface(true);
	}

	Point(activate?: boolean): boolean {
		return this.Set(activate, 1);
	}

	Wire(activate?: boolean): boolean {
		return this.Set(activate, 2);
	}

	Surface(activate?: boolean): boolean {
		return this.Set(activate, 4);
	}

	Register(listener: IRenderingTypeListener)
	{
		this.listeners.push(listener);
	}

	Unregister(listener : IRenderingTypeListener)
	{
		let index = this.listeners.indexOf(listener);
		if(index>=0 && index<= this.listeners.length)
			this.listeners.splice(index, 1);
	}

	private Set(activate: boolean, base: number): boolean {
		let formerState = this.Get(base);
		if (activate === true) {
			this.value = this.value | base;
		}
		else if (activate === false) {
			this.value = this.value ^ base;
		}
		let currentState = this.Get(base);
		if(formerState !== currentState)
		{
			for(let index=0; index<this.listeners.length; index++)
				this.listeners[index].OnRenderingTypeChange(this);
		}
		return currentState;
	}

	private Get(base: number) : boolean
	{
		return ((this.value & base) != 0);
	}
}