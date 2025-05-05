//	<state name="normal" xpos="0" ypos="0" width="224" height="170" cols="6" dir="horizontal" speed="6" frames="[0]">

	function State(pos, size,cols, speed, frames, dir)
	{
		this.pos = pos;
		this.size = size;
		this.cols = cols;
		this.speed = typeof speed === 'number' ? speed : 0;
		this.frames = frames;
		this.dir = dir || 'horizontal';
	}



	function Sprite(once)
	{
		this.currentState="";
		this.states={};		
		this._index = 0;
		this.image;
		this.once = once;
		this.done=false;
	};

	Sprite.prototype.IsDone=function()
	{
		return this.done;
	}


	Sprite.prototype.SetState = function(state)
	{
		this.currentState=state;
		this._index = 0;
	}

	Sprite.prototype.GetSize=function()
	{
		return this.states[this.currentState].size;
	}
	
	Sprite.prototype.Update = function(dt)
	{
		this._index += this.states[this.currentState].speed*dt;
	}	
	
	Sprite.prototype.Render = function(ctx) {
		var frame;

		if(this.states[this.currentState].speed > 0) {
			var max = this.states[this.currentState].frames.length;
			var idx = Math.floor(this._index);
			frame = this.states[this.currentState].frames[idx % max];

			if(this.once && idx >= max) {
				this.done = true;
				return;
			}
		}
		else {
			frame = 0;
		}

		var row=0;
		if (this.states[this.currentState].cols>0)
		{
			row=Math.floor(frame/this.states[this.currentState].cols);
			frame=frame % this.states[this.currentState].cols;
		}
		

		var x = this.states[this.currentState].pos[0];
		var y = this.states[this.currentState].pos[1];

		if(this.states[this.currentState].dir == 'vertical') {
			x += row * this.states[this.currentState].size[0];
			y += frame * this.states[this.currentState].size[1];
		}
		else {
			x += frame * this.states[this.currentState].size[0];
			y += row * this.states[this.currentState].size[1];
		}

		ctx.drawImage(this.image, x, y,this.states[this.currentState].size[0], this.states[this.currentState].size[1], 0, 0,this.states[this.currentState].size[0], this.states[this.currentState].size[1]);
	}	

	Sprite.prototype.Clone=function()
	{
		var destSprite=new Sprite(this.once);
		destSprite.currentState="";
		destSprite.states=this.states;
		destSprite._index=0;
		destSprite.image=this.image;
		destSprite.done=false;
		return destSprite;
	}
