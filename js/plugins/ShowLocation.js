___Game_Interpreter__prototype__pluginCommand___ = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    ___Game_Interpreter__prototype__pluginCommand___.call(this, command, args)
    if (command === 'ShowLocation') SceneManager._scene._mapNameWindow.showLocation(args);
};

Window_MapName.prototype.showLocation = function(args) {
    let text = '';
    for (var i = 0; i < args.length; ++i) {
      text = text + args[i] + ' ';
    }
    this._text = text;

    this.x = 0;
    this.y = Olivia.MapDisplayNameCore.YPosition.Starting;
    this._step = 'Fade In';
    this.opacity = 0;
    this.contentsOpacity = 0;
    this._showCount = 0;
    this.refresh();

    this.open();
};
