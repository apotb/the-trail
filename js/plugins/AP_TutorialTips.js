//=============================================================================
/*:
 * @author NoLongerLucky
 * @plugindesc Requires SRD_PreloaderCore, Olivia_MetaControls. Overrides Scene_Preload, Window_TitleCommand, Scene_Title. Adds Window_TipsPage.
 */
//=============================================================================

const tips = require('./data/Strings.json').tips;
tips[19] = "There's a total of " + tips.length + " Tutorial Tips that you can see here. Have you seen all of them?"; // tips.length is first defined with the .json file, so it cannot be used initially

pushSeen = [];

const FONT_SIZE = 22;

//=============================================================================
// Scene_Preload
//=============================================================================

Scene_Preload.prototype.create = function() {
	Scene_Base.prototype.create.call(this);
	this.createBackground();
	this.createSubtitle();
	this.createTip();
	ImageManager.clear();
};

Scene_Preload.prototype.createTip = function() {
	this._tipHeight = Graphics.boxHeight;
	this._tip = new Sprite(new Bitmap(Graphics.boxWidth, this._tipHeight));
	this._tip.bitmap.fontSize = FONT_SIZE;
	this._tip.y = -400;
	this._tip.move = 0;
	this._tip.tipSpeed = 1.1; // speed that tutorial tip slides in/out
	this._tip.tipWait = 4000; // wait time between sliding tip in/out and refreshing tip
	this.addChild(this._tip);
	setTimeout(() => {  this.newTip(); }, 750);
}

Scene_Preload.prototype.newTip = function() {
	this._tip.chosenTip = Math.floor(Math.random() * tips.length);
    pushSeen[this._tip.chosenTip] = true;
	this._tip.y = -400;
	this._tip.move = 0;
	this.drawTipIn();
}

Scene_Preload.prototype.refreshTip = function() {
	this._tip.bitmap.clear();
	this._tip.bitmap.drawText("TUTORIAL TIP", 0, -30, Graphics.boxWidth, this._tipHeight, 'center');
	this._tip.bitmap.drawText("#" + (this._tip.chosenTip + 1) + ": " + tips[this._tip.chosenTip], 0, 0, Graphics.boxWidth, this._tipHeight, 'center');
}

Scene_Preload.prototype.drawTipIn = function() {
	this._tip.move++;
	if (this._tip.move < 250) {
		this._tip.y += (this._tip.tipSpeed / (this._tip.move * 0.04));
		this.refreshTip();
		setTimeout(() => {  this.drawTipIn(); }, 1);
	} else {
		this._tip.move = 0;
		setTimeout(() => {  this.drawTipOut(); }, this._tip.tipWait);
	}
}

Scene_Preload.prototype.drawTipOut = function () {
	this._tip.move++;
	if (this._tip.move < 250) {
		this._tip.y -= (this._tip.tipSpeed / (this._tip.move * 0.04));
		this.refreshTip();
		setTimeout(() => {  this.drawTipOut(); }, 1);
	} else {
		this._tip.move = 0;
		setTimeout(() => {  this.newTip(); }, this._tip.tipWait / 4);
    }
}

//=============================================================================
// Window_TitleCommand
//=============================================================================

_Window_TitleCommand_makeCommandList =
  Window_TitleCommand.prototype.makeCommandList;
Window_TitleCommand.prototype.makeCommandList = function() {
  _Window_TitleCommand_makeCommandList.call(this);
  var index = this.findSymbol('tips');
  var text = "Tutorial Tips";
  var enabled = true;
  this.addCommandAt(index, text, 'tips', enabled);
};

//=============================================================================
// Window_TipsPage
//=============================================================================

function Window_TipsPage() {
    this.initialize.apply(this, arguments);
}

Window_TipsPage.prototype = Object.create(Window_Command.prototype);
Window_TipsPage.prototype.constructor = Window_TipsPage;

Window_TipsPage.prototype.initialize = function() {
  Window_Command.prototype.initialize.call(this, 0, 0);
  this.updatePlacement();
  this.openness = 0;
};

Window_TipsPage.prototype.windowWidth = function() {
  return SceneManager._scene._commandWindow.width;
};

Window_TipsPage.prototype.maxCols = function() {
    return SceneManager._scene._commandWindow.maxCols() * 3;
};

Window_TipsPage.prototype.updatePlacement = function() {
    this.x = SceneManager._scene._commandWindow.x;
    this.y = (SceneManager._scene._commandWindow.y / 4) + this.lineHeight();
};

Window_TipsPage.prototype.itemTextAlign = function() {
    return 'center';
};

Window_TipsPage.prototype.makeCommandList = function() {
  for (var i = 0; i < tips.length; ++i) {
    var text = "#" + (i + 1);
    if (!text) continue;
    if (text === '') continue;
    if (seen[i] !== true) {
        this.addCommand(text, '', false);
    } else {
        this.addCommand(text, 'ok', true, i);
    }
  }
};

Window_TipsPage.prototype.drawItem = function(index) {
  var rect = this.itemRectForText(index);
  var align = this.itemTextAlign();
  var text = this.commandName(index);
  this.resetTextColor();
  this.changePaintOpacity(this.isCommandEnabled(index));
  this.drawText(text, rect.x, rect.y, rect.width, align);
};

Window_TipsPage.prototype.playOkSound = function() {
  if (this.currentExt() !== '') SoundManager.playOk();
};

//=============================================================================
// Scene_Title
//=============================================================================

var _Scene_Title_createCommandWindow = 
    Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow = function() {
    _Scene_Title_createCommandWindow.call(this);
    this.createTipsWindow();
    this.createTip();
    this._commandWindow.setHandler('tips',  this.commandTips.bind(this));
}

Scene_Title.prototype.createTipsWindow = function() {
    this._tipsWindow = new Window_TipsPage();
    this._tipsWindow.setHandler('cancel', this.onTipsCancel.bind(this));
    this._tipsWindow.setHandler('ok', this.onTipsOk.bind(this));
    this.addWindow(this._tipsWindow);
}

Scene_Title.prototype.commandTips = function() {
    this._tipsWindow.select(0);
    this._tipsWindow.activate();
    this._tipsWindow.open();
    this._titleSprite.visible = false;
}

Scene_Title.prototype.onTipsCancel = function() {
    this._tipsWindow.close();
    this._tip.bitmap.clear();
    this._commandWindow.activate();
    this._commandWindow.open();
    this._titleSprite.visible = true;
}

Scene_Title.prototype.onTipsOk = function() {
    this._tipsWindow.activate();
    this.newTip(this._tipsWindow.currentExt());
}

Scene_Title.prototype.createTip = function() {
	this._tipHeight = Graphics.boxHeight;
	this._tip = new Sprite(new Bitmap(Graphics.boxWidth, this._tipHeight));
	this._tip.bitmap.fontSize = FONT_SIZE;
	this._tip.y = -250;
	this.addChild(this._tip);
}

Scene_Title.prototype.newTip = function(tipId) {
	this._tip.chosenTip = tipId;
	this._tip.bitmap.clear();
	this._tip.bitmap.drawText("TUTORIAL TIP", 0, -30, Graphics.boxWidth, this._tipHeight, 'center');
	this._tip.bitmap.drawText("#" + (this._tip.chosenTip + 1) + ": " + tips[this._tip.chosenTip], 0, 0, Graphics.boxWidth, this._tipHeight, 'center');
}

// seen array calculation

var Scene_Title_initialize = Scene_Title.prototype.initialize;
Scene_Title.prototype.initialize = function() {
    Scene_Title_initialize.call(this);
    this.calcSeen();
}

Scene_Title.prototype.calcSeen = function() {
    if ($gameVariables.value(73) == 0) {
        pullSeen = [];
    } else {
        pullSeen = $gameVariables.value(73);
    }
    for (i = 0; i < pushSeen.length; i++) {
        if (pullSeen[i] !== true) {
            pullSeen[i] = pushSeen[i];
        }
    }
    seen = pullSeen;
    $gameVariables.setValue(73, pullSeen);
}
