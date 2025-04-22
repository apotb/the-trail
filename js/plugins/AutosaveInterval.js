Game_System.prototype.autosaveInterval = function() {
    return [0, 1, 2, 3, 5, 10, 15, 30];
};

Game_System.prototype.getAutosaveInterval = function() {
    return this.autosaveInterval()[ConfigManager.autosaveInterval];
}

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