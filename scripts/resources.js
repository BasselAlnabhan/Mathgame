function Sound(audio, volume) {
	this.audio = audio;
	this.volume = volume;
}

Sound.prototype.play = function (loop) {
	try {
		console.log("Attempting to play audio:", this.audio ? this.audio.src : "No audio source");
		console.log("Audio state - loop:", loop, "volume:", this.volume);

		if (!this.audio) {
			console.log("ERROR: Audio element is null or undefined");
			return;
		}

		this.audio.loop = loop;
		this.audio.volume = this.volume;
		var playPromise = this.audio.play();

		if (playPromise !== undefined) {
			playPromise.then(() => {
				console.log("Audio playing successfully:", this.audio.src);
			}).catch(function (error) {
				console.log("Audio play error:", error);
				// Auto-play was prevented, handle appropriately
			});
		}
	} catch (err) {
		console.log("Error playing sound:", err);
	}
}

Sound.prototype.stop = function () {
	try {
		this.audio.pause();
		this.audio.currentTime = 0;
	} catch (err) {
		console.log("Error stopping sound: ", err);
	}
}


Sound.prototype.clone = function () {
	return new Sound(this.audio.cloneNode(), this.volume);
}


function Resources() {
	this.xmlDoc;
	this.images = {};
	this.sprites = {};
	this.sounds = {};
	this.onReadyCallback;
	this.numImageNodes;
	this.numImagesLoaded;
	this.numSpriteNodes;
	this.numSpritesLoaded;
	this.numSoundNodes;
	this.numSoundsLoaded;
}


Resources.prototype.private_loadImage = function (_this, name, url) {
	var img = new Image();
	img.onload = function () {
		_this.images[name] = img;
		if (++_this.numImagesLoaded < _this.numImageNodes) return;
		for (var k in _this.images) {
			if (_this.images.hasOwnProperty(k) && !_this.images[k]) {
				return;
			}
		}
		_this.private_loadSprites(_this);

	};
	_this.images[name] = false;
	img.src = url;
}

Resources.prototype.private_loadImages = function () {
	var nodes = this.xmlDoc.evaluate("/resources/images/image", this.xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	this.numImageNodes = nodes.snapshotLength;
	this.numImagesLoaded = 0;

	for (var i = 0; i < this.numImageNodes; i++) {
		var imageNode = nodes.snapshotItem(i);
		var name = imageNode.getAttribute('name');
		var url = imageNode.getAttribute('url');
		this.private_loadImage(this, name, url);
	}
}

Resources.prototype.private_loadSpriteImage = function (_this, name, url) {
	var img = new Image();
	img.onload = function () {
		_this.sprites[name].image = img;
		if (++_this.numSpriteLoaded < _this.numSpriteNodes) return;
		for (var k in _this.sprites) {
			if (_this.sprites.hasOwnProperty(k) && !_this.sprites[k].image) {
				return;
			}
		}
		_this.private_loadSounds(_this);

	};
	_this.sprites[name].image = false;
	img.src = url;
}

Resources.prototype.private_loadSprites = function (_this) {
	var sprites = _this.xmlDoc.evaluate("/resources/sprites/sprite", _this.xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	_this.numSpritesNodes = sprites.snapshotLength;
	_this.numSpritesLoaded = 0;

	//		<sprite name="monster1" url="monster1.png" once="false" defaultstate="normal">
	//			<states>
	//				<state name="normal" xpos="0" ypos="0" width="224" height="170" cols="6" dir="horizontal" speed="6" frames="[0]">
	//			</states>
	//		</sprite>


	for (var i = 0; i < _this.numSpritesNodes; i++) {
		var spriteNode = sprites.snapshotItem(i);
		var name = spriteNode.getAttribute("name");
		var url = spriteNode.getAttribute("url");
		var once = spriteNode.getAttribute("once") != "false";
		var defaultState = spriteNode.getAttribute("defaultstate");

		var sprite = new Sprite(once);
		_this.sprites[name] = sprite;
		sprite.SetState(defaultState);
		var states = this.xmlDoc.evaluate("./states/state", spriteNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for (var s = 0; s < states.snapshotLength; s++) {
			var stateNode = states.snapshotItem(s);
			var stateName = stateNode.getAttribute("name");
			var stateXpos = stateNode.getAttribute("xpos");
			var stateYpos = stateNode.getAttribute("ypos");
			var stateWidth = stateNode.getAttribute("width");
			var stateHeight = stateNode.getAttribute("height");
			var stateCols = parseInt(stateNode.getAttribute("cols"));
			var stateDir = stateNode.getAttribute("dir");
			var stateSpeed = parseInt(stateNode.getAttribute("speed"));
			eval("stateFrames=" + stateNode.getAttribute("frames") + ";");

			var statePos = [parseInt(stateXpos), parseInt(stateYpos)];
			var stateSize = [parseInt(stateWidth), parseInt(stateHeight)];

			var state = new State(statePos, stateSize, stateCols, stateSpeed, stateFrames, stateDir);
			sprite.states[stateName] = state;

			//	function State(pos, size,cols, speed, frames, dir)

		}

		this.private_loadSpriteImage(_this, name, url);
	}
}

Resources.prototype.private_loadSound = function (_this, name, url, volume) {
	var audio = new Audio();
	var sound = new Sound(audio, volume);
	console.log("Loading sound:", name, url);

	// Check if OGG is supported
	var canPlayOgg = audio.canPlayType && audio.canPlayType('audio/ogg') !== '';
	if (url.endsWith('.ogg') && !canPlayOgg) {
		console.log("Warning: OGG format may not be supported in this browser");
	}

	audio.addEventListener('error', function (e) {
		console.log("Error loading audio file:", url, e);
		// Still mark as loaded to prevent the game from hanging
		_this.sounds[name] = sound;
		if (++_this.numSoundsLoaded >= _this.numSoundNodes) {
			console.log("All sounds loaded with some errors");
			_this.onReadyCallback();
		}
	}, false);

	audio.addEventListener('loadeddata', function () {
		console.log("Successfully loaded audio:", name, url);
		_this.sounds[name] = sound;
		if (++_this.numSoundsLoaded >= _this.numSoundNodes) {
			console.log("All sounds loaded successfully");
			_this.onReadyCallback();
		}
	}, false);

	_this.sounds[name] = false;

	// Add error handling for cross-browser compatibility
	try {
		audio.src = url;
		// Force the load to start
		audio.load();
	} catch (err) {
		console.log("Error setting audio source:", err);
		// Mark as loaded to prevent game from hanging
		_this.sounds[name] = sound;
		_this.numSoundsLoaded++;
	}
}

Resources.prototype.private_loadSounds = function (_this) {
	//		<sound name="music" volume="0.2" url="zoolook.ogg"/>


	var soundNodes = _this.xmlDoc.evaluate("/resources/sounds/sound", _this.xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	_this.numSoundNodes = soundNodes.snapshotLength;;
	_this.numSoundsLoaded = 0;

	for (var i = 0; i < _this.numSoundNodes; i++) {
		var soundNode = soundNodes.snapshotItem(i);
		var name = soundNode.getAttribute('name');
		var volume = parseFloat(soundNode.getAttribute('volume'));
		var url = soundNode.getAttribute('url');
		this.private_loadSound(_this, name, url, volume);
	}
}


Resources.prototype.LoadResources = function (xmlurl) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", xmlurl, false);
	xmlhttp.send();
	this.xmlDoc = xmlhttp.responseXML;
	this.private_loadImages();
}

Resources.prototype.OnReady = function (func) {
	this.onReadyCallback = func;
}

Resources.prototype.GetImage = function (name) {
	return this.images[name];
}

Resources.prototype.GetSprite = function (name) {
	var sprite = this.sprites[name];
	if (sprite) {
		return sprite.Clone();
	}
	//No return value will mean undef for caller
}

Resources.prototype.GetSpriteSize = function (name) {
	var sprite = this.sprites[name];
	if (sprite) {
		return sprite.GetSize();
	}
	//No return value will mean undef for caller
}

Resources.prototype.GetSound = function (name) {
	var sound = this.sounds[name];
	if (sound) {
		return sound.clone();
	}
	//No return value will mean undef for caller
}
