function Rect(x,y,w,h)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
}

function collides(x, y, r, b, x2, y2, r2, b2)
{
    return !(r <= x2 || x > r2 || b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
					pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function rectCollides(rect, rect2)
{
	return boxCollides([rect.x,rect.y],[rect.w,rect.h],[rect2.x,rect2.y],[rect2.w,rect2.h]);
}



function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var __measuretext_cache__=[];
function MeasureText(text, bold, font, size)
{
    // This global variable is used to cache repeated calls with the same arguments
    var str = text + ':' + bold + ':' + font + ':' + size;
    if (typeof(__measuretext_cache__) == 'object' && __measuretext_cache__[str]) {
        return __measuretext_cache__[str];
    }

    var div = document.createElement('DIV');
        div.innerHTML = text;
        div.style.position = 'absolute';
        div.style.top = '-100px';
        div.style.left = '-100px';
        div.style.fontFamily = font;
        div.style.fontWeight = bold ? 'bold' : 'normal';
        div.style.fontSize = size + 'pt';
    document.body.appendChild(div);
    
    var size = [div.offsetWidth, div.offsetHeight];

    document.body.removeChild(div);
    
    // Add the sizes to the cache as adding DOM elements is costly and can cause slow downs
    if (typeof(__measuretext_cache__) != 'object') {
        __measuretext_cache__ = [];
    }
    __measuretext_cache__[str] = size;
    
    return size;
}

function IsMP3Supported()
{
	var a = document.createElement('audio');
	return flag=!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
}

function IsOGGSupported()
{
	var a = document.createElement('audio');
	return flag=!!(a.canPlayType && a.canPlayType('audio/ogg;').replace(/no/, ''));
}