//=============================================================================
// AP_NameSaves
//=============================================================================
const maxNameLength = 32;

//=============================================================================
// Overrides
//=============================================================================

Window_SavefileList.prototype.drawFileId = function(id, x, y) {
    let text = '';
    if (id < this.maxItems()) {
        var saveNames = [];
        if ($gameVariables.value(74) !== 0) {
            saveNames = $gameVariables.value(74);
        } else {
            for (i = 1; i < this.maxItems(); i++) {
                saveNames[i] = "Save Slot " + i;
            }
            $gameVariables.setValue(74, saveNames);
        }
        text = saveNames[id];
    } else {
        text = 'Autosave';
    }
    this.drawText(text, x, y, this.width - 80);
};

var Window_SaveAction_makeCommandList = Window_SaveAction.prototype.makeCommandList;
Window_SaveAction.prototype.makeCommandList = function() {
    Window_SaveAction_makeCommandList.call(this);
    this.addCommand("Rename Save", 'rename', DataManager.loadSavefileInfo(this.savefileId()) && this.savefileId() < DataManager.maxSavefiles());
};

var Scene_File_createActionWindow = Scene_File.prototype.createActionWindow;
Scene_File.prototype.createActionWindow = function() {
    Scene_File_createActionWindow.call(this);
    this._actionWindow.setHandler('rename', this.onActionRename.bind(this));
};

Scene_File.prototype.onActionRename = function() {
    $gameTemp._saveFileId = SceneManager._scene._actionWindow._currentFile;
    $gameTemp._renamingSave = true;
    SceneManager.push(Scene_SaveFileRename);
};

Scene_File_performActionDelete = Scene_File.prototype.performActionDelete;
Scene_File.prototype.performActionDelete = function() {
    Scene_File_performActionDelete.call(this);
    var tempNameStorage = $gameVariables.value(74);
    var deletedSave = SceneManager._scene._actionWindow._currentFile + 1;
    tempNameStorage[deletedSave] = "Save Slot " + deletedSave;
    $gameVariables.setValue(74, tempNameStorage);
    this._listWindow.refresh();
};

//=============================================================================
// Scene_SaveFileRename
//=============================================================================

function Scene_SaveFileRename() {
    this.initialize.apply(this, arguments);
}

Scene_SaveFileRename.prototype = Object.create(Scene_Name.prototype);
Scene_SaveFileRename.prototype.constructor = Scene_SaveFileRename;

Scene_SaveFileRename.prototype.initialize = function() {
  Scene_Name.prototype.initialize.call(this);
};

Scene_SaveFileRename.prototype.createEditWindow = function() {
  this._editWindow = new Window_SaveFileRename($gameTemp._saveFileId, maxNameLength);
  this.addWindow(this._editWindow);
};

Scene_SaveFileRename.prototype.onInputOk = function() {
    var tempNameStorage = $gameVariables.value(74);
    tempNameStorage[this._editWindow.saveFileId()] = this._editWindow.name();
    $gameVariables.setValue(74, tempNameStorage);
    var globalInfo = DataManager.loadGlobalInfo();
    globalInfo[$gameTemp._saveFileId].timestamp2 = Date.now();
    DataManager.saveGlobalInfo(globalInfo);
    this.popScene();
};

//=============================================================================
// Window_SaveFileRename
//=============================================================================

function Window_SaveFileRename() {
    this.initialize.apply(this, arguments);
}

Window_SaveFileRename.prototype = Object.create(Window_Base.prototype);
Window_SaveFileRename.prototype.constructor = Window_SaveFileRename;

Window_SaveFileRename.prototype.initialize = function(saveFileId, maxLength) {
    var width = this.windowWidth();
    var height = this.windowHeight();
    var x = (Graphics.boxWidth - width) / 2;
    var y = (Graphics.boxHeight - (height + this.fittingHeight(9) + 8)) / 2;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._saveFileId = saveFileId;
    this._name = $gameVariables.value(74)[this._saveFileId];
    this._index = this._name.length;
    this._maxLength = maxLength;
    this._defaultName = "Save Slot " + this._saveFileId;
    this.deactivate();
    this.refresh();
};

Window_SaveFileRename.prototype.windowWidth = function() {
  return maxNameLength * 22.5;
};

Window_SaveFileRename.prototype.windowHeight = function() {
  return this.fittingHeight(4);
};

Window_SaveFileRename.prototype.name = function() {
  return this._name;
};

Window_SaveFileRename.prototype.saveFileId = function() {
    return this._saveFileId;
  };

Window_SaveFileRename.prototype.restoreDefault = function() {
  this._name = this._defaultName;
  this._index = this._name.length;
  this.refresh();
  return this._name.length > 0;
};

Window_SaveFileRename.prototype.add = function(ch) {
  if (this._index < this._maxLength) {
    this._name += ch;
    this._index++;
    this.refresh();
    return true;
  } else {
    return false;
  }
};

Window_SaveFileRename.prototype.back = function() {
  if (this._index > 0) {
    this._index--;
    this._name = this._name.slice(0, this._index);
    this.refresh();
    return true;
  } else {
    return false;
  }
};

Window_SaveFileRename.prototype.faceWidth = function() {
  return 0;
};

Window_SaveFileRename.prototype.charWidth = function() {
  var text = $gameSystem.isJapanese() ? '\uff21' : 'A';
  return this.textWidth(text);
};

Window_SaveFileRename.prototype.left = function() {
  var nameCenter = (this.contentsWidth() + this.faceWidth()) / 2;
  var nameWidth = (this._maxLength + 1) * this.charWidth();
  return Math.min(nameCenter - nameWidth / 2, this.contentsWidth() - nameWidth);
};

Window_SaveFileRename.prototype.itemRect = function(index) {
  return {
      x: this.left() + index * this.charWidth(),
      y: this.lineHeight() * 2.5,
      width: this.charWidth(),
      height: this.lineHeight()
  };
};

Window_SaveFileRename.prototype.underlineRect = function(index) {
  var rect = this.itemRect(index);
  rect.x++;
  rect.y += rect.height - 4;
  rect.width -= 2;
  rect.height = 2;
  return rect;
};

Window_SaveFileRename.prototype.underlineColor = function() {
  return this.normalColor();
};

Window_SaveFileRename.prototype.drawUnderline = function(index) {
  var rect = this.underlineRect(index);
  var color = this.underlineColor();
  this.contents.paintOpacity = 48;
  this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
  this.contents.paintOpacity = 255;
};

Window_SaveFileRename.prototype.drawChar = function(index) {
  var rect = this.itemRect(index);
  this.resetTextColor();
  this.drawText(this._name[index] || '', rect.x, rect.y, rect.width, 'center');
};

Window_SaveFileRename.prototype.refresh = function() {
  this.contents.clear();
  var lh = this.lineHeight();
  this.drawText("This save file will be renamed to:", 0, lh * 0.5, this.contents.width, 'center');
  for (var i = 0; i < this._maxLength; i++) {
    this.drawUnderline(i);
  }
  for (var j = 0; j < this._name.length; j++) {
    this.drawChar(j);
  }
  var rect = this.itemRect(this._index);
  this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
};