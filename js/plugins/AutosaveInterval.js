Game_System.prototype.autosaveInterval = function() {
  return [0, 1, 2, 3, 5, 10, 15, 30];
};

Game_System.prototype.getAutosaveInterval = function() {
  return this.autosaveInterval()[ConfigManager.autosaveInterval];
};

Game_System.prototype.setAutosaveInterval = function(minutes) {
  this._secUntilAutosave = minutes * 60;
};

Game_System.prototype.forceAutosave = function() {
  this._forceAutosave = true;
};

___Window_Options__prototype__statusText___ = Window_Options.prototype.statusText;
Window_Options.prototype.statusText = function(index) {
  var symbol = this.commandSymbol(index);
  var value = this.getConfigValue(symbol);
  if (symbol === 'autosaveInterval') {
    if (value == 0) return 'Never';
    return $gameSystem.autosaveInterval()[value] + ' minute' + (value > 1 ? 's' : '');
  } else {
    return ___Window_Options__prototype__statusText___.call(this, index);
  }
};

___Window_Options__prototype__changeValue___ = Window_Options.prototype.changeValue;
Window_Options.prototype.changeValue = function(symbol, value) {
  ___Window_Options__prototype__changeValue___.call(this, symbol, value);
  if (symbol === 'autosaveInterval') {
    $gameSystem.setAutosaveInterval($gameSystem.getAutosaveInterval());
  }
};
