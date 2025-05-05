function Monster(resources,xPos,spriteName,speed,text,measure,result)
{
	this.x=xPos;
	this.sprite=resources.GetSprite(spriteName);
	this.sprite.SetState("normal");
	this.spriteSize=this.sprite.GetSize();
	this.speed=speed;
	this.y=-this.spriteSize[1];
	this.text=text;
	this.measure=measure;
	this.result=result;
}

Monster.prototype.IsDone=function()
{
	return this.sprite.IsDone();
}

Monster.prototype.GetSize=function()
{
	return this.sprite.GetSize();
}

Monster.prototype.GetTotalRect=function()
{
	var spriteSize=this.sprite.GetSize();

	var totW=0;
	var totX=0;
	var totY=this.y-this.measure[1];

	if(spriteSize[0]>this.measure[0])
	{
		totW=spriteSize[0];
		totX=this.x;
	}
	else
	{
		totW=this.measure[0];
		totX=this.x + (this.spriteSize[0]/2) - (this.measure[0]/2);
	}
	var totH=this.measure[1]+this.spriteSize[1]
	
	var rect=new Rect(totX,totY,totW,totH);

	return rect;
}


Monster.prototype.GetPos=function()
{
	return [this.x,this.y];
}


Monster.prototype.Update = function(dt)
{
	this.sprite.Update(dt);
	this.y += this.speed*dt;
}	

Monster.prototype.Render = function(ctx)
{
    ctx.save();
    ctx.translate(this.x,this.y);
    this.sprite.Render(ctx);
    ctx.restore();
	ctx.fillText(this.text, this.x + (this.spriteSize[0]/2) - (this.measure[0]/2),this.y);
}


