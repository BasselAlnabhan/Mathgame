function Explosion(resources,pos,spriteName)
{
	this.pos=pos;
	this.sprite=resources.GetSprite(spriteName);
	this.sprite.SetState("normal");
}

Explosion.prototype.IsDone=function()
{
	return this.sprite.IsDone();
}

Explosion.prototype.GetSize=function()
{
	return this.sprite.GetSize();
}

Explosion.prototype.GetPos=function()
{
	return this.pos;
}

Explosion.prototype.SetPos=function(pos)
{
	this.pos=pos;
}


Explosion.prototype.Update = function(dt)
{
	this.sprite.Update(dt);
}	

Explosion.prototype.Render = function(ctx)
{
    ctx.save();
    ctx.translate(this.pos[0],this.pos[1]);
    this.sprite.Render(ctx);
    ctx.restore();
}


